import { ComboBox, DropdownMenuItemType, IComboBoxOption, IComboBoxStyles } from '@fluentui/react';
import FS from '@isomorphic-git/lightning-fs';
import * as git from 'isomorphic-git';
import React, { useEffect } from 'react';
import { useAsync } from 'react-use';
import { useGitRemote } from '../git/GitRemoteProvider';
import { IGitRemote, RepoId } from '../git/IGitRemote';

function getBranchesFromGitApi(gitApi: IGitRemote, repo?: RepoId) {
    if (!repo) {
        return [];
    }

    return gitApi.listBranches(repo);
}

function getDefaultBranchFromGitApi(gitApi: IGitRemote, repo?: RepoId) {
    if (!repo) {
        return 'main';
    }

    return gitApi.getDefaultBranch(repo);
}

async function getCurrentBranchFromFs(fs: FS, dir: string) {
    const branch = await git.currentBranch({ fs, dir });
    return branch ?? undefined;
}

async function getBranchesFromFs(fs: FS, dir: string) {
    // TODO: list local and remote branches?
    const localBranches = await git.listBranches({ fs, dir });
    const remotes = await git.listRemotes({ fs, dir });
    const remoteBranches: string[] = [];

    for (const remote of remotes) {
        const branches = await git.listBranches({ fs, dir, remote: remote.remote });
        remoteBranches.push(...branches.filter((b) => b !== 'HEAD').map((b) => `${remote.remote}/${b}`));
    }

    return [...localBranches, ...remoteBranches];
}

function getDefaultBranchFromFs(branches: string[]) {
    return branches.includes('main') ? 'main' : 'master';
}

function splitBranch(branch: string): [string, string] {
    const [remote, name] = branch.split('/');

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

interface BranchOptions {
    options: IComboBoxOption[];
    defaultBranch: string | undefined;
    currentBranch: string | undefined;
}

async function getBranchOptions(remote: IGitRemote, repo: RepoId): Promise<BranchOptions>;
async function getBranchOptions(fs: FS, dir: string): Promise<BranchOptions>;
async function getBranchOptions(remoteOrFs: IGitRemote | FS, repoOrDir: RepoId | string): Promise<BranchOptions> {
    let defaultBranch: string | undefined;
    let currentBranch: string | undefined;
    let branches: string[];

    if (remoteOrFs instanceof FS) {
        if (typeof repoOrDir === 'string') {
            const fs = remoteOrFs;
            const dir = repoOrDir;
            branches = await getBranchesFromFs(fs, dir);
            currentBranch = await getCurrentBranchFromFs(fs, dir);
            defaultBranch = getDefaultBranchFromFs(branches);
        } else {
            throw new Error('Invalid arguments');
        }
    } else if (typeof repoOrDir === 'object') {
        const remote = remoteOrFs;
        const repo = repoOrDir;
        defaultBranch = await getDefaultBranchFromGitApi(remote, repo);
        branches = await getBranchesFromGitApi(remote, repo);
    } else {
        throw new Error('Inavlid arguments');
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
    onChange?: (value: string | undefined) => unknown;
    styles?: Partial<IComboBoxStyles>;
}

interface ICommonBranchSelect extends IBranchSelect {
    options?: IComboBoxOption[];
    defaultBranch?: string;
    currentBranch?: string;
}

const CommonBranchSelect: React.FunctionComponent<ICommonBranchSelect> = ({
    label,
    options,
    defaultBranch,
    currentBranch,
    resetToDefault,
    resetToCurrent,
    value,
    onChange,
    styles,
}) => {
    useEffect(() => {
        if (defaultBranch && resetToDefault) {
            onChange?.(defaultBranch);
        }
        if (currentBranch && resetToCurrent) {
            onChange?.(currentBranch);
        }
    }, [defaultBranch, currentBranch, resetToDefault, resetToCurrent]);

    return (
        <ComboBox
            label={label}
            allowFreeform
            autoComplete="on"
            useComboBoxAsMenuWidth
            openOnKeyboardFocus
            options={options ?? []}
            styles={styles}
            selectedKey={value}
            onChange={(ev, option) => {
                onChange?.(option?.text);
            }}
        />
    );
};

export interface IRemoteBranchSelect extends IBranchSelect {
    repo?: RepoId;
}

export const RemoteBranchSelect: React.FunctionComponent<IRemoteBranchSelect> = ({ repo, ...props }) => {
    const remote = useGitRemote();

    const options = useAsync(async () => {
        if (!repo) {
            return { options: [] };
        }

        return await getBranchOptions(remote, repo);
    }, [remote, repo]);

    return <CommonBranchSelect {...options.value} {...props} />;
};

export interface ILocalBranchSelect extends IBranchSelect {
    fs?: FS;
    dir: string;
}

export const LocalBranchSelect: React.FunctionComponent<ILocalBranchSelect> = ({ fs, dir, ...props }) => {
    const options = useAsync(async () => {
        if (!fs) {
            return { options: [] };
        }

        return await getBranchOptions(fs, dir);
    }, [fs, dir]);

    return <CommonBranchSelect {...options.value} {...props} />;
};
