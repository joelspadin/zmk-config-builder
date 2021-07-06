import { IComboBoxStyles, mergeStyleSets, PrimaryButton, Stack } from '@fluentui/react';
import * as git from 'isomorphic-git';
import React, { useState } from 'react';
import { useAsync } from 'react-use';
import { getRepoDisplayName } from '../git/IGitApi';
import { useCurrentRepo, useFs } from '../git/RepoProvider';
import { InternalLink } from '../InternalLink';
import { useMessageBar } from '../MessageBarProvider';
import { Section, SectionHeader } from '../Section';
import { ControlShimmer } from '../shimmer';
import { CONTROL_WIDTH } from '../styles';
import { BranchSelect } from './BranchSelect';
import { GraphView } from './GraphView';
import { LocalRepoList } from './LocalRepoList';

const classNames = mergeStyleSets({
    actions: {
        marginTop: 28,
    },
});

const comboBoxStyles: Partial<IComboBoxStyles> = {
    root: {
        width: CONTROL_WIDTH,
    },
};

export const CurrentRepoPage: React.FunctionComponent = () => {
    const repo = useCurrentRepo();
    const fs = useFs();
    const messageBar = useMessageBar();

    const [branch, setBranch] = useState<string | undefined>();

    const currentBranch = useAsync(async () => {
        if (!fs) {
            return undefined;
        }

        try {
            const currentBranch = await git.currentBranch({ fs, dir: '/' });
            setBranch(currentBranch ?? undefined);
            return currentBranch;
        } catch (error) {
            messageBar.error(error);
        }
    }, [fs]);

    const branchDisabled = !branch || currentBranch.loading || branch === currentBranch.value;

    return (
        <>
            {repo ? (
                <Section>
                    <SectionHeader>Current repo</SectionHeader>
                    <p>
                        Editing repo <strong>{getRepoDisplayName(repo)}</strong>
                    </p>

                    {currentBranch.loading ? (
                        <ControlShimmer />
                    ) : (
                        <BranchSelect
                            fs={fs}
                            label="Branch"
                            value={branch}
                            onChange={setBranch}
                            styles={comboBoxStyles}
                        />
                    )}

                    <Stack horizontal className={classNames.actions}>
                        <PrimaryButton text="Change branch" disabled={branchDisabled} />
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

            <GraphView />
        </>
    );
};
