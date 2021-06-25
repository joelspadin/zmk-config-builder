import React from 'react';
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

function getColor(config: GraphConfig, index: number) {
    return config.style.palette[index % config.style.palette.length];
}

function createPath(path: Path, key: number, config: GraphConfig, startRow: number, rowCount: number) {
    const control = config.grid.y * config.style.curveSmoothness;
    const stroke = getColor(config, path.pathIndex);
    const endRow = startRow + rowCount;

    let startVertex = path.vertices.findIndex((point) => point.y >= startRow && point.y < endRow);
    if (startVertex < 0) {
        return;
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

        current = next;
        if (path.vertices[i].y >= endRow) {
            break;
        }
    }

    return <path key={key} fill="none" stroke={stroke} strokeWidth={config.style.lineWidth} d={d.join()} />;
}

function createNode(node: Node, key: number, config: GraphConfig) {
    const { x, y } = getPosition(node.position, config);
    const r = config.style.nodeSize / 2;
    const fill = getColor(config, node.pathIndex);

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
            {graph.nodes.map((node, i) => createNode(node, i, config))}
        </svg>
    );
};
