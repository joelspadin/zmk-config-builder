export interface Author {
    name: string;
    email: string;
    timestamp: number;
}

export interface Commit {
    readonly hash: string;
    readonly message: string;
    readonly parents: readonly string[];
    readonly isCurrent: boolean;
    readonly author: Author;
    readonly committer: Author;
    readonly branches?: readonly string[];
    readonly tags?: readonly string[];
}

export interface GraphGrid {
    readonly x: number;
    readonly y: number;
    readonly offsetX: number;
    readonly offsetY: number;
}
