import { ProgressCallback, PromiseFsClient } from 'isomorphic-git';

export interface GitHubRepoId {
    readonly type: 'github';
    readonly owner: string;
    readonly name: string;
}

export type RepoId = GitHubRepoId;

export function getRepoKey(repo: RepoId): string {
    switch (repo.type) {
        case 'github':
            return `github:${repo.owner}/${repo.name}`;
    }
}

export function getRepoGroup(repo: RepoId): string {
    switch (repo.type) {
        case 'github':
            return repo.owner;
    }
}

export function getRepoDisplayName(repo: RepoId): string {
    switch (repo.type) {
        case 'github':
            return `${repo.owner}/${repo.name}`;
    }
}

export function repoIdEquals(a: RepoId, b: RepoId) {
    if (a.type !== b.type) {
        return false;
    }

    switch (a.type) {
        case 'github':
            return a.owner === b.owner && a.name === b.name;
    }
}

export interface RepoDetails extends RepoId {
    readonly cloneUrl: string;
}

export interface IGitRemote {
    readonly providerName: string;
    readonly isAuthenticated: boolean;
    readonly username: string;
    readonly login?: string;
    readonly avatarUrl?: string;

    listRepos(): Promise<RepoId[]>;
    listBranches(repo: RepoId): Promise<string[]>;
    getDefaultBranch(repo: RepoId): Promise<string>;
    getRepo(repo: RepoId | string): Promise<RepoDetails | undefined>;

    cloneRepo(fs: PromiseFsClient, repo: RepoId, ref: string, onProgress?: ProgressCallback): Promise<void>;
}
