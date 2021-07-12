import { DefaultButton, mergeStyleSets, Spinner, SpinnerSize, useTheme } from '@fluentui/react';
import FS from '@isomorphic-git/lightning-fs';
import React, { useCallback, useMemo, useReducer, useState } from 'react';
import { useAsync } from 'react-use';
import { HistoryProvider } from '../git/HistoryProvider';
import { GitGraph } from '../gitgraph/GitGraph';
import { GraphConfig } from '../gitgraph/ReactSvgRenderer';
import { useMessageBar } from '../MessageBarProvider';
import { Section, SectionHeader } from '../Section';
import { commitListReducer } from './CommitListReducer';

const classNames = mergeStyleSets({
    spinner: {
        marginTop: 8,
        marginBottom: 8,
    },
    button: {
        width: '100%',
    },
});

export interface IGraphViewProps {
    fs?: FS;
    dir: string;
}

export const GraphView: React.FunctionComponent<IGraphViewProps> = ({ fs, dir }) => {
    const [commits, dispatch] = useReducer(commitListReducer, []);
    const [loading, setLoading] = useState(false);

    const messageBar = useMessageBar();
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
                    theme.palette.purple,
                    theme.palette.blue,
                    theme.palette.teal,
                    theme.palette.yellow,
                    theme.palette.orange,
                    theme.palette.magentaLight,
                ],
                lineWidth: 4,
                nodeSize: 12,
                curveSmoothness: 0.5,
            },
        }),
        [theme],
    );

    const gitHistory = useMemo(() => {
        return fs ? new HistoryProvider(fs, dir) : undefined;
    }, [fs, dir]);

    const loadCommits = useCallback(async () => {
        if (!gitHistory) {
            return;
        }

        setLoading(true);

        try {
            const newCommits = await gitHistory.getCommits();

            dispatch({ type: 'add', commits: newCommits });
        } catch (error) {
            messageBar.error(error);
        }

        setLoading(false);
    }, [gitHistory, dispatch]);

    useAsync(async () => {
        dispatch({ type: 'clear' });
        await loadCommits();
    }, [loadCommits]);

    return (
        <>
            <Section>
                <SectionHeader>Git graph</SectionHeader>
                <GitGraph commits={commits} graphConfig={graphConfig} />
                {loading ? (
                    <Spinner size={SpinnerSize.large} label="Loading commits..." className={classNames.spinner} />
                ) : (
                    !gitHistory?.isComplete && (
                        <DefaultButton
                            text="Load more"
                            disabled={loading}
                            onClick={loadCommits}
                            className={classNames.button}
                        />
                    )
                )}
            </Section>
        </>
    );
};
