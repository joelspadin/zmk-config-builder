import { Octokit } from '@octokit/rest';
import { AuthGitHubToken } from './AuthProvider';
import { IGitApi } from './IGitApi';

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
    public readonly avatarUrl: string | undefined;

    private readonly login: string;

    constructor(octokit: Octokit, options: GitHubApiOptions) {
        this.isAuthenticated = options.isAuthenticated;
        this.username = options.name ?? '';
        this.avatarUrl = options.avatarUrl;

        this.login = options.login ?? '';
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
