import { IGitApi, IRepoId, RepoDetails } from './IGitApi';

export class GitApiStub implements IGitApi {
    public readonly providerName = '';
    public readonly isAuthenticated = false;
    public readonly username = '';

    async listRepos(): Promise<IRepoId[]> {
        return [];
    }

    async listBranches(): Promise<string[]> {
        return [];
    }

    async getDefaultBranch(): Promise<string> {
        return 'main';
    }

    async getRepo(): Promise<RepoDetails | undefined> {
        return undefined;
    }
}
