import type { Octokit } from '@octokit/rest';
import { ZMK_OWNER, ZMK_REPO } from './config';
import { Commit, dedupeFiles, FileChange, Repository } from './repository';
import type { Build } from './targets';
import { getGitHubWorkflowFile, getWestConfigFile, WEST_FILE } from './templates';
import { basename } from './util';

export function getZmkRepo(octokit: Octokit) {
    return new Repository(octokit, ZMK_OWNER, ZMK_REPO);
}

/**
 * Runs some heuristics against a repo to check if it is either a ZMK user config
 * repo or an empty repo that could be turned into one.
 */
export async function isUserConfigRepo(repo: Repository, branch?: string) {
    const ALLOWED_DIRS = ['.github', 'config'];
    const ALLOWED_FILES = [/^readme/i, /^license/i, /^\.gitignore$/];

    const latest = await repo.getLatestCommit(branch);
    const westConfig = await latest.tree.getFile(WEST_FILE);
    if (westConfig) {
        return true;
    }

    const directories = await latest.tree.getDirectories();
    for (const dir of directories) {
        if (!ALLOWED_DIRS.includes(dir.name)) {
            return false;
        }
    }

    const files = await latest.tree.getFiles();
    for (const file of files) {
        if (!ALLOWED_FILES.some((pattern) => pattern.test(file.name))) {
            return false;
        }
    }

    return true;
}

/**
 * Gets all the files needed to initialize a new ZMK user config repo.
 */
export async function getNewRepoFiles(octokit: Octokit, builds: Build[]): Promise<FileChange[]> {
    // Global config files
    const files = await Promise.all([getGitHubWorkflowFile(builds), getWestConfigFile()]);

    // Per-build files
    files.push(...(await getNewKeymapFiles(octokit, builds)));

    return dedupeFiles(files);
}

export async function getNewKeymapFiles(octokit: Octokit, builds: Build[]): Promise<FileChange[]> {
    const zmk = getZmkRepo(octokit);
    const latestCommit = await zmk.getLatestCommit();

    const files: FileChange[] = [];

    for (const build of builds) {
        for await (const file of getBuildConfigFiles(latestCommit, build)) {
            files.push(file);
        }
    }

    // We can get duplicate entries if the same board/shield is used multiple times.
    // Only change each file once.
    return dedupeFiles(files);
}

export async function* getBuildConfigFiles(source: Commit, build: Build): AsyncGenerator<FileChange> {
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

export async function copyFileFromZmk(
    source: Commit,
    srcPath: string,
    destPath: string
): Promise<FileChange | undefined> {
    const file = await source.tree.getFile(srcPath);

    if (!file) {
        return undefined;
    }

    return {
        path: destPath,
        content: await file.getText(),
    };
}
