import type { Octokit } from '@octokit/rest';

export interface RepoCreateOptions {
    private?: boolean;
}

interface EditFile {
    path: string;
    content: string;
}

interface DeleteFile {
    path: string;
    delete: true;
}

export type FileChange = EditFile | DeleteFile;

export interface CommitOptions {
    branch?: string;
    noOverwrite?: boolean;
}

export class NoFilesChangedError extends Error {
    constructor() {
        super('No files changed.');
    }
}

export class Repository {
    private defaultBranch?: string;

    static async create(octokit: Octokit, name: string, options?: RepoCreateOptions): Promise<Repository> {
        // Check if the repo already exists first.
        try {
            const owner = (await octokit.users.getAuthenticated()).data.login;
            const existing = await octokit.repos.get({ owner, repo: name });

            if (existing) {
                return new Repository(octokit, owner, existing.data.name);
            }
        } catch {
            // Ignore.
        }

        const response = await octokit.repos.createForAuthenticatedUser({
            name: name,
            private: options?.private,
            auto_init: true,
        });

        if (!response.data.owner) {
            throw new Error('Failed to get owner for new repo.');
        }

        return new Repository(octokit, response.data.owner.login, response.data.name);
    }

    constructor(public readonly octokit: Octokit, public readonly owner: string, public readonly name: string) {}

    get params() {
        return { owner: this.owner, repo: this.name };
    }

    async getDefaultBranch(): Promise<string> {
        if (this.defaultBranch === undefined) {
            const response = await this.octokit.repos.get({ ...this.params });
            this.defaultBranch = response.data.default_branch;
        }
        return this.defaultBranch;
    }

    async getLatestCommit(branch?: string): Promise<Commit> {
        branch = branch ?? (await this.getDefaultBranch());

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

    async createBranch(name: string, commit: Commit) {
        await this.octokit.git.createRef({
            ...this.params,
            ref: `refs/heads/${name}`,
            sha: commit.sha,
        });
    }

    async createCommit(changedFiles: FileChange[], message: string, options?: CommitOptions): Promise<Commit> {
        const { branch, noOverwrite } = options ?? {};
        const parent = await this.getLatestCommit(branch);

        if (noOverwrite) {
            changedFiles = await removeExistingFiles(changedFiles, parent.tree);
        }

        if (changedFiles.length === 0) {
            throw new NoFilesChangedError();
        }

        const blobs = await Promise.all(changedFiles.map((f) => this.createBlobForFile(f)));

        const tree = await this.octokit.git.createTree({
            ...this.params,
            base_tree: parent.tree.sha,
            tree: blobs.map((blob) => ({ type: 'blob', mode: '100644', ...blob })),
        });

        const commit = await this.octokit.git.createCommit({
            ...this.params,
            message,
            tree: tree.data.sha,
            parents: [parent.sha],
        });

        return new Commit(this, commit.data.sha, tree.data.sha);
    }

    async updateBranchToCommit(branch: string, commit: Commit) {
        await this.octokit.git.updateRef({
            ...this.params,
            ref: `heads/${branch}`,
            sha: commit.sha,
        });
    }

    async updateDefaultBranchToCommit(commit: Commit) {
        const branch = await this.getDefaultBranch();
        await this.updateBranchToCommit(branch, commit);

        return branch;
    }

    async createpullRequest(commit: Commit, targetBranch: string, branchHint?: string) {
        const prBranch = await this.createTemporaryBranch(commit, branchHint);
        const message = await commit.getCommitMessage();

        return await this.octokit.pulls.create({
            ...this.params,
            head: prBranch,
            base: targetBranch,
            title: message.split('\n')[0],
            body: message,
        });
    }

    private async createBlobForFile(change: FileChange) {
        const { path } = change;
        let sha: string | null;
        if ('delete' in change) {
            sha = null;
        } else {
            const blob = await this.octokit.git.createBlob({
                ...this.params,
                content: change.content,
                encoding: 'utf-8',
            });
            sha = blob.data.sha;
        }

        return { path, sha };
    }

    private async createTemporaryBranch(commit: Commit, branchHint = 'update') {
        const branches = await this.octokit.paginate(this.octokit.repos.listBranches, this.params);
        const branchNames = branches.map((b) => b.name);

        let name = `zmk-config-builder/${branchHint}`;
        let index = 1;

        function incrementName() {
            name = `zmk-config-builder/${branchHint}-${index}`;
            index++;
        }

        while (branchNames.includes(name)) {
            incrementName();
        }

        let maxRetries = 5;
        while (true) {
            try {
                await this.createBranch(name, commit);
                return name;
            } catch (error) {
                // The branch list may be out of date, so if creating one branch
                // fails, try a few more names.
                maxRetries--;

                if (maxRetries === 0) {
                    console.error(`Failed to create branch ${name}`);
                    throw error;
                }

                incrementName();
            }
        }
    }
}

export class Commit {
    private message?: string;

    tree: GitTree;

    constructor(private repo: Repository, public readonly sha: string, treeSha: string) {
        this.tree = new GitTree(this.repo, '', treeSha);
    }

    async getCommitMessage() {
        if (this.message === undefined) {
            const result = await this.repo.octokit.git.getCommit({
                ...this.repo.params,
                commit_sha: this.sha,
            });

            this.message = result.data.message;
        }

        return this.message;
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
        const [name, ...rest] = Array.isArray(path) ? path : splitPath(path);
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
        const dirs = Array.isArray(path) ? path : splitPath(path);

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

function splitPath(path: string) {
    return path.replace(/^\/|\/$/, '').split('/');
}

export async function getRepoExists(octokit: Octokit, owner: string, repo: string): Promise<boolean> {
    try {
        const result = await octokit.repos.get({ owner, repo });
        return result.data !== undefined;
    } catch {
        return false;
    }
}

export function dedupeFiles(files: FileChange[]): FileChange[] {
    const map = new Map<string, FileChange>();

    for (const file of files) {
        map.set(file.path, file);
    }

    return [...map.values()];
}

export async function removeExistingFiles(files: FileChange[], tree: GitTree): Promise<FileChange[]> {
    const filtered: FileChange[] = [];

    for (const file of files) {
        if ((await tree.getFile(file.path)) === undefined) {
            filtered.push(file);
        }
    }

    return filtered;
}
