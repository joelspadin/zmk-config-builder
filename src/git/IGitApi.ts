export interface IRepoId {
    readonly owner: string;
    readonly name: string;
    readonly url: string;
}

export interface RepoDetails extends IRepoId {}

export interface IGitApi {
    readonly providerName: string;
    readonly isAuthenticated: boolean;
    readonly username: string;
    readonly login?: string;
    readonly avatarUrl?: string;

    listRepos(): Promise<IRepoId[]>;
    listBranches(repo: IRepoId): Promise<string[]>;
    getDefaultBranch(repo: IRepoId): Promise<string>;
    getRepo(repo: IRepoId | string): Promise<RepoDetails | undefined>;
}
