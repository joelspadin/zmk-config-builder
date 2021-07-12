import { ITextFieldStyles, mergeStyleSets, PrimaryButton, Stack, TextField } from '@fluentui/react';
import React, { useState } from 'react';
import { useDebounce } from 'react-use';
import { useGitRemote } from '../git/GitRemoteProvider';
import { Section, SectionHeader } from '../Section';
import { CONTROL_WIDTH } from '../styles';

const classNames = mergeStyleSets({
    actions: {
        marginTop: 28,
    },
});

const textFieldStyles: Partial<ITextFieldStyles> = {
    fieldGroup: {
        width: CONTROL_WIDTH,
    },
};

const DEBOUNCE_MS = 200;

export const CreateRepoPage: React.FunctionComponent = () => {
    const remote = useGitRemote();
    const [name, setName] = useState<string>('zmk-config');
    const [repoExists, setRepoExists] = useState(false);

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
                <TextField
                    label="Name"
                    value={name}
                    autoComplete="off"
                    onChange={(ev, newValue) => setName(newValue || '')}
                    styles={textFieldStyles}
                    errorMessage={errorMessage}
                />

                <Stack horizontal className={classNames.actions}>
                    <PrimaryButton text="Create repo" disabled={!!errorMessage} />
                </Stack>
            </Section>
        </>
    );
};
