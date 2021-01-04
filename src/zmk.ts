import type { Octokit } from '@octokit/rest';
import { ZMK_OWNER, ZMK_REPO } from './config';
import { Repository } from './repository';

export function getZmkRepo(octokit: Octokit) {
    return new Repository(octokit, ZMK_OWNER, ZMK_REPO);
}
