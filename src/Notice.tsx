import { classNamesFunction, Icon, IIconProps, IStyle, Stack, Text, Theme, useTheme } from '@fluentui/react';
import React from 'react';

export interface INoticeProps {
    iconProps?: IIconProps;
    className?: string;
}

interface INoticeStyles {
    root: IStyle;
    icon: IStyle;
    message: IStyle;
}

const getClassNames = classNamesFunction<Theme, INoticeStyles>();

export const Notice: React.FunctionComponent<INoticeProps> = ({ children, className, iconProps }) => {
    iconProps = iconProps ?? { iconName: 'Info' };

    const theme = useTheme();
    const classNames = getClassNames((theme) => {
        return {
            root: {
                backgroundColor: theme.palette.themeLight,
                borderRadius: theme.effects.roundedCorner2,
                boxShadow: theme.effects.elevation4,
                padding: '1em',
                margin: '1em 0',
                ':last-child': {
                    marginBottom: 0,
                },
            },
            icon: {
                width: 24,
                height: 24,
                fontSize: 24,
            },
            message: {
                paddingInlineStart: 12,
            },
        };
    }, theme);

    return (
        <Stack horizontal className={`${classNames.root} ${className || ''}`}>
            <Icon {...iconProps} className={classNames.icon} />
            <Text className={classNames.message}>{children}</Text>
        </Stack>
    );
};
