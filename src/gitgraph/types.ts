export interface Commit {
    readonly hash: string;
    readonly message: string;
    readonly parents: readonly string[];
    readonly author?: string;
    readonly branches?: readonly string[];
    readonly tags?: readonly string[];
}

export interface GraphGrid {
    readonly x: number;
    readonly y: number;
    readonly offsetX: number;
    readonly offsetY: number;
}
