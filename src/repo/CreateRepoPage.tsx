import {
    Checkbox,
    IStackTokens,
    ITextFieldStyles,
    mergeStyleSets,
    PrimaryButton,
    Stack,
    TextField,
} from '@fluentui/react';
import { useBoolean } from '@fluentui/react-hooks';
import { GitProgressEvent } from 'isomorphic-git';
import React, { useCallback, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useDebounce } from 'react-use';
import { createAndSelectRepo } from '../git/commands';
import { useGitRemote } from '../git/GitRemoteProvider';
import { useRepos } from '../git/RepoProvider';
import { useNavLockCallback } from '../NavLockProvider';
import { ProgressModal } from '../ProgressModal';
import { Section, SectionHeader } from '../Section';
import { CONTROL_WIDTH } from '../styles';
import { CloneState, getProgressDetails } from './CloneProgress';

const classNames = mergeStyleSets({
    actions: {
        marginTop: 28,
    },
});

const stackTokens: IStackTokens = {
    childrenGap: 20,
};

const textFieldStyles: Partial<ITextFieldStyles> = {
    fieldGroup: {
        width: CONTROL_WIDTH,
    },
};

const DEBOUNCE_MS = 200;

export const CreateRepoPage: React.FunctionComponent = () => {
    const repos = useRepos();
    const remote = useGitRemote();
    const history = useHistory();
    const [name, setName] = useState('zmk-config');
    const [isPrivate, { toggle: toggleIsPrivate }] = useBoolean(false);
    const [repoExists, setRepoExists] = useState(false);

    const [state, setState] = useState(CloneState.Default);
    const [error, setError] = useState<string>();
    const [progress, setProgress] = useState<GitProgressEvent>();

    const createRepo = useNavLockCallback(async () => {
        if (!name || repoExists) {
            return;
        }

        try {
            setState(CloneState.Cloning);
            await createAndSelectRepo(repos, remote, name, isPrivate, setProgress);
            setState(CloneState.Done);
        } catch (error) {
            setState(CloneState.Error);
            setError(error.toString());
        }
    }, [repos, remote, name, isPrivate, repoExists, setState, setProgress]);

    const onDismissModal = useCallback(() => {
        if (state === CloneState.Done) {
            history.push('/repo/current');
        } else {
            setState(CloneState.Default);
            setProgress(undefined);
        }
    }, [history, state]);

    const { percentComplete, progressText, isComplete } = useMemo(
        () => getProgressDetails(state, progress),
        [state, progress],
    );

    useDebounce(
        async () => {
            if (name) {
                const repo = await remote.getRepo(name);
                setRepoExists(repo !== undefined);
            } else {
                setRepoExists(false);
            }
        },
        DEBOUNCE_MS,
        [name],
    );

    let errorMessage: string | undefined;
    if (repoExists) {
        errorMessage = 'A repository with this name already exists.';
    } else if (!name) {
        errorMessage = 'Enter a repository name.';
    }

    return (
        <>
            <Section>
                <SectionHeader>Create a new repo</SectionHeader>
                <p>Enter a name for your new ZMK config repo. We&apos;ll do the rest.</p>
                <Stack tokens={stackTokens}>
                    <TextField
                        label="Name"
                        value={name}
                        autoComplete="off"
                        onChange={(ev, newValue) => setName(newValue || '')}
                        styles={textFieldStyles}
                        errorMessage={errorMessage}
                    />
                    <Checkbox label="Make repo private" checked={isPrivate} onChange={toggleIsPrivate} />
                </Stack>

                <Stack horizontal className={classNames.actions}>
                    <PrimaryButton text="Create repo" disabled={!!errorMessage} onClick={createRepo} />
                </Stack>
            </Section>

            <ProgressModal
                isOpen={state !== CloneState.Default}
                isComplete={isComplete || !!error}
                title={`Creating ${name}`}
                progressLabel={progressText}
                percentComplete={percentComplete}
                errorText={error}
                onDismiss={onDismissModal}
            />
        </>
    );
};
