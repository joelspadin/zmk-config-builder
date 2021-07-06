import { ComboBox, DropdownMenuItemType, IComboBoxOption, IComboBoxStyles } from '@fluentui/react';
import FS from '@isomorphic-git/lightning-fs';
import * as git from 'isomorphic-git';
import React from 'react';
import { useAsync } from 'react-use';
import { useGit } from '../git/GitApiProvider';
import { IGitApi, RepoId } from '../git/IGitApi';

function getBranchesFromGitApi(gitApi: IGitApi, repo?: RepoId) {
    if (!repo) {
        return [];
    }

    return gitApi.listBranches(repo);
}

function getDefaultBranchFromGitApi(gitApi: IGitApi, repo?: RepoId) {
    if (!repo) {
        return 'main';
    }

    return gitApi.getDefaultBranch(repo);
}

async function getCurrentBranchFromFs(fs: FS) {
    const branch = await git.currentBranch({ fs, dir: '/' });
    return branch ?? undefined;
}

async function getBranchesFromFs(fs: FS) {
    // TODO: list local and remote branches?
    const localBranches = await git.listBranches({ fs, dir: '/' });
    const remotes = await git.listRemotes({ fs, dir: '/' });
    const remoteBranches: string[] = [];

    for (const remote of remotes) {
        const branches = await git.listBranches({ fs, dir: '/', remote: remote.remote });
        remoteBranches.push(...branches.filter((b) => b !== 'HEAD').map((b) => `${remote.remote}/${b}`));
    }

    return [...localBranches, ...remoteBranches];
}

function getDefaultBranchFromFs(branches: string[]) {
    return branches.includes('main') ? 'main' : 'master';
}

function splitBranch(branch: string): [string, string] {
    let [remote, name] = branch.split('/');

    if (name) {
        return [remote, name];
    }
    return ['', remote];
}

function compareBranches(defaultBranch: string | undefined, a: string, b: string) {
    const [remoteA, branchA] = splitBranch(a);
    const [remoteB, branchB] = splitBranch(b);

    const result = remoteA.localeCompare(remoteB);
    if (result !== 0) {
        return result;
    }

    if (branchA === defaultBranch) {
        return -1;
    }
    if (branchB === defaultBranch) {
        return 1;
    }

    return branchA.localeCompare(branchB);
}

async function getBranchOptions(gitOrFs: IGitApi | FS, repo?: RepoId) {
    let defaultBranch: string | undefined;
    let currentBranch: string | undefined;
    let branches: string[];

    if (gitOrFs instanceof FS) {
        const fs = gitOrFs;
        branches = await getBranchesFromFs(fs);
        currentBranch = await getCurrentBranchFromFs(fs);
        defaultBranch = getDefaultBranchFromFs(branches);
    } else {
        const gitApi = gitOrFs;
        defaultBranch = await getDefaultBranchFromGitApi(gitApi, repo);
        branches = await getBranchesFromGitApi(gitApi, repo);
    }

    branches.sort((a, b) => compareBranches(defaultBranch, a, b));

    const options: IComboBoxOption[] = [];
    let currentRemote = '';

    for (const branch of branches) {
        const [remote] = splitBranch(branch);
        if (remote !== currentRemote) {
            currentRemote = remote;
            options.push({
                itemType: DropdownMenuItemType.Header,
                key: `remote:${remote}`,
                text: remote,
            });
        }

        options.push({
            key: branch,
            text: branch,
        });
    }

    return { options, defaultBranch, currentBranch };
}

export interface IBranchSelect {
    label?: string;
    repo?: RepoId;
    fs?: FS;
    value?: string;
    resetToDefault?: boolean;
    resetToCurrent?: boolean;
    onChange?: (value: string | undefined) => any;
    styles?: Partial<IComboBoxStyles>;
}

export const BranchSelect: React.FunctionComponent<IBranchSelect> = ({
    label,
    repo,
    fs,
    value,
    resetToDefault,
    resetToCurrent,
    onChange,
    styles,
}) => {
    const git = useGit();

    const options = useAsync(async () => {
        const params: [IGitApi | FS, RepoId?] = fs ? [fs] : [git, repo];
        const { options, defaultBranch, currentBranch } = await getBranchOptions(...params);

        if (resetToDefault) {
            onChange?.(defaultBranch);
        } else if (resetToCurrent) {
            onChange?.(currentBranch);
        }
        return options;
    }, [git, repo, fs]);

    return (
        <ComboBox
            label={label}
            allowFreeform
            autoComplete="on"
            useComboBoxAsMenuWidth
            openOnKeyboardFocus
            options={options.value ?? []}
            styles={styles}
            selectedKey={value}
            onChange={(ev, option) => {
                onChange?.(option?.text);
            }}
        />
    );
};
