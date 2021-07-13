import FS from '@isomorphic-git/lightning-fs';
import * as git from 'isomorphic-git';
import { Commit } from '../gitgraph/types';

function mapAppend<K, V>(map: Map<K, V[]>, key: K, value: V) {
    let list = map.get(key);
    if (!list) {
        list = [];
        map.set(key, list);
    }

    list.push(value);
}

interface HeadState {
    head: git.ReadCommitResult;
    isCurrent: boolean;
}

export class HistoryProvider {
    public static readonly DEFAULT_PAGE_SIZE = 40;

    private initialized = false;
    private currentCommit: string | undefined;
    private commits = new Map<string, git.ReadCommitResult>();
    private heads: HeadState[] = [];
    private branches = new Map<string, string[]>();
    private tags = new Map<string, string[]>();

    constructor(private readonly fs: FS, private readonly dir: string) {}

    get isComplete(): boolean {
        return this.heads.length === 0;
    }

    async getCommits(depth = HistoryProvider.DEFAULT_PAGE_SIZE): Promise<Commit[]> {
        await this.init();

        const commits: Commit[] = [];

        for (let i = 0; i < depth; i++) {
            const commit = await this.getNextCommit();
            if (commit) {
                commits.push(commit);
            } else {
                break;
            }
        }

        return commits;
    }

    private async getNextCommit(): Promise<Commit | undefined> {
        if (this.isComplete) {
            return;
        }

        const head = this.heads[0];
        if (this.commits.has(head.head.oid)) {
            // This head has merged with another branch. Get rid of it so we
            // aren't tracking multiple paths through the same branch.
            this.heads.splice(0, 1);
            return await this.getNextCommit();
        }

        if (head.head.oid === this.currentCommit) {
            head.isCurrent = true;
        }

        this.commits.set(head.head.oid, head.head);
        const commit: Commit = {
            hash: head.head.oid,
            parents: head.head.commit.parent,
            message: head.head.commit.message,
            author: head.head.commit.author.name,
            branches: this.branches.get(head.head.oid),
            tags: this.tags.get(head.head.oid),
            isCurrent: head.isCurrent,
        };

        if (head.head.commit.parent.length === 0) {
            // Last commit in this branch.
            this.heads.splice(0, 1);
        }

        for (let i = 0; i < head.head.commit.parent.length; i++) {
            const ref = head.head.commit.parent[i];
            const parent = await git.log({ ...this.props, ref, depth: 1 });

            if (i === 0) {
                this.updateHead(head, parent[0]);
            } else {
                this.addHead(parent[0], head.isCurrent);
            }
        }

        this.sortHeads();

        return commit;
    }

    private get props() {
        return { fs: this.fs, dir: this.dir };
    }

    private async init() {
        if (this.initialized) {
            return;
        }

        await this.loadCurrentCommit();
        await this.loadBranches();
        await this.loadTags();

        this.sortHeads();
        this.initialized = true;
    }

    private async loadBranches() {
        const local = { remote: undefined };
        const remotes = [local, ...(await git.listRemotes(this.props))];

        for (const { remote } of remotes) {
            const branches = await git.listBranches({ ...this.props, remote });

            for (const branch of branches) {
                if (branch === 'HEAD') {
                    continue;
                }

                const ref = remote ? `${remote}/${branch}` : branch;
                const commit = await git.log({ ...this.props, ref, depth: 1 });

                mapAppend(this.branches, commit[0].oid, ref);
                this.addHead(commit[0]);
            }
        }
    }

    private async loadTags() {
        const tags = await git.listTags(this.props);

        for (const tag of tags) {
            const commit = await git.log({ ...this.props, ref: tag, depth: 1 });

            mapAppend(this.tags, commit[0].oid, tag);
        }
    }

    private async loadCurrentCommit() {
        const head = await git.log({ ...this.props, depth: 1 });
        this.currentCommit = head[0].oid;
        this.addHead(head[0], true);
    }

    private addHead(commit: git.ReadCommitResult, isCurrent = false) {
        const existing = this.heads.filter((x) => x.head.oid === commit.oid);
        if (existing.length > 0) {
            existing.forEach((head) => (head.isCurrent = true));
            return;
        }

        this.heads.push({ head: commit, isCurrent });
    }

    private updateHead(head: HeadState, commit: git.ReadCommitResult) {
        if (this.heads.some((x) => x.isCurrent && x.head.oid === commit.oid)) {
            head.isCurrent = true;
        }

        head.head = commit;
    }

    private sortHeads() {
        this.heads.sort((a, b) => b.head.commit.committer.timestamp - a.head.commit.committer.timestamp);
    }
}
