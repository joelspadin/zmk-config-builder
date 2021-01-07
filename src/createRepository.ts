import type { Octokit } from '@octokit/rest';
import { Commit, FileChange, RepoCreateOptions, Repository } from './repository';
import type { Build } from './targets';
import { getGitHubWorkflowFile, getWestConfigFile } from './templates';
import { basename } from './util';
import { getZmkRepo } from './zmk';

export interface UserRepoOptions extends RepoCreateOptions {
    builds: Build[];
}

export async function createUserRepository(octokit: Octokit, name: string, options: UserRepoOptions) {
    const { builds, ...repoOptions } = options;

    const repo = await Repository.create(octokit, name, repoOptions);
    const files = await getNewRepoFiles(octokit, builds);
    const commit = await repo.createNewCommit(files, 'Add initial keyboards');

    const branch = await repo.updateDefaultBranchToCommit(commit);

    return { repo, commit, branch };
}

async function getNewRepoFiles(octokit: Octokit, builds: Build[]): Promise<FileChange[]> {
    const zmk = getZmkRepo(octokit);
    const latestCommit = await zmk.getLatestCommit();

    // Global config files
    const files = await Promise.all([getGitHubWorkflowFile(builds), getWestConfigFile()]);

    // Per-build files
    for (const build of builds) {
        for await (const file of getBuildConfigFiles(latestCommit, build)) {
            files.push(file);
        }
    }

    // We can get duplicate entries if the same board/shield is used multiple times.
    // Only change each file once.
    return dedupeFiles(files);
}

function dedupeFiles(files: FileChange[]): FileChange[] {
    const map = new Map<string, FileChange>();

    for (const file of files) {
        map.set(file.path, file);
    }

    return [...map.values()];
}

async function* getBuildConfigFiles(source: Commit, build: Build): AsyncGenerator<FileChange> {
    if (build.keyboard.keymapPath) {
        const name = basename(build.keyboard.keymapPath);
        const file = await copyFileFromZmk(source, build.keyboard.keymapPath, `config/${name}`);

        if (file) {
            yield file;
        }
    }

    if (build.keyboard.confPath) {
        const name = basename(build.keyboard.confPath);
        const file = await copyFileFromZmk(source, build.keyboard.confPath, `config/${name}`);

        if (file) {
            yield file;
        }
    }
}

async function copyFileFromZmk(source: Commit, srcPath: string, destPath: string): Promise<FileChange | undefined> {
    const file = await source.tree.getFile(srcPath);

    if (!file) {
        return undefined;
    }

    return {
        path: destPath,
        content: await file.getText(),
    };
}
