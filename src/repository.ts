import type { Octokit } from '@octokit/rest';

export class Repository {
    constructor(public readonly octokit: Octokit, public readonly owner: string, public readonly repo: string) {}

    async getLatestCommit(branch = 'main'): Promise<Commit> {
        const { data: refData } = await this.octokit.git.getRef({
            ...this.params,
            ref: `heads/${branch}`,
        });
        const commitSha = refData.object.sha;
        const { data: commitData } = await this.octokit.git.getCommit({
            ...this.params,
            commit_sha: commitSha,
        });
        return new Commit(this, commitSha, commitData.tree.sha);
    }

    get params() {
        return { owner: this.owner, repo: this.repo };
    }
}

export class Commit {
    tree: GitTree;

    constructor(private repo: Repository, public readonly commitSha: string, treeSha: string) {
        this.tree = new GitTree(this.repo, '', treeSha);
    }
}

interface TreeItem {
    path: string;
    type: string;
    sha: string;
}

export class GitTree {
    private items?: TreeItem[];
    private directories?: GitTree[];
    private files?: GitFile[];

    constructor(
        private repo: Repository,
        public readonly name: string,
        public readonly sha: string,
        public readonly parent?: GitTree
    ) {}

    get path(): string {
        return this.parent ? `${this.parent.path}/${this.name}` : this.name;
    }

    async getDirectory(path: string | string[]): Promise<GitTree | undefined> {
        if (typeof path === 'string' && path.startsWith('/')) {
            path = path.substr(1);
        }

        const [name, ...rest] = Array.isArray(path) ? path : path.split('/');
        if (!name) {
            return undefined;
        }

        const directories = await this.getDirectories();
        const result = directories.find((item) => item.name === name);

        if (result === undefined) {
            return undefined;
        }

        if (rest.length === 0) {
            return result;
        }

        return result.getDirectory(rest);
    }

    async getFile(path: string | string[]): Promise<GitFile | undefined> {
        const dirs = Array.isArray(path) ? path : path.split('/');

        const filename = dirs.pop();
        const parent = await this.getDirectory(dirs);
        if (parent === undefined || filename === undefined) {
            return;
        }

        const files = await parent.getFiles();
        return files.find((item) => item.name === filename);
    }

    async getDirectories(): Promise<GitTree[]> {
        if (this.directories === undefined) {
            const items = await this.getItems();
            this.directories = items
                .filter((item) => item.type === 'tree')
                .map((item) => new GitTree(this.repo, item.path, item.sha, this))
                .sort((a, b) => a.name.localeCompare(b.name));
        }
        return this.directories;
    }

    async getFiles(): Promise<GitFile[]> {
        if (this.files === undefined) {
            const items = await this.getItems();
            this.files = items
                .filter((item) => item.type === 'blob')
                .map((item) => new GitFile(this.repo, item.path, item.sha, this))
                .sort((a, b) => a.name.localeCompare(b.name));
        }
        return this.files;
    }

    private async getItems() {
        if (this.items === undefined) {
            const { data } = await this.repo.octokit.git.getTree({
                ...this.repo.params,
                tree_sha: this.sha,
            });

            this.items = [];
            for (const { path, type, sha } of data.tree) {
                if (path && type && sha) {
                    this.items.push({ path, type, sha });
                }
            }
        }
        return this.items;
    }
}

export class GitFile {
    constructor(
        private repo: Repository,
        public readonly name: string,
        public readonly sha: string,
        public readonly parent: GitTree
    ) {}

    get path(): string {
        return `${this.parent.path}/${this.name}`;
    }

    async getText(): Promise<string> {
        const { data } = await this.repo.octokit.git.getBlob({
            ...this.repo.params,
            file_sha: this.sha,
        });
        return atob(data.content);
    }
}
