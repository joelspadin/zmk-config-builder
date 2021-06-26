import { useTheme } from '@fluentui/react';
import React, { useMemo } from 'react';
import { GitGraph } from '../gitgraph/GitGraph';
import { GraphConfig } from '../gitgraph/ReactSvgRenderer';
import { Commit } from '../gitgraph/types';
import { Section } from '../Section';

const mockCommits: Commit[] = [
    {
        hash: 'd2',
        message: 'Break it more',
        parents: ['d'],
    },
    {
        hash: '5',
        message: 'Four',
        parents: ['4'],
        branches: ['main'],
        tags: ['also-v1.0'],
    },
    {
        hash: 'd',
        message: 'Break everything',
        parents: [],
    },
    {
        hash: '4',
        message: 'Three',
        parents: ['3'],
        tags: ['v1.0'],
    },
    {
        hash: 'b2',
        message: 'Fix things',
        parents: ['b1'],
        branches: ['feature-2'],
    },
    {
        hash: '3',
        message: 'An octopus is fine too',
        parents: ['2', 'a1', 'b1'],
        tags: ['tag'],
    },
    {
        hash: 'b1',
        message: 'Branch 2',
        parents: ['2'],
    },
    {
        hash: '2',
        message: 'Two',
        parents: ['1'],
    },
    {
        hash: 'c',
        message: "I'm lonely",
        parents: [],
    },
    {
        hash: 'a1',
        message: 'Branch!',
        parents: ['1'],
        branches: ['feature-1'],
    },
    {
        hash: '1',
        message: 'One',
        parents: ['0'],
    },
    {
        hash: '0',
        message: 'Initial commit',
        parents: [],
    },
];

export const GitGraphPage: React.FunctionComponent = () => {
    const theme = useTheme();
    const graphConfig = useMemo<GraphConfig>(
        () => ({
            grid: {
                x: 28,
                y: 28,
                offsetX: 14,
                offsetY: 14,
            },
            style: {
                palette: [
                    theme.palette.blue,
                    theme.palette.purple,
                    theme.palette.magentaLight,
                    theme.palette.teal,
                    theme.palette.yellow,
                    theme.palette.orange,
                ],
                lineWidth: 4,
                nodeSize: 12,
                curveSmoothness: 0.5,
            },
        }),
        [theme],
    );

    return (
        <Section>
            <p>This graph shows the commits in your repo.</p>
            <p>TODO: add a way to switch branches here.</p>
            <GitGraph commits={mockCommits} graphConfig={graphConfig} />
        </Section>
    );
};
