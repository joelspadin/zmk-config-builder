import { Graph, Node, Path, Point } from './graph';
import { GraphGrid } from './types';

export interface GraphStyle {
    readonly palette: readonly string[];
    readonly nodeSize: number;
    readonly lineWidth: number;
    readonly curveSmoothness: number;
}

export interface GraphConfig {
    readonly grid: GraphGrid;
    readonly style: GraphStyle;
}

export class CanvasRenderer {
    constructor(public readonly config: GraphConfig) {}

    // TODO: add option to limit to rows
    public draw(graph: Graph, canvas: HTMLCanvasElement, startRow = 0, rowCount?: number) {
        rowCount = rowCount ?? graph.commits.length - startRow;

        canvas.width = graph.maxColumns * this.config.grid.x;
        canvas.height = rowCount * this.config.grid.y;

        const ctx = canvas.getContext('2d');
        if (ctx) {
            this.drawPaths(ctx, graph, startRow, rowCount);
            this.drawNodes(ctx, graph, startRow, rowCount);
        }
    }

    private drawPaths(ctx: CanvasRenderingContext2D, graph: Graph, startRow: number, rowCount: number) {
        for (let i = graph.paths.length - 1; i >= 0; i--) {
            this.drawPath(ctx, graph.paths[i], startRow, rowCount);
        }
    }

    private drawPath(ctx: CanvasRenderingContext2D, path: Path, startRow: number, rowCount: number) {
        const control = this.config.grid.y * this.config.style.curveSmoothness;
        const endRow = startRow + rowCount;

        let startVertex = path.vertices.findIndex((point) => point.y >= startRow && point.y < endRow);
        if (startVertex < 0) {
            return;
        }

        startVertex = Math.max(0, startVertex - 1);
        let current = this.getPosition(path.vertices[startVertex], startRow);

        ctx.strokeStyle = this.getColor(path.pathIndex);
        ctx.lineWidth = this.config.style.lineWidth;

        ctx.beginPath();
        ctx.moveTo(current.x, current.y);

        for (let i = startVertex + 1; i < path.vertices.length; i++) {
            const next = this.getPosition(path.vertices[i], startRow);

            if (current.x === next.x) {
                ctx.lineTo(next.x, next.y);
            } else {
                ctx.bezierCurveTo(current.x, current.y + control, next.x, next.y - control, next.x, next.y);
            }

            current = next;

            if (path.vertices[i].y >= endRow) {
                break;
            }
        }

        ctx.stroke();
    }

    private drawNodes(ctx: CanvasRenderingContext2D, graph: Graph, startRow: number, rowCount: number) {
        for (const node of graph.nodes) {
            if (node.position.y >= startRow && node.position.y < startRow + rowCount) {
                this.drawNode(ctx, node, startRow);
            }
        }
    }

    private drawNode(ctx: CanvasRenderingContext2D, node: Node, startRow: number) {
        ctx.fillStyle = this.getColor(node.pathIndex);

        const { x, y } = this.getPosition(node.position, startRow);
        const r = this.config.style.nodeSize / 2;

        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.fill();
    }

    private getColor(index: number) {
        return this.config.style.palette[index % this.config.style.palette.length];
    }

    private getPosition(point: Point, startRow: number): Point {
        return {
            x: point.x * this.config.grid.x + this.config.grid.offsetX,
            y: (point.y - startRow) * this.config.grid.y + this.config.grid.offsetY,
        };
    }
}
