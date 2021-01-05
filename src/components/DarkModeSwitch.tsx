import { createStyles, Switch, SwitchClassKey, SwitchProps, withStyles } from '@material-ui/core';
import React from 'react';

interface Styles extends Partial<Record<SwitchClassKey, string>> {
    focusVisible?: string;
}

interface Props extends SwitchProps {
    classes: Styles;
}

const DarkModeSwitch = withStyles((theme) =>
    createStyles({
        root: {
            width: 50,
            height: 24,
            padding: 0,
            margin: theme.spacing(1),
            overflow: 'visible',
        },
        switchBase: {
            padding: 2,
            color: theme.palette.common.white,
            '&$checked': {
                color: theme.palette.common.white,
                transform: `translateX(26px)`,
                '& + $track': {
                    opacity: 1,
                    backgroundColor: 'rgba(0,0,0, 0.38)',
                    '&::after': {
                        content: '"🌜"',
                        left: 3,
                        right: 'initial',
                    },
                },
            },
            '&$focusVisible $thumb': {
                boxShadow: `0 0 0 3px ${theme.palette.secondary.main}`,
            },
        },
        thumb: {
            width: 20,
            height: 20,
        },
        track: {
            borderRadius: 24 / 2,
            opacity: 1,
            backgroundColor: 'rgba(0,0,0, 0.38)',
            '&::after': {
                content: '"🌞"',
                fontSize: 16,
                position: 'absolute',
                top: 2,
                right: 3,
            },
        },
        checked: {},
        focusVisible: {},
    })
)(({ classes, ...props }: Props) => {
    const { focusVisible, ...otherClasses } = classes;
    return <Switch disableRipple focusVisibleClassName={focusVisible} classes={otherClasses} {...props} />;
});

export default DarkModeSwitch;
