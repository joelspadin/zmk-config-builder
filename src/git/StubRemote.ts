import { IGitRemote, RepoDetails, RepoId } from './IGitRemote';

export class StubRemote implements IGitRemote {
    public readonly providerName = '';
    public readonly isAuthenticated = false;
    public readonly username = '';

    async listRepos(): Promise<RepoId[]> {
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

    async cloneRepo(): Promise<void> {
        throw new Error('Not implemented');
    }

    async createRepoFromTemplate(): Promise<RepoId> {
        throw new Error('Not implemented');
    }
}
