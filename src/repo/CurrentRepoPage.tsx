import { IComboBoxStyles, mergeStyleSets, PrimaryButton, Stack } from '@fluentui/react';
import React, { useState } from 'react';
import { IRepoId } from '../git/IGitApi';
import { InternalLink } from '../InternalLink';
import { NotImplemented } from '../NotImplemented';
import { Section, SectionHeader } from '../Section';
import { CONTROL_WIDTH } from '../styles';
import { BranchSelect } from './BranchSelect';
import { GraphView } from './GraphView';

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
    // const git = useGit();
    //
    // const repo: IRepoId = {
    //     owner: git.login ?? '',
    //     name: 'zmk-config',
    //     url: `https://github.com/${git.login}/zmk-config`,
    // };
    let repo: IRepoId | undefined;

    const currentBranch = 'main';
    const [branch, setBranch] = useState<string | undefined>(currentBranch);

    return (
        <>
            {repo ? (
                <Section>
                    <SectionHeader>Current repo</SectionHeader>
                    <p>
                        Editing repo{' '}
                        <strong>
                            {repo.owner}/{repo.name}
                        </strong>{' '}
                        on branch <strong>{currentBranch}</strong>
                    </p>

                    <BranchSelect
                        repo={repo}
                        label="Branch"
                        value={branch}
                        onChange={setBranch}
                        styles={comboBoxStyles}
                    />

                    <Stack horizontal className={classNames.actions}>
                        <PrimaryButton text="Change branch" disabled={!branch || branch === currentBranch} />
                    </Stack>
                </Section>
            ) : (
                <Section>
                    <SectionHeader>No repo selected</SectionHeader>
                    <p>
                        To get started, <InternalLink href="/repo/clone">clone an existing ZMK repo</InternalLink> or{' '}
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
                <NotImplemented />
            </Section>

            <GraphView />
        </>
    );
};
