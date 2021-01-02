import {
    Button,
    createStyles,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Grid,
    LinearProgress,
    makeStyles,
    Switch,
    TextField,
    Typography,
} from '@material-ui/core';
import type { Octokit } from '@octokit/rest';
import { RepoPushIcon } from '@primer/octicons-react';
import PropTypes from 'prop-types';
import React, { useContext, useReducer, useState } from 'react';
import { useAsync, useAsyncFn } from 'react-use';
import { USER_REPO_DEFAULT_BRANCH } from '../config';
import { ConfigWizardDispatch, WizardStep } from './ConfigWizardReducer';
import KeyboardList from './KeyboardList';
import { KeyboardListDispatch, KeyboardListItem, keyboardListReducer } from './KeyboardListReducer';
import { useOctokit } from './OctokitProvider';
import RepoLink from './RepoLink';
import { useRepo } from './RepoProvider';

export interface CreateRepoFormProps {
    owner: string;
}

const EMPTY_KEYBOARDS = [{ keyboard: undefined, controller: undefined }];

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'wrap',
            marginBottom: theme.spacing(4),
            '& > *': {
                marginTop: theme.spacing(1),
                marginBottom: theme.spacing(1),
            },
        },
        backdrop: {
            zIndex: theme.zIndex.drawer + 1,
        },
    })
);

const CreateRepoForm: React.FunctionComponent<CreateRepoFormProps> = ({ owner }) => {
    const classes = useStyles();
    const [, setSelectedRepo] = useRepo();
    const [repo, setRepo] = useState('zmk-config');
    const [isPrivate, setPrivate] = useState(false);

    const [keyboards, dispatch] = useReducer(keyboardListReducer, EMPTY_KEYBOARDS);
    const listValid = isKeyboardListValid(keyboards);

    const octokit = useOctokit();
    const repoExists = useAsync(() => checkIfRepoExists(octokit, owner, repo), [octokit, owner, repo]);

    const wizardDispatch = useContext(ConfigWizardDispatch);

    const [createState, startCreateRepo] = useAsyncFn(async () => {
        await createRepo({ octokit, owner, repo, isPrivate, keyboards });
        setSelectedRepo({ repo, branch: USER_REPO_DEFAULT_BRANCH });
        return true;
    }, [octokit, owner, repo, isPrivate, keyboards]);

    const canCreateRepo = repo && repoExists.value === false && listValid;

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        setRepo(event.target.value);
    }

    function togglePrivate() {
        setPrivate((prev) => !prev);
    }

    function handleCreateRepo() {
        if (canCreateRepo) {
            startCreateRepo();
        }
    }

    function handleContinue() {
        wizardDispatch({ type: 'set-step', step: WizardStep.ModifyRepo });
    }

    let helperText: string | undefined;
    if (repoExists.value) {
        helperText = 'A repo with this name already exists. Enter a different name.';
    } else if (!repo) {
        helperText = 'A repo name is required.';
    }

    return (
        <>
            <form className={classes.root}>
                <TextField
                    required
                    id="repo-name"
                    label="Repository name"
                    variant="standard"
                    value={repo}
                    onChange={handleChange}
                    error={!repo || repoExists.value}
                    helperText={helperText}
                />
                <FormControlLabel
                    control={<Switch checked={isPrivate} onChange={togglePrivate} />}
                    label="Create a private repo"
                />
            </form>
            <Typography variant="h6">Which keyboard(s) do you use?</Typography>
            <p>
                Select one or more keyboards and the stock keymaps for each will be copied into your repo. We&apos;ll
                also set up GitHub to automatically build firmware for these keyboards every time you push a change. You
                can add more keyboards later.
            </p>
            <p>
                If you can&apos;t find your keyboard, then leave the list empty. You can add a template for a new
                keyboard to your repo later.
            </p>
            <KeyboardListDispatch.Provider value={dispatch}>
                <KeyboardList keyboards={keyboards} />
            </KeyboardListDispatch.Provider>
            <Grid container direction="row" justify="flex-end">
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<RepoPushIcon />}
                    disabled={!canCreateRepo}
                    onClick={handleCreateRepo}
                >
                    Create repo
                </Button>
            </Grid>

            <Dialog
                disableBackdropClick
                disableEscapeKeyDown
                fullWidth
                maxWidth="xs"
                aria-labelledby="create-repo-title"
                open={createState.loading || createState.value === true}
            >
                <DialogTitle id="create-repo-title">Creating Repo</DialogTitle>
                <DialogContent>
                    {createState.loading ? (
                        <LinearProgress />
                    ) : (
                        <Typography variant="body1">
                            Your user config repo is now available at <RepoLink owner={owner} repo={repo} showUrl />.
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button color="primary" disabled={createState.loading} onClick={handleContinue}>
                        Continue
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

CreateRepoForm.propTypes = {
    owner: PropTypes.string.isRequired,
};

export default CreateRepoForm;

function isKeyboardListValid(keyboards: KeyboardListItem[]) {
    for (const item of keyboards) {
        if (item.keyboard?.type === 'shield' && item.controller === undefined) {
            return false;
        }
    }

    return true;
}

async function checkIfRepoExists(octokit: Octokit, owner: string, repo: string) {
    try {
        const result = await octokit.repos.get({ owner, repo });
        return result.data !== undefined;
    } catch {
        return false;
    }
}

interface CreateParams {
    octokit: Octokit;
    owner: string;
    repo: string;
    isPrivate: boolean;
    keyboards: KeyboardListItem[];
}

function createRepo({ octokit, owner, repo, isPrivate, keyboards }: CreateParams) {
    return new Promise<boolean>((resolve) => {
        setTimeout(() => resolve(true), 2000);
    });
}
