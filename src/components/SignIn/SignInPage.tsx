import { Container, createStyles, Link, makeStyles, Paper, Theme, Typography } from '@material-ui/core';
import { Alert, AlertTitle } from '@material-ui/lab';
import React from 'react';
import { CONFIG_BUILDER_REPO_URL } from '../../config';
import SignInButton from './SignInButton';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        card: {
            padding: theme.spacing(4),
        },
        button: {
            marginBottom: theme.spacing(3),
        },
    })
);

export interface SignInPage {}

const SignInPage: React.FunctionComponent<SignInPage> = () => {
    const classes = useStyles();

    return (
        <Paper className={classes.card}>
            <Typography variant="body1" paragraph>
                ZMK Config Builder helps you create a ZMK user config repo, where you can customize the keymap and
                settings for a keyboard ZMK already supports or add support to ZMK for a new keyboard.
            </Typography>
            <Typography variant="body1" paragraph>
                Please sign in to GitHub so this app can create and/or modify your user config repo.
            </Typography>

            <SignInButton className={classes.button} />

            <Alert severity="info">
                <AlertTitle>A note on permissions</AlertTitle>
                <Typography variant="body1" paragraph>
                    Unfortunately, GitHub does not let you restrict GitHub OAuth apps to specific repos, so this app
                    requires full access to your repos to create and edit your user config repo, and it requires
                    permissions for GitHub workflows to set up GitHub Actions to build firmware for you.
                </Typography>
                <Typography variant="body1" paragraph>
                    This does <em>not</em> give it permissions to delete any repos.
                </Typography>
                <Typography variant="body1" paragraph>
                    This app only communicates with GitHub and an external server which is used only once when signing
                    in to authenticate this app with GitHub. All your data stays between your browser and GitHub.
                </Typography>
                <Typography variant="body1" paragraph>
                    This app will use the following data from GitHub:
                    <ul>
                        <li>It creates new repos if instructed to.</li>
                        <li>
                            It reads{' '}
                            <Link
                                target="_blank"
                                href="https://docs.github.com/en/free-pro-team@latest/rest/reference/repos#list-repositories-for-the-authenticated-user"
                            >
                                basic information about your repos
                            </Link>{' '}
                            to check if a repo name is already used before creating a new one and to let you select an
                            existing repo as your user config repo.
                        </li>
                        <li>
                            It reads detailed information about the repo you have selected as your user config repo,
                            including branch names and file contents.
                        </li>
                        <li>It makes commits to the repo you have selected as your user config repo.</li>
                        <li>
                            After the initial commit to set up a new repo, it makes all further changes to a temporary
                            branch and creates a pull request so you can choose whether to accept the changes.
                        </li>
                    </ul>
                </Typography>
                <Typography variant="body1" paragraph>
                    There is no way to enforce that the app only uses this data, but you can{' '}
                    <Link target="_blank" href={CONFIG_BUILDER_REPO_URL}>
                        view the sources on GitHub
                    </Link>{' '}
                    to verify this.
                </Typography>
                <Typography variant="body1" paragraph>
                    GitHub does provide a GitHub Apps API with more granular permissions. I am investigating switching
                    to use it, but the process for authentication is much more complicated so switching is not trivial.
                    I do not plan to do this until more of the site is functional.
                </Typography>
            </Alert>
        </Paper>
    );
};

export default SignInPage;
