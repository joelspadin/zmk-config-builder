import { IShimmerElement, mergeStyleSets, Shimmer, ShimmerElementType } from '@fluentui/react';
import React from 'react';

const classNames = mergeStyleSets({
    header: {
        margin: '32px 0',
        maxWidth: '30em',
    },
    body: {
        margin: '14px 0',
        maxWidth: '60em',
    },
    section: {
        marginBottom: 28,
        maxWidth: '60em',
    },
});

export const PageShimmer: React.FunctionComponent = () => {
    const header: IShimmerElement[] = [{ type: ShimmerElementType.line, height: 42 }];
    const body: IShimmerElement[] = [{ type: ShimmerElementType.line, height: 20 }];

    return (
        <>
            <Shimmer shimmerElements={header} className={classNames.header} />
            <Shimmer shimmerElements={body} className={classNames.body} />
            <Shimmer shimmerElements={body} className={classNames.body} />
            <Shimmer shimmerElements={body} className={classNames.body} />
        </>
    );
};

export const SectionShimmer: React.FunctionComponent = () => {
    const section: IShimmerElement[] = [{ type: ShimmerElementType.line, height: 100 }];
    return (
        <>
            <Shimmer shimmerElements={section} className={classNames.section} />
        </>
    );
};
