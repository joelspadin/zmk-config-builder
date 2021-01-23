import type { Octokit } from '@octokit/rest';
import { RepoCreateOptions, Repository } from './repository';
import type { Build } from './targets';
import { getGitHubWorkflowFile } from './templates';
import { getNewKeymapFiles, getNewRepoFiles } from './zmk';

const INIT_REPO_COMMIT_MESSAGE = 'Initialize ZMK config';
const UPDATE_WORKFLOW_MESSAGE = 'Update build matrix';

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

export async function addKeymaps(repo: Repository, branch: string, keyboards: Build[]) {
    const MAX_SINGLE_LINE_KEYBOARDS = 3;

    let message: string;

    if (keyboards.length <= MAX_SINGLE_LINE_KEYBOARDS) {
        message = `Add ${keyboards.map((b) => b.keyboard.name).join(', ')}`;
    } else {
        const list = keyboards.map((b) => `- ${b.keyboard.name}`).join('\n');
        message = `Add keyboards\n\n${list}`;
    }

    const files = await getNewKeymapFiles(repo.octokit, keyboards);
    const commit = await repo.createCommit(files, message, { branch, noOverwrite: true });
    const pull = await repo.createpullRequest(commit, branch, 'add-keymaps');

    return pull.data.html_url;
}

export async function updateGitHubWorkflow(repo: Repository, branch: string, keyboards: Build[]) {
    const file = await getGitHubWorkflowFile(keyboards);
    const commit = await repo.createCommit([file], UPDATE_WORKFLOW_MESSAGE, { branch });
    const pull = await repo.createpullRequest(commit, branch, 'update-build-matrix');

    return pull.data.html_url;
}
