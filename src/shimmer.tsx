import { IShimmerElement, mergeStyleSets, Shimmer, ShimmerElementType } from '@fluentui/react';
import React from 'react';
import { CONTROL_WIDTH } from './styles';

const classNames = mergeStyleSets({
    header: {
        margin: '32px 0',
        maxWidth: '30em',
    },
    body: {
        margin: '14px 0',
        maxWidth: '60em',
    },
    label: {
        padding: '5px 0',
        maxWidth: '6em',
    },
    control: {
        maxWidth: CONTROL_WIDTH,
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

export const ControlShimmer: React.FunctionComponent = () => {
    const label: IShimmerElement[] = [{ type: ShimmerElementType.line, height: 19 }];
    const control: IShimmerElement[] = [{ type: ShimmerElementType.line, height: 32 }];
    return (
        <>
            <Shimmer shimmerElements={label} className={classNames.label} />
            <Shimmer shimmerElements={control} className={classNames.control} />
        </>
    );
};
