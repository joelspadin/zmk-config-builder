import { ProgressCallback } from 'isomorphic-git';
import { IGitRemote, RepoId } from './IGitRemote';
import { RepoState } from './RepoProvider';

export async function cloneAndSelectRepo(
    state: RepoState,
    git: IGitRemote,
    repo: RepoId,
    ref: string,
    onProgress?: ProgressCallback,
) {
    const fs = state.setRepo(repo);
    await git.cloneRepo(fs, repo, ref, onProgress);
}
