import { classNamesFunction, FontWeights, Icon, IIconProps, IStyle, Text, Theme, useTheme } from '@fluentui/react';
import React from 'react';

export interface INoticeProps {
    title?: string;
    iconProps?: IIconProps;
    className?: string;
}

interface INoticeStyles {
    root: IStyle;
    title: IStyle;
    icon: IStyle;
    message: IStyle;
}

const getClassNames = classNamesFunction<Theme, INoticeStyles>();

export const Alert: React.FunctionComponent<INoticeProps> = ({ children, className, iconProps, title }) => {
    iconProps = iconProps ?? { iconName: 'Info' };
    title = title ?? 'Note';

    const theme = useTheme();
    const classNames = getClassNames((theme) => {
        return {
            root: {
                backgroundColor: theme.palette.themeLight,
                borderRadius: theme.effects.roundedCorner6,
                boxShadow: theme.effects.elevation4,
                padding: '1rem',
                marginTop: '1rem',
            },
            title: {
                fontWeight: FontWeights.semibold,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
            },
            icon: {
                width: 16,
                height: 16,
                fontSize: 16,
                marginInlineEnd: 8,
            },
            message: {
                marginTop: '1rem',
            },
        };
    }, theme);

    return (
        <div className={`${classNames.root} ${className || ''}`}>
            <Text block variant="mediumPlus" className={classNames.title}>
                <Icon {...iconProps} className={classNames.icon} /> {title}
            </Text>
            <Text block className={classNames.message}>
                {children}
            </Text>
        </div>
    );
};
