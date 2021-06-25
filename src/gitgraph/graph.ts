import { Commit } from './types';

export interface Point {
    x: number;
    y: number;
}

export interface Path {
    vertices: Point[];
    pathIndex: number;
}

export interface Node {
    position: Point;
    pathIndex: number;
}

interface Lane {
    path: Path;
    nextCommit: string;
}

export class Graph {
    public get commits(): readonly Commit[] {
        return this._commits;
    }

    public get paths(): readonly Path[] {
        return this._paths;
    }

    public get nodes(): readonly Node[] {
        return this._nodes;
    }

    public get maxColumns(): number {
        return this._maxColumns;
    }

    private _commits: Commit[] = [];
    private _paths: Path[] = [];
    private _nodes: Node[] = [];
    private lanes: Lane[] = [];
    private nextPathIndex = 0;
    private removeLaneIndex = -1;
    private _maxColumns: number = 0;

    constructor(commits?: readonly Commit[]) {
        if (commits) {
            this.addCommits(commits);
        }
    }

    public addCommits(commits: readonly Commit[]) {
        for (const commit of commits) {
            this.addCommit(commit);
        }
    }

    public addCommit(commit: Commit) {
        let firstLane = -1;
        for (let i = 0; i < this.lanes.length; i++) {
            if (this.lanes[i].nextCommit === commit.hash) {
                if (firstLane < 0) {
                    this.addCommitToLane(commit, i);
                    firstLane = i;
                } else {
                    this.addCommitToLane(commit, i, firstLane);
                }
            }
        }

        if (firstLane < 0) {
            this.addCommitToNextLane(commit);
        }

        this.updateLanePaths();
        this.removeEndedLane();

        this._commits.push(commit);
    }

    private updateMaxColumns(point: Point) {
        this._maxColumns = Math.max(this._maxColumns, point.x + 1);
    }

    private createLane(nextCommit: string, pathIndex: number, startPosition: Point) {
        const lane: Lane = {
            nextCommit,
            path: {
                pathIndex,
                vertices: [startPosition],
            },
        };
        this.lanes.push(lane);
        this._paths.push(lane.path);

        this.updateMaxColumns(startPosition);

        return lane;
    }

    private addCommitToNextLane(commit: Commit) {
        const position = {
            x: this.lanes.length,
            y: this.commits.length,
        };

        this._nodes.push({ position, pathIndex: this.nextPathIndex });
        this.updateMaxColumns(position);

        if (commit.parents.length === 0) {
            // Orphan commit. Occupies a column for one row only.
            this.nextPathIndex++;
        }

        for (const parent of commit.parents) {
            this.createLane(parent, this.nextPathIndex, position);
            this.nextPathIndex++;
        }
    }

    private addCommitToLane(commit: Commit, laneIndex: number, column?: number) {
        column = column ?? laneIndex;
        const isJoin = column !== laneIndex;

        const position = {
            x: column,
            y: this.commits.length,
        };

        const lane = this.lanes[laneIndex];

        if (lane.path.vertices.length > 0) {
            const lastVertex = lane.path.vertices[lane.path.vertices.length - 1];
            this.addNodeIfShifting(lane, lastVertex.x, position.x, position.y);
        }

        lane.path.vertices.push(position);
        this.updateMaxColumns(position);

        if (!isJoin) {
            this._nodes.push({ position, pathIndex: lane.path.pathIndex });
        }

        if (commit.parents.length === 0 || isJoin) {
            this.removeLaneIndex = laneIndex;
        } else {
            lane.nextCommit = commit.parents[0];

            for (const parent of commit.parents.slice(1)) {
                this.createLane(parent, this.nextPathIndex, position);
                this.nextPathIndex++;
            }
        }
    }

    private updateLanePaths() {
        const y = this.commits.length;

        for (let x = 0; x < this.lanes.length; x++) {
            const lane = this.lanes[x];
            let lastVertex = lane.path.vertices[lane.path.vertices.length - 1];

            if (y > lastVertex.y && x !== lastVertex.x) {
                this.addNodeIfShifting(lane, lastVertex.x, x, y);
                const point = { x, y };
                lane.path.vertices.push(point);
                this.updateMaxColumns(point);
            }
        }
    }

    private removeEndedLane() {
        if (this.removeLaneIndex >= 0) {
            this.lanes.splice(this.removeLaneIndex, 1);
            this.removeLaneIndex = -1;
        }
    }

    private addNodeIfShifting(lane: Lane, prevColumn: number, newColumn: number, newRow: number) {
        if (lane.path.vertices.length === 0) {
            return;
        }

        const lastVertex = lane.path.vertices[lane.path.vertices.length - 1];
        if (newColumn !== lastVertex.x && newRow > lastVertex.y + 1) {
            lane.path.vertices.push({ x: prevColumn, y: newRow - 1 });
        }
    }
}
