import React from 'react';
import { Graph, Node, Path, Point } from './graph';
import { GraphGrid } from './types';

export interface GraphStyle {
    readonly palette: readonly string[];
    readonly notCurrentColor: string;
    readonly nodeSize: number;
    readonly lineWidth: number;
    readonly curveSmoothness: number;
}

export interface GraphConfig {
    readonly grid: GraphGrid;
    readonly style: GraphStyle;
}

export interface IReactSvgRendererProps extends React.SVGProps<SVGSVGElement> {
    graph: Graph;
    config: GraphConfig;
    startRow?: number;
    rowCount?: number;
}

function getPosition(point: Point, config: GraphConfig): Point {
    return {
        x: point.x * config.grid.x + config.grid.offsetX,
        y: point.y * config.grid.y + config.grid.offsetY,
    };
}

function getColor(config: GraphConfig, index: number, isCurrent: boolean) {
    if (!isCurrent) {
        return config.style.notCurrentColor;
    }

    return config.style.palette[index % config.style.palette.length];
}

function findLastIndex<T>(
    array: readonly T[],
    predicate: (value: T, index: number, obj: readonly T[]) => boolean,
): number {
    let i = array.length;
    while (i--) {
        if (predicate(array[i], i, array)) {
            return i;
        }
    }
    return -1;
}

function createPath(path: Path, key: number, config: GraphConfig, startRow: number, rowCount: number) {
    const control = config.grid.y * config.style.curveSmoothness;
    const stroke = getColor(config, path.pathIndex, path.isCurrent);
    const endRow = startRow + rowCount;

    let startVertex = path.vertices.findIndex((point) => point.y >= startRow && point.y < endRow);

    if (startVertex < 0) {
        // The path might span the entire range to render with no vertices inside.
        // Check if there is a vertex
        const beforeVertex = findLastIndex(path.vertices, (point) => point.y < startRow);
        const spansRange = !path.isComplete || path.vertices.findIndex((point) => point.y >= endRow) >= 0;
        if (beforeVertex < 0 || !spansRange) {
            return null;
        }

        startVertex = beforeVertex;
    }

    startVertex = Math.max(0, startVertex - 1);
    let current = getPosition(path.vertices[startVertex], config);

    const d: string[] = [];
    d.push(`M${current.x},${current.y}`);

    for (let i = startVertex + 1; i < path.vertices.length; i++) {
        const next = getPosition(path.vertices[i], config);

        if (current.x === next.x) {
            d.push(`V${next.y}`);
        } else {
            d.push(`C${current.x},${current.y + control},${next.x},${next.y - control},${next.x},${next.y}`);
        }

        if (i === path.vertices.length - 1 && !path.isComplete) {
            const continued = getPosition({ x: next.x, y: endRow }, config);
            d.push(`V${continued.y}`);
            break;
        }

        current = next;
        if (path.vertices[i].y >= endRow) {
            break;
        }
    }

    if (d.length === 1) {
        return null;
    }

    return <path key={key} fill="none" stroke={stroke} strokeWidth={config.style.lineWidth} d={d.join()} />;
}

function createNode(node: Node, key: number, config: GraphConfig, startRow: number, rowCount: number) {
    const endRow = startRow + rowCount;
    if (node.position.y < startRow || node.position.y >= endRow) {
        return null;
    }

    const { x, y } = getPosition(node.position, config);
    const r = config.style.nodeSize / 2;
    const fill = getColor(config, node.pathIndex, node.isCurrent);

    return <circle key={key} cx={x} cy={y} r={r} fill={fill} />;
}

export const ReactSvgRenderer: React.FunctionComponent<IReactSvgRendererProps> = (props) => {
    const { graph, config, startRow = 0, rowCount = graph.commits.length - startRow, ...svgProps } = props;

    const width = graph.maxColumns * config.grid.x;
    const height = rowCount * config.grid.y;
    const startY = startRow * config.grid.y;

    const viewBox = `0 ${startY} ${width} ${height}`;

    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox={viewBox} width={width} height={height} {...svgProps}>
            {graph.paths.map((path, i, array) =>
                createPath(array[array.length - i - 1], i, config, startRow, rowCount),
            )}
            {graph.nodes.map((node, i) => createNode(node, i, config, startRow, rowCount))}
        </svg>
    );
};
