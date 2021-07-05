import { Octokit } from '@octokit/rest';
import { AuthGitHubToken } from './AuthProvider';
import { IGitApi, IRepoId as RepoId, RepoDetails } from './IGitApi';

interface OctokitRepo {
    name: string;
    clone_url: string;
    owner: {
        login: string;
    } | null;
}

export interface GitHubApiOptions {
    isAuthenticated: boolean;
    login?: string;
    name?: string | null;
    avatarUrl?: string;
}

export class GitHubApi implements IGitApi {
    public readonly providerName = 'GitHub';

    public readonly isAuthenticated: boolean;
    public readonly username: string;
    public readonly login: string;
    public readonly avatarUrl: string | undefined;

    constructor(private readonly octokit: Octokit, options: GitHubApiOptions) {
        this.isAuthenticated = options.isAuthenticated;
        this.username = options.name ?? '';
        this.login = options.login ?? '';
        this.avatarUrl = options.avatarUrl;
    }

    async listRepos(): Promise<RepoId[]> {
        const repos = await this.octokit.paginate(this.octokit.repos.listForAuthenticatedUser);
        return repos
            .filter((r) => !!r.owner)
            .map<RepoId>((r) => {
                return this.getRepoId(r);
            });
    }

    async listBranches(repo: RepoId): Promise<string[]> {
        const response = await this.octokit.repos.listBranches(this.repoParams(repo));
        return response.data.map((b) => b.name);
    }

    async getDefaultBranch(repo: RepoId): Promise<string> {
        const response = await this.getRepoInternal(repo);
        return response.data.default_branch;
    }

    async getRepo(repo: RepoId | string): Promise<RepoDetails | undefined> {
        try {
            const response = await this.getRepoInternal(repo);

            return {
                ...this.getRepoId(response.data),
            };
        } catch {
            return undefined;
        }
    }

    private getRepoId(details: OctokitRepo): RepoId {
        return {
            name: details.name,
            owner: details.owner?.login ?? '',
            url: details.clone_url,
        };
    }

    private async getRepoInternal(repo: RepoId | string) {
        return await this.octokit.repos.get(this.repoParams(repo));
    }

    private repoParams(repo: RepoId | string): { owner: string; repo: string } {
        if (typeof repo === 'string') {
            return { owner: this.login, repo };
        } else {
            return { owner: repo.owner, repo: repo.name };
        }
    }
}

export async function createGitHubApi(auth: AuthGitHubToken): Promise<GitHubApi> {
    const octokit = new Octokit({
        auth: auth.token,
        userAgent: 'zmk-config-builder',
    });

    try {
        const user = await octokit.rest.users.getAuthenticated();
        const { login, name, avatar_url } = user.data;

        return new GitHubApi(octokit, {
            isAuthenticated: true,
            login,
            name,
            avatarUrl: avatar_url,
        });
    } catch (ex) {
        // TODO: show an error notification
        return new GitHubApi(octokit, {
            isAuthenticated: false,
        });
    }
}
