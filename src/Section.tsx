import { classNamesFunction, IStyle, Text, Theme, useTheme } from '@fluentui/react';
import React from 'react';
import { mediaQuery } from './styles';

interface ISectionStyles {
    root: IStyle;
}

const getClassNames = classNamesFunction<Theme, ISectionStyles>();

export interface ISectionProps {
    className?: string;
}

export const Section: React.FunctionComponent<ISectionProps> = ({ children, className }) => {
    const theme = useTheme();
    const classNames = getClassNames((theme) => {
        return {
            root: {
                backgroundColor: theme.palette.white,
                borderRadius: theme.effects.roundedCorner2,
                boxShadow: theme.effects.elevation8,
                padding: 28,
                marginLeft: -28,
                marginRight: -28,
                marginBottom: 28,
                [mediaQuery.widthMedium]: {
                    marginLeft: 0,
                    marginRight: 0,
                    maxWidth: '60em',
                },
                '> h2': {
                    marginTop: 0,
                },
                '> p:first-child': {
                    marginTop: 0,
                },
                '> p:last-child': {
                    marginBottom: 0,
                },
                a: {
                    color: theme.palette.blue,
                    ':visited': {
                        color: theme.palette.purple,
                    },
                },
            },
        };
    }, theme);

    return <div className={`${classNames.root} ${className || ''}`}>{children}</div>;
};

export const SectionHeader: React.FunctionComponent = ({ children }) => {
    return (
        <Text block as="h2" variant="xLarge">
            {children}
        </Text>
    );
};
