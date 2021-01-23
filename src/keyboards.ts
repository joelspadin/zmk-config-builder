import type { Octokit } from '@octokit/rest';
import type { BuildTargetGroup } from './components/Wizard/KeyboardItem';
import { ZMK_MAIN_BRANCH } from './config';
import { RepoAndBranch, discoverBuildTargets, partitionBuildTargets, BuildTarget } from './targets';
import { flatten, groupBy } from './util';
import { getZmkRepo } from './zmk';

const cache = new Map<string, BuildTarget[]>();

export async function getKeyboards(octokit: Octokit, userRepos: RepoAndBranch[] = []) {
    const zmk = getZmkRepo(octokit);
    const defaultRepo = { repo: zmk, branch: await zmk.getDefaultBranch() };

    const promises = [defaultRepo, ...userRepos].map(getTargetsForRepo);
    const targets = flatten(await Promise.all(promises));

    return partitionBuildTargets(targets);
}

function getCacheKey(repo: RepoAndBranch) {
    return `${repo.repo.owner}/${repo.repo.name}/${repo.branch ?? 'default'}`;
}

async function getTargetsForRepo(repo: RepoAndBranch) {
    const key = getCacheKey(repo);
    const cached = cache.get(key);
    if (cached) {
        return cached;
    }

    const targets = await discoverBuildTargets(repo);
    cache.set(key, targets);
    return targets;
}

export function groupKeyboardsByRepo(targets: BuildTarget[]): BuildTargetGroup[] {
    const map = groupBy(targets, (t) => `${t.repo.repo.owner}/${t.repo.repo.name}`);

    const groups = [...map.entries()].map(([name, targets]) => ({
        name,
        targets,
    }));

    return groups.sort((a, b) => a.name.localeCompare(b.name));
}
