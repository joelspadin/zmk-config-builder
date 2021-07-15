import { classNamesFunction, IStyle, Theme, useTheme } from '@fluentui/react';
import React from 'react';

export interface IInlineCodeStyles {
    root: IStyle;
}

const getClassNames = classNamesFunction<Theme, IInlineCodeStyles>();

export type IInlineCodeProps = React.HTMLAttributes<HTMLElement>;

export const InlineCode: React.FunctionComponent<IInlineCodeProps> = ({ children, className, ...props }) => {
    const theme = useTheme();
    const classNames = getClassNames(() => {
        return {
            root: {
                backgroundColor: theme.palette.themeLight,
                border: `1px solid ${theme.palette.themeTertiary}`,
                borderRadius: theme.effects.roundedCorner2,
                padding: '0 3px',
            },
        };
    }, theme);

    return (
        <code className={`${className} ${classNames.root}`} {...props}>
            {children}
        </code>
    );
};
