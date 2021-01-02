import { splitExt } from './path';
import type { Repository, GitTree, GitFile } from './repository';

interface Common {
    /** Name to display to the UI */
    name: string;
    /**
     * List of board or shield names to build. e.g. ["romac_plus"] for a single
     * board or ["corne_left", "corne_right"] for a split.
     */
    buildTargets: string[];
}

export interface Board extends Common {
    type: 'board';
    /** If true, this board is a keyboard on its own and does not need a shield. */
    isStandalone: boolean;
}

export interface Shield extends Common {
    type: 'shield';
}

export type BuildTarget = Board | Shield;

export function isShieldOrStandaloneBoard(target: BuildTarget) {
    return target.type === 'shield' || target.isStandalone;
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
    return findBuildTargets(tree, '.dts', getBoardFromDts);
}

function findShields(tree: GitTree): Promise<BuildTarget[]> {
    return findBuildTargets(tree, '.overlay', getShieldFromOverlay);
}

async function findBuildTargets(
    tree: GitTree,
    searchExt: string,
    handler: (tree: GitTree, name: string) => Promise<BuildTarget | undefined>
) {
    const targets: BuildTarget[] = [];

    for (const file of await tree.getFiles()) {
        const [name, ext] = splitExt(file.name);

        if (ext.toLowerCase() === searchExt) {
            const target = await handler(tree, name);
            if (target) {
                targets.push(target);
            }
        }
    }

    return targets;
}

async function getCommonInfo(tree: GitTree, name: string) {
    const buildTargets: string[] = [name];

    if (isSplitRight(name)) {
        // Don't return a split twice.
        return undefined;
    }

    if (isSplitLeft(name)) {
        name = getSplitCommonName(name);
        buildTargets.push(getSplitRightName(name));
    }

    return { name, buildTargets };
}

async function getBoardFromDts(tree: GitTree, name: string): Promise<Board | undefined> {
    const info = await getCommonInfo(tree, name);
    if (!info) {
        return undefined;
    }

    const isStandalone = await hasKeymap(tree, info.name);

    return { type: 'board', ...info, isStandalone };
}

async function getShieldFromOverlay(tree: GitTree, name: string): Promise<Shield | undefined> {
    const info = await getCommonInfo(tree, name);
    if (!info) {
        return undefined;
    }

    return { type: 'shield', ...info };
}

async function hasKeymap(tree: GitTree, name: string): Promise<boolean> {
    const keymapFile = `${name}.keymap`;
    return (await tree.getFiles()).some((file) => file.name.toLowerCase() === keymapFile.toLowerCase());
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
