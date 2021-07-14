import { ProgressCallback } from 'isomorphic-git';
import { IGitRemote, RepoId } from './IGitRemote';
import { RepoState } from './RepoProvider';

export async function cloneAndSelectRepo(
    state: RepoState,
    git: IGitRemote,
    repo: RepoId,
    ref: string,
    onProgress?: ProgressCallback,
): Promise<void> {
    const fs = state.getFs(repo);
    await git.cloneRepo(fs, repo, ref, onProgress);
    state.setRepo(repo);
}

export async function createAndSelectRepo(
    state: RepoState,
    git: IGitRemote,
    name: string,
    isPrivate?: boolean,
    onProgress?: ProgressCallback,
): Promise<void> {
    onProgress?.({ phase: 'Creating repo', loaded: 1, total: 10 });
    const repo = await git.createRepoFromTemplate(name, isPrivate);
    const ref = await git.getDefaultBranch(repo);

    return await cloneAndSelectRepo(state, git, repo, ref);
}
