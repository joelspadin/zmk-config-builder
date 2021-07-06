import { ProgressCallback } from 'isomorphic-git';
import { IGitApi, RepoId } from './IGitApi';
import { RepoState } from './RepoProvider';

export async function cloneAndSelectRepo(
    state: RepoState,
    git: IGitApi,
    repo: RepoId,
    ref: string,
    onProgress?: ProgressCallback,
) {
    const fs = state.setRepo(repo);
    await git.cloneRepo(fs, repo, ref, onProgress);
}
