import { createStyles, Grid, makeStyles, Paper, Theme, Typography } from '@material-ui/core';
import React from 'react';
import SignInButton from './SignInButton';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        card: {
            padding: theme.spacing(3),
        },
    })
);

export interface SignInPage {}

const SignInPage: React.FunctionComponent<SignInPage> = () => {
    const classes = useStyles();

    return (
        <Paper className={classes.card}>
            <Grid container direction="column" spacing={2}>
                <Grid item>
                    <Typography variant="body1">
                        ZMK Config Builder helps you create a ZMK user config repo, where you can make your own keymap
                        for a keyboard ZMK already supports or add support for a new keyboard.
                    </Typography>
                </Grid>
                <Grid item>
                    <Typography variant="body1">
                        Please sign in to GitHub so this tool can create and/or modify your user config repo.
                    </Typography>
                </Grid>
                <Grid item>
                    <SignInButton />
                </Grid>
            </Grid>
        </Paper>
    );
};

export default SignInPage;
