import { IComboBoxStyles, IStackTokens, mergeStyleSets, PrimaryButton, Stack } from '@fluentui/react';
import * as git from 'isomorphic-git';
import React, { useState } from 'react';
import { useAsync } from 'react-use';
import { ExternalLink } from '../ExternalLink';
import { useGitRemote } from '../git/GitRemoteProvider';
import { getRepoDisplayName } from '../git/IGitRemote';
import { useCurrentRepo, useFs } from '../git/RepoProvider';
import { InternalLink } from '../InternalLink';
import { useMessageBar } from '../MessageBarProvider';
import { Section, SectionHeader } from '../Section';
import { ControlShimmer } from '../shimmer';
import { CONTROL_WIDTH } from '../styles';
import { LocalBranchSelect } from './BranchSelect';
import { CloneUrlBadge } from './CloneUrlBadge';
import { GitHubDesktopBadge } from './GitHubDesktopBadge';
import { GraphView } from './GraphView';
import { LocalRepoList } from './LocalRepoList';
import { VscodeBadge } from './VscodeBadge';

const stackTokens: IStackTokens = {
    childrenGap: 20,
};

const classNames = mergeStyleSets({
    actions: {
        marginTop: 14,
        marginBottom: 28,
    },
});

const comboBoxStyles: Partial<IComboBoxStyles> = {
    root: {
        width: CONTROL_WIDTH,
    },
};

export const CurrentRepoPage: React.FunctionComponent = () => {
    const { fs, dir } = useFs();
    const repo = useCurrentRepo();
    const remote = useGitRemote();
    const messageBar = useMessageBar();

    const [branch, setBranch] = useState<string | undefined>();

    const details = useAsync(async () => repo && remote.getRepo(repo), [repo]);
    const currentBranch = useAsync(async () => {
        if (!fs) {
            return undefined;
        }

        try {
            const currentBranch = await git.currentBranch({ fs, dir });
            setBranch(currentBranch ?? undefined);
            return currentBranch;
        } catch (error) {
            messageBar.error(error);
        }
    }, [fs, dir]);

    const branchDisabled = !branch || currentBranch.loading || branch === currentBranch.value;

    return (
        <>
            {repo ? (
                <Section>
                    <SectionHeader>Current repo</SectionHeader>
                    <p>
                        Editing{' '}
                        <ExternalLink href={details.value?.webUrl ?? '#'}>{getRepoDisplayName(repo)}</ExternalLink>.
                    </p>

                    {currentBranch.loading ? (
                        <ControlShimmer />
                    ) : (
                        <LocalBranchSelect
                            fs={fs}
                            dir={dir}
                            label="Branch"
                            value={branch}
                            onChange={setBranch}
                            styles={comboBoxStyles}
                        />
                    )}

                    <Stack horizontal className={classNames.actions}>
                        <PrimaryButton text="Change branch" disabled={branchDisabled} />
                    </Stack>

                    <p>
                        These shortcuts will open the repo in another editor. They edit the version of the repo stored
                        on GitHub, which may not match the copy stored in your browser. Use the{' '}
                        <InternalLink href="/commit">commit page</InternalLink> to save your changes and push them to
                        GitHub.
                    </p>
                    <Stack as="p" horizontal wrap verticalAlign="end" tokens={stackTokens}>
                        <CloneUrlBadge repo={repo} cloneUrl={details.value?.cloneUrl} />
                        <VscodeBadge repo={repo} />
                        <GitHubDesktopBadge repo={repo} />
                    </Stack>
                </Section>
            ) : (
                <Section>
                    <SectionHeader>No repo selected</SectionHeader>
                    <p>
                        To get started,{' '}
                        <InternalLink href="/repo/clone">clone an existing ZMK config repo</InternalLink> or{' '}
                        <InternalLink href="/repo/create">create a new one</InternalLink>.
                    </p>
                </Section>
            )}
            <Section>
                <SectionHeader>Available repos</SectionHeader>
                <p>
                    ZMK Config Builder needs to clone a repo and store it locally in your browser before it can edit it.
                    The following repos have already been cloned. You can select one for editing or delete them to free
                    up space.
                </p>
                <p>
                    If the repo you want to edit isn&apos;t listed here,{' '}
                    <InternalLink href="/repo/clone">clone it</InternalLink> or{' '}
                    <InternalLink href="/repo/create">create a new one</InternalLink>.
                </p>
                <LocalRepoList />
            </Section>

            <GraphView fs={fs} dir={dir} />
        </>
    );
};
