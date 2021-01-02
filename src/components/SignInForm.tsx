import { createStyles, makeStyles, Paper, Theme } from '@material-ui/core';
import React from 'react';
import ParagraphBlock from './ParagraphBlock';
import SignInButton from './SignInButton';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        card: {
            padding: theme.spacing(3),
        },
    })
);

export interface SignInFormProps {}

const SignInForm: React.FunctionComponent<SignInFormProps> = () => {
    const classes = useStyles();

    return (
        <Paper className={classes.card}>
            <ParagraphBlock>
                <p>
                    ZMK Config Builder helps you create a ZMK user config repo, where you can make your own keymap for a
                    keyboard ZMK already supports or add support for a new keyboard.
                </p>
                <p>Please sign in to GitHub so this tool can create and/or modify your user config repo.</p>
                <p>
                    <SignInButton />
                </p>
            </ParagraphBlock>
        </Paper>
    );
};

export default SignInForm;
