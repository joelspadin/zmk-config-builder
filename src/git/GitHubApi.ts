import { Octokit } from '@octokit/rest';
import * as git from 'isomorphic-git';
import http from 'isomorphic-git/http/web';
import { GIT_CORS_PROXY } from '../env';
import { AuthGitHubToken } from './AuthProvider';
import { getRepoDisplayName, IGitApi, RepoDetails, RepoId } from './IGitApi';

interface OctokitRepo {
    name: string;
    clone_url: string;
    owner: {
        login: string;
    } | null;
}

export interface GitHubApiOptions {
    isAuthenticated: boolean;
    auth: AuthGitHubToken;
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

    private readonly auth: AuthGitHubToken;

    constructor(private readonly octokit: Octokit, options: GitHubApiOptions) {
        this.isAuthenticated = options.isAuthenticated;
        this.username = options.name ?? '';
        this.login = options.login ?? '';
        this.avatarUrl = options.avatarUrl;

        this.auth = options.auth;
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
                cloneUrl: response.data.clone_url,
            };
        } catch {
            return undefined;
        }
    }

    async cloneRepo(fs: git.PromiseFsClient, repo: RepoId, ref: string, onProgress?: git.ProgressCallback) {
        const details = await this.getRepo(repo);

        if (!details) {
            throw Error(`Couldn't find repo ${getRepoDisplayName(repo)}`);
        }

        await git.clone({
            fs,
            http,
            corsProxy: GIT_CORS_PROXY,
            onAuth: () => this.onAuth(),
            onProgress,
            url: details.cloneUrl,
            dir: '/',
            ref,
        });
    }

    private getRepoId(details: OctokitRepo): RepoId {
        return {
            type: 'github',
            name: details.name,
            owner: details.owner?.login ?? '',
        };
    }

    private async getRepoInternal(repo: RepoId | string) {
        return await this.octokit.repos.get(this.repoParams(repo));
    }

    private repoParams(repo: RepoId | string): { owner: string; repo: string } {
        if (typeof repo === 'string') {
            return { owner: this.login, repo };
        }
        if (repo.type === 'github') {
            return { owner: repo.owner, repo: repo.name };
        }
        throw Error(`Can't look up repo of type ${repo.type} with GitHub API`);
    }

    private onAuth(): git.GitAuth {
        return {
            username: this.auth.token,
            password: 'x-oauth-basic',
        };
    }
}

export async function createGitHubApi(auth: AuthGitHubToken): Promise<GitHubApi> {
    const octokit = new Octokit({
        auth: auth.token,
        userAgent: 'zmk-config-builder',
    });

    const user = await octokit.rest.users.getAuthenticated();
    const { login, name, avatar_url } = user.data;

    return new GitHubApi(octokit, {
        isAuthenticated: true,
        auth,
        login,
        name,
        avatarUrl: avatar_url,
    });
}
