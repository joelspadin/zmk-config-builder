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
import { CanvasRenderer, GraphConfig } from './CanvasRenderer';
import { Graph } from './graph';
import { ReactSvgRenderer } from './ReactSvgRenderer';
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
    pageContent: IStyle;
    itemCell: IStyle;
    itemCellAlt: IStyle;
    branch: IStyle;
    tag: IStyle;
    message: IStyle;
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

export const GitGraph: React.FunctionComponent<IGitGraphProps> = ({ commits, graphConfig, styles }) => {
    const graph = useMemo(() => new Graph(commits), [commits]);

    const graphWidth = graph.maxColumns * graphConfig.grid.x;
    const renderer = useMemo(() => new CanvasRenderer(graphConfig), [graphConfig]);

    const theme = useTheme();
    const classNames = getClassNames(
        ({ theme, styles, graphWidth }) => {
            const tag: IStyle = {
                display: 'inline-block',
                borderWidth: 1,
                borderStyle: 'solid',
                borderRadius: theme.effects.roundedCorner4,
                lineHeight: 'initial',
                paddingLeft: 4,
                paddingRight: 4,
                marginInlineEnd: 8,
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
                    graph: {
                        position: 'absolute',
                        top: 0,
                        left: 0,
                    },
                    itemCell: [
                        theme.fonts.medium,
                        {
                            paddingLeft: graphWidth + graphConfig.grid.x,
                            height: graphConfig.grid.y,
                            lineHeight: graphConfig.grid.y,
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
                    <ReactSvgRenderer
                        className={classNames.graph}
                        graph={graph}
                        config={graphConfig}
                        startRow={pageProps.page.startIndex}
                        rowCount={pageProps.page.itemCount}
                    />
                </div>
            );
        },
        [classNames, graph, renderer],
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
                    <span className={classNames.message}>{item.message}</span>
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
