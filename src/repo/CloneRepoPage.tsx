import {
    ComboBox,
    IComboBoxOption,
    IComboBoxStyles,
    mergeStyleSets,
    PrimaryButton,
    ProgressIndicator,
    SelectableOptionMenuItemType,
    Stack,
} from '@fluentui/react';
import { GitProgressEvent } from 'isomorphic-git';
import React, { useCallback, useMemo, useState } from 'react';
import { useAsync } from 'react-use';
import { cloneAndSelectRepo } from '../git/commands';
import { useGitRemote } from '../git/GitRemoteProvider';
import { getRepoDisplayName, getRepoGroup, getRepoKey, IGitRemote, RepoId } from '../git/IGitRemote';
import { useRepos } from '../git/RepoProvider';
import { InternalLink } from '../InternalLink';
import { useMessageBar } from '../MessageBarProvider';
import { Section, SectionHeader } from '../Section';
import { ControlShimmer } from '../shimmer';
import { CONTROL_WIDTH } from '../styles';
import { groupBy } from '../util';
import { BranchSelect } from './BranchSelect';

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

enum State {
    Default,
    Cloning,
    Done,
    Error,
}

function getProgressDetails(state: State, progress?: GitProgressEvent) {
    let percentComplete: number = 0;
    let progressText: string = '';
    if (state === State.Done) {
        percentComplete = 100;
        progressText = 'Done';
    } else if (progress) {
        percentComplete = (progress.loaded / progress.total) * 100;
        progressText = progress.phase;
    }

    return { percentComplete, progressText };
}

export const CloneRepoPage: React.FunctionComponent = () => {
    const repos = useRepos();
    const remote = useGitRemote();
    const messageBar = useMessageBar();
    const [repo, setRepo] = useState<RepoId>();
    const [branch, setBranch] = useState<string>();
    const [state, setState] = useState(State.Default);
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
            setState(State.Cloning);
            await cloneAndSelectRepo(repos, remote, repo, branch, setProgress);
            setState(State.Done);
        } catch (error) {
            setState(State.Error);
            messageBar.error(error);
        }
    }, [repos, remote, repo, branch, state, setState, setProgress]);

    const { percentComplete, progressText } = useMemo(() => getProgressDetails(state, progress), [state, progress]);

    const disabled = !repo || !branch || state === State.Cloning;

    return (
        <>
            <Section>
                <SectionHeader>Select the repo to clone</SectionHeader>
                <p>
                    Select your ZMK config repo and clone it to make a copy of it in your browser that ZMK Config
                    Builder can edit.
                </p>
                {repoOptions.loading ? (
                    <>
                        <ControlShimmer />
                        <ControlShimmer />
                    </>
                ) : (
                    <>
                        <ComboBox
                            label="Repository"
                            allowFreeform
                            autoComplete="on"
                            useComboBoxAsMenuWidth
                            openOnKeyboardFocus
                            options={repoOptions.value!}
                            styles={comboBoxStyles}
                            selectedKey={repo ? getRepoKey(repo) : undefined}
                            onChange={(ev, option) => {
                                setRepo(option?.data as RepoId);
                            }}
                        />
                        <BranchSelect
                            label="Branch"
                            repo={repo}
                            value={branch}
                            onChange={setBranch}
                            styles={comboBoxStyles}
                            resetToDefault
                        />
                    </>
                )}
                <Stack horizontal className={classNames.actions}>
                    <PrimaryButton text="Clone repo" disabled={disabled} onClick={cloneRepo} />
                </Stack>

                {state !== State.Default && (
                    <ProgressIndicator
                        className={classNames.progress}
                        label={`Cloning ${repo && getRepoDisplayName(repo)}`}
                        description={progressText}
                        percentComplete={percentComplete}
                    />
                )}
            </Section>
        </>
    );
};
