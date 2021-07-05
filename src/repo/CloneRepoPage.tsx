import {
    ComboBox,
    IComboBoxOption,
    IComboBoxStyles,
    mergeStyleSets,
    PrimaryButton,
    SelectableOptionMenuItemType,
    Stack,
} from '@fluentui/react';
import React, { useState } from 'react';
import { useAsync } from 'react-use';
import { useGit } from '../git/GitApiProvider';
import { IGitApi, IRepoId } from '../git/IGitApi';
import { Section, SectionHeader } from '../Section';
import { SectionShimmer } from '../shimmer';
import { CONTROL_WIDTH } from '../styles';
import { groupBy } from '../util';
import { BranchSelect } from './BranchSelect';

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

function repoKey(repo: IRepoId) {
    return `${repo.owner}/${repo.name}`;
}

async function getRepoOptions(git: IGitApi): Promise<IComboBoxOption[]> {
    const options: IComboBoxOption[] = [];

    const allRepos = await git.listRepos();
    const groups = Object.entries(groupBy(allRepos, (r) => r.owner));

    groups.sort(([ownerA], [ownerB]) => {
        if (ownerA === git.login) {
            return -1;
        }
        if (ownerB === git.login) {
            return 1;
        }

        return ownerA.localeCompare(ownerB);
    });

    for (const group of groups) {
        const [owner, repos] = group;

        if (groups.length > 1) {
            options.push({
                key: owner,
                itemType: SelectableOptionMenuItemType.Header,
                text: owner,
            });
        }

        repos.sort((a, b) => a.name.localeCompare(b.name));

        for (const repo of repos) {
            const text = repoKey(repo);
            options.push({
                key: text,
                text,
                data: repo,
            });
        }
    }

    return options;
}

export const CloneRepoPage: React.FunctionComponent = () => {
    const git = useGit();
    const [repo, setRepo] = useState<IRepoId>();
    const [branch, setBranch] = useState<string>();

    const repoOptions = useAsync(() => getRepoOptions(git), [git]);

    if (repoOptions.loading) {
        return <SectionShimmer />;
    }

    return (
        <>
            <Stack>
                <Section>
                    <SectionHeader>Select the repo to clone</SectionHeader>
                    <p>
                        Select your ZMK config repo and clone it to make a copy of it in your browser that ZMK Config
                        Builder can edit.
                    </p>
                    <ComboBox
                        label="Repository"
                        allowFreeform
                        autoComplete="on"
                        useComboBoxAsMenuWidth
                        openOnKeyboardFocus
                        options={repoOptions.value!}
                        styles={comboBoxStyles}
                        selectedKey={repo ? repoKey(repo) : undefined}
                        onChange={(ev, option) => {
                            setRepo(option?.data as IRepoId);
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
                    <Stack horizontal className={classNames.actions}>
                        <PrimaryButton text="Clone repo" disabled={!repo || !branch} />
                    </Stack>
                </Section>
            </Stack>
        </>
    );
};
