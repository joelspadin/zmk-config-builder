import {
    ComboBox,
    IComboBoxOption,
    IComboBoxStyles,
    mergeStyleSets,
    PrimaryButton,
    SelectableOptionMenuItemType,
    Stack,
} from '@fluentui/react';
import { GitProgressEvent } from 'isomorphic-git';
import React, { useCallback, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useAsync } from 'react-use';
import { cloneAndSelectRepo } from '../git/commands';
import { useGitRemote } from '../git/GitRemoteProvider';
import { getRepoDisplayName, getRepoGroup, getRepoKey, IGitRemote, RepoId } from '../git/IGitRemote';
import { useRepos } from '../git/RepoProvider';
import { InternalLink } from '../InternalLink';
import { useMessageBar } from '../MessageBarProvider';
import { ProgressModal } from '../ProgressModal';
import { Section, SectionHeader } from '../Section';
import { ControlShimmer } from '../shimmer';
import { CONTROL_WIDTH } from '../styles';
import { groupBy } from '../util';
import { RemoteBranchSelect } from './BranchSelect';
import { CloneState, getProgressDetails } from './CloneProgress';

const classNames = mergeStyleSets({
    actions: {
        marginTop: 28,
    },
    progress: {
        marginTop: 28,
    },
});

const comboBoxStyles: Partial<IComboBoxStyles> = {
    root: {
        width: CONTROL_WIDTH,
    },
};

async function getRepoOptions(git: IGitRemote): Promise<IComboBoxOption[]> {
    const options: IComboBoxOption[] = [];

    const allRepos = await git.listRepos();
    const groups = Object.entries(groupBy(allRepos, (r) => getRepoGroup(r)));

    groups.sort(([groupA], [groupB]) => {
        if (groupA === git.login) {
            return -1;
        }
        if (groupB === git.login) {
            return 1;
        }

        return groupA.localeCompare(groupB);
    });

    for (const entry of groups) {
        const [group, repos] = entry;

        if (groups.length > 1) {
            options.push({
                key: group,
                itemType: SelectableOptionMenuItemType.Header,
                text: group,
            });
        }

        repos.sort((a, b) => getRepoDisplayName(a).localeCompare(getRepoDisplayName(b)));

        for (const repo of repos) {
            options.push({
                key: getRepoKey(repo),
                text: getRepoDisplayName(repo),
                data: repo,
            });
        }
    }

    return options;
}

export const CloneRepoPage: React.FunctionComponent = () => {
    const repos = useRepos();
    const remote = useGitRemote();
    const history = useHistory();
    const messageBar = useMessageBar();
    const [repo, setRepo] = useState<RepoId>();
    const [branch, setBranch] = useState<string>();
    const [state, setState] = useState(CloneState.Default);
    const [error, setError] = useState<string>();
    const [progress, setProgress] = useState<GitProgressEvent>();

    const repoOptions = useAsync(() => getRepoOptions(remote), [remote]);

    const cloneRepo = useCallback(async () => {
        if (!repo || !branch) {
            return;
        }

        if (repos.exists(repo)) {
            messageBar.info(
                <span>
                    This repo has already been cloned.{' '}
                    <InternalLink href="/repo/current">View cloned repos</InternalLink>.
                </span>,
            );
            return;
        }

        try {
            setState(CloneState.Cloning);
            await cloneAndSelectRepo(repos, remote, repo, branch, setProgress);
            setState(CloneState.Done);
        } catch (error) {
            setState(CloneState.Error);
            setError(error.toString());
        }
    }, [repos, remote, messageBar, repo, branch, setState, setProgress]);

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

    const disabled = !repo || !branch;

    return (
        <>
            <Section>
                <SectionHeader>Select the repo to clone</SectionHeader>
                <p>
                    Select your ZMK config repo and clone it to make a copy of it in your browser that ZMK Config
                    Builder can edit.
                </p>
                {repoOptions.value ? (
                    <>
                        <ComboBox
                            label="Repository"
                            allowFreeform
                            autoComplete="on"
                            useComboBoxAsMenuWidth
                            openOnKeyboardFocus
                            options={repoOptions.value}
                            styles={comboBoxStyles}
                            selectedKey={repo ? getRepoKey(repo) : undefined}
                            onChange={(ev, option) => {
                                setRepo(option?.data as RepoId);
                            }}
                        />
                        <RemoteBranchSelect
                            label="Branch"
                            repo={repo}
                            value={branch}
                            onChange={setBranch}
                            styles={comboBoxStyles}
                            resetToDefault
                        />
                    </>
                ) : (
                    <>
                        <ControlShimmer />
                        <ControlShimmer />
                    </>
                )}
                <Stack horizontal className={classNames.actions}>
                    <PrimaryButton text="Clone repo" disabled={disabled} onClick={cloneRepo} />
                </Stack>
            </Section>

            <ProgressModal
                isOpen={state !== CloneState.Default}
                isComplete={isComplete || !!error}
                title={`Cloning ${repo && getRepoDisplayName(repo)}`}
                progressLabel={progressText}
                percentComplete={percentComplete}
                errorText={error}
                onDismiss={onDismissModal}
            />
        </>
    );
};
