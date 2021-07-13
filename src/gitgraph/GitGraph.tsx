import {
    classNamesFunction,
    FocusZone,
    FocusZoneDirection,
    IPageProps,
    IRenderFunction,
    IStyle,
    ITheme,
    List,
    mergeStyleSets,
    useTheme,
} from '@fluentui/react';
import React, { useCallback, useMemo } from 'react';
import { Graph } from './graph';
import { GraphConfig, ReactSvgRenderer } from './ReactSvgRenderer';
import { Commit } from './types';

export interface IGitGraphStyleProps {
    theme: ITheme;
    styles?: Partial<IGitGraphStyles>;
    graphWidth: number;
}

export interface IGitGraphStyles {
    container: IStyle;
    page: IStyle;
    graph: IStyle;
    graphViewport: IStyle;
    pageContent: IStyle;
    itemCell: IStyle;
    itemCellAlt: IStyle;
    branch: IStyle;
    tag: IStyle;
    message: IStyle;
    messageAlt: IStyle;
}

export interface IGitGraphProps {
    commits: Commit[];
    graphConfig: GraphConfig;
    styles?: Partial<IGitGraphStyles>;
}

const getClassNames = classNamesFunction<IGitGraphStyleProps, IGitGraphStyles>();

function isOdd(x: number) {
    return x % 2 === 1;
}

const MAX_GRAPH_COLUMNS = 10;

export const GitGraph: React.FunctionComponent<IGitGraphProps> = ({ commits, graphConfig, styles }) => {
    const graph = useMemo(() => new Graph(commits), [commits]);

    const graphWidth = Math.min(graph.maxColumns, MAX_GRAPH_COLUMNS) * graphConfig.grid.x;

    const theme = useTheme();
    const classNames = getClassNames(
        ({ theme, styles, graphWidth }) => {
            const tag: IStyle = {
                display: 'inline-block',
                borderWidth: 1,
                borderStyle: 'solid',
                borderRadius: theme.effects.roundedCorner4,
                lineHeight: graphConfig.grid.y - 8,
                paddingLeft: 5,
                paddingRight: 5,
                marginInlineEnd: 8,
                whiteSpace: 'nowrap',
            };

            return mergeStyleSets(
                {
                    container: {
                        overflow: 'auto',
                        maxHeight: 500,
                    },
                    page: {
                        position: 'relative',
                    },
                    graph: {},
                    graphViewport: {
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: graphWidth,
                        overflow: 'hidden',
                    },
                    itemCell: [
                        theme.fonts.medium,
                        {
                            paddingLeft: graphWidth + graphConfig.grid.x,
                            height: graphConfig.grid.y,
                            lineHeight: graphConfig.grid.y,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        },
                    ],
                    itemCellAlt: {
                        backgroundColor: theme.palette.neutralLighterAlt,
                    },
                    branch: [
                        tag,
                        {
                            borderColor: theme.palette.themePrimary,
                        },
                    ],
                    tag: [
                        tag,
                        {
                            borderColor: theme.palette.green,
                        },
                    ],
                    message: {},
                    messageAlt: {
                        color: theme.palette.blackTranslucent40,
                    },
                },
                styles,
            );
        },
        { theme, styles, graphWidth },
    );

    const onRenderPage: IRenderFunction<IPageProps<Commit>> = useCallback(
        (pageProps?: IPageProps<Commit>, defaultRender?: IRenderFunction<IPageProps<Commit>>) => {
            if (!pageProps) {
                return null;
            }

            return (
                <div key={pageProps.page.key} className={classNames.page}>
                    <div className={classNames.pageContent}>{defaultRender?.(pageProps)}</div>
                    <div className={classNames.graphViewport}>
                        <ReactSvgRenderer
                            className={classNames.graph}
                            graph={graph}
                            config={graphConfig}
                            startRow={pageProps.page.startIndex}
                            rowCount={pageProps.page.itemCount}
                        />
                    </div>
                </div>
            );
        },
        [classNames, graph],
    );

    const onRenderCell = useCallback(
        (item?: Commit, index?: number): JSX.Element => {
            if (!item) {
                return <div />;
            }

            index = index ?? 0;

            return (
                <div
                    key={index}
                    className={`${classNames.itemCell} ${isOdd(index) ? classNames.itemCellAlt : ''}`}
                    data-is-focusable={true}
                >
                    {item.branches?.map((branch, i) => (
                        <span key={i} className={classNames.branch}>
                            {branch}
                        </span>
                    ))}
                    {item.tags?.map((tag, i) => (
                        <span key={i} className={classNames.tag}>
                            {tag}
                        </span>
                    ))}
                    <span className={`${classNames.message} ${item.isCurrent ? '' : classNames.messageAlt}`}>
                        {item.message}
                    </span>
                </div>
            );
        },
        [classNames],
    );

    return (
        <>
            <FocusZone direction={FocusZoneDirection.vertical}>
                <div className={classNames.container} data-is-scrollable>
                    <List items={commits} onRenderCell={onRenderCell} onRenderPage={onRenderPage} version={theme.id} />
                </div>
            </FocusZone>
        </>
    );
};
