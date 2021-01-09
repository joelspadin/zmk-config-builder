import type { Octokit } from '@octokit/rest';
import { RepoCreateOptions, Repository } from './repository';
import type { Build } from './targets';
import { getNewRepoFiles } from './zmk';

const INIT_REPO_COMMIT_MESSAGE = 'Initialize ZMK config';

export interface UserRepoOptions {
    builds: Build[];
}

export async function createUserRepository(
    octokit: Octokit,
    name: string,
    options: UserRepoOptions & RepoCreateOptions
) {
    const { builds, ...repoOptions } = options;

    const repo = await Repository.create(octokit, name, repoOptions);
    const files = await getNewRepoFiles(octokit, builds);
    const commit = await repo.createCommit(files, INIT_REPO_COMMIT_MESSAGE);
    const branch = await repo.updateDefaultBranchToCommit(commit);

    return { repo, commit, branch };
}

export async function initUserRepository(repo: Repository, branch: string, options: UserRepoOptions) {
    const files = await getNewRepoFiles(repo.octokit, options.builds);
    const commit = await repo.createCommit(files, INIT_REPO_COMMIT_MESSAGE, { branch });

    return await repo.createpullRequest(commit, branch, 'init-repo');
}
