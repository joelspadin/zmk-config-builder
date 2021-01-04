import { splitExt } from './path';
import type { Repository, GitTree, GitFile } from './repository';

export interface BuildTarget {
    type: 'board' | 'shield';
    /** Name to display to the UI */
    name: string;
    /**
     * List of board or shield names to build. e.g. ["romac_plus"] for a single
     * board or ["corne_left", "corne_right"] for a split.
     */
    buildTargets: string[];
    /**
     * Full path to the .keymap file (if it exists).
     */
    keymapPath?: string;
    /**
     * Full path to the .conf file (if it exists).
     */
    confPath?: string;
}

export interface Build {
    keyboard: BuildTarget;
    controller?: BuildTarget;
}

export function isShieldOrStandaloneBoard(target: BuildTarget): boolean {
    return target.type === 'shield' || !!target.keymapPath;
}

export interface RepoAndBranch {
    repo: Repository;
    branch?: string;
}

export async function discoverBuildTargets(repos: RepoAndBranch | RepoAndBranch[]) {
    const targets: BuildTarget[] = [];

    repos = Array.isArray(repos) ? repos : [repos];

    for (const { repo, branch } of repos) {
        const commit = await repo.getLatestCommit(branch);
        const tree = commit.tree;

        targets.push(
            ...(await searchSubdirectoriesOf(tree, 'app/boards/arm', findBoards)),
            ...(await searchSubdirectoriesOf(tree, 'app/boards/shields', findShields)),
            ...(await searchSubdirectoriesOf(tree, 'config/boards/arm', findBoards)),
            ...(await searchSubdirectoriesOf(tree, 'config/boards/shields', findShields))
        );
    }

    return targets.sort((a, b) => a.name.localeCompare(b.name));
}

export interface PartitionedTargets {
    /** Shields and standalone boards. Selected in the UI first. */
    keyboards: BuildTarget[];
    /** Boards which can be plugged into a shield. */
    controllers: BuildTarget[];
}

export function partitionBuildTargets(targets: BuildTarget[]): PartitionedTargets {
    return {
        keyboards: targets.filter((item) => isShieldOrStandaloneBoard(item)),
        controllers: targets.filter((item) => !isShieldOrStandaloneBoard(item)),
    };
}

async function searchSubdirectoriesOf(
    tree: GitTree,
    path: string,
    searchFunc: (tree: GitTree) => Promise<BuildTarget[]>
) {
    const root = await tree.getDirectory(path);
    if (!root) {
        return [];
    }

    const targets: BuildTarget[] = [];

    for (const dir of await root.getDirectories()) {
        targets.push(...(await searchFunc(dir)));
    }

    return targets;
}

function findBoards(tree: GitTree): Promise<BuildTarget[]> {
    return findBuildTargets(tree, '.dts', 'board');
}

function findShields(tree: GitTree): Promise<BuildTarget[]> {
    return findBuildTargets(tree, '.overlay', 'shield');
}

async function findBuildTargets(tree: GitTree, searchExt: string, type: 'board' | 'shield') {
    const targets: BuildTarget[] = [];

    for (const file of await tree.getFiles()) {
        const [name, ext] = splitExt(file.name);

        if (ext.toLowerCase() === searchExt) {
            const target = await getBuildInfo(tree, name, type);
            if (target) {
                targets.push(target);
            }
        }
    }

    return targets;
}

async function getBuildInfo(tree: GitTree, name: string, type: 'board' | 'shield'): Promise<BuildTarget | undefined> {
    const buildTargets: string[] = [name];

    if (isSplitRight(name)) {
        // Don't return a split twice.
        return undefined;
    }

    if (isSplitLeft(name)) {
        name = getSplitCommonName(name);
        buildTargets.push(getSplitRightName(name));
    }

    const keymapPath = await findFileFullPath(tree, `${name}.keymap`);
    const confPath =
        (await findFileFullPath(tree, `${name}.conf`)) ?? (await findFileFullPath(tree, `${name}_defconfig`));

    return { type, name, buildTargets, keymapPath, confPath };
}

async function findFileFullPath(tree: GitTree, name: string): Promise<string | undefined> {
    return (await findFile(tree, name))?.path;
}

async function findFile(tree: GitTree, name: string): Promise<GitFile | undefined> {
    return (await tree.getFiles()).find((file) => file.name.toLowerCase() === name.toLowerCase());
}

function isSplitLeft(name: string) {
    return name.endsWith('_left');
}

function isSplitRight(name: string) {
    return name.endsWith('_right');
}

function getSplitCommonName(name: string) {
    return name.replace('_left', '');
}

function getSplitRightName(name: string) {
    return `${name}_right`;
}
