import { Commit } from './types';

export interface Point {
    x: number;
    y: number;
}

export interface Path {
    vertices: Point[];
    pathIndex: number;
    isCurrent: boolean;
    isComplete?: boolean;
}

export interface Node {
    position: Point;
    pathIndex: number;
    isCurrent: boolean;
}

interface Lane {
    path: Path;
    nextCommit: string;
    ended?: boolean;
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
    private _maxColumns = 0;

    constructor(commits?: readonly Commit[]) {
        if (commits) {
            this.addCommits(commits);
        }
    }

    public addCommits(commits: readonly Commit[]): void {
        for (const commit of commits) {
            this.addCommit(commit);
        }
    }

    public addCommit(commit: Commit): void {
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
        this.removeEndedLanes();

        this._commits.push(commit);
    }

    private updateMaxColumns(point: Point) {
        this._maxColumns = Math.max(this._maxColumns, point.x + 1);
    }

    private createLane(nextCommit: string, isCurrent: boolean, pathIndex: number, startPosition: Point) {
        const lane: Lane = {
            nextCommit,
            path: {
                pathIndex,
                vertices: [startPosition],
                isCurrent,
            },
        };
        this.lanes.push(lane);
        this._paths.push(lane.path);

        this.updateMaxColumns(startPosition);

        return lane;
    }

    private setLaneIsCurrent(lane: Lane, isCurrent: boolean) {
        lane.path.isComplete = true;

        const oldPath = lane.path;
        lane.path = {
            vertices: oldPath.vertices.slice(-1),
            pathIndex: oldPath.pathIndex,
            isCurrent,
        };

        this._paths.push(lane.path);
    }

    private addCommitToNextLane(commit: Commit) {
        const position = {
            x: this.lanes.length,
            y: this.commits.length,
        };

        this._nodes.push({ position, isCurrent: commit.isCurrent, pathIndex: this.nextPathIndex });
        this.updateMaxColumns(position);

        if (commit.parents.length === 0) {
            // Orphan commit. Occupies a column for one row only.
            this.nextPathIndex++;
        }

        for (const parent of commit.parents) {
            this.createLane(parent, commit.isCurrent, this.nextPathIndex, position);
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

        if (commit.isCurrent !== lane.path.isCurrent) {
            this.setLaneIsCurrent(lane, commit.isCurrent);
        }

        this.updateMaxColumns(position);

        if (!isJoin) {
            this._nodes.push({ position, isCurrent: commit.isCurrent, pathIndex: lane.path.pathIndex });
        }

        if (commit.parents.length === 0 || isJoin) {
            lane.ended = true;
            lane.path.isComplete = true;
        } else {
            lane.nextCommit = commit.parents[0];

            for (const parent of commit.parents.slice(1)) {
                this.createLane(parent, commit.isCurrent, this.nextPathIndex, position);
                this.nextPathIndex++;
            }
        }
    }

    private updateLanePaths() {
        const y = this.commits.length;

        for (let x = 0; x < this.lanes.length; x++) {
            const lane = this.lanes[x];
            const lastVertex = lane.path.vertices[lane.path.vertices.length - 1];

            if (y > lastVertex.y && x !== lastVertex.x) {
                this.addNodeIfShifting(lane, lastVertex.x, x, y);
                const point = { x, y };
                lane.path.vertices.push(point);
                this.updateMaxColumns(point);
            }
        }
    }

    private removeEndedLanes() {
        this.lanes = this.lanes.filter((lane) => !lane.ended);
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
