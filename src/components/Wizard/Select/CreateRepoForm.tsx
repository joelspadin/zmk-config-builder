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
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import React, { useContext, useReducer, useState } from 'react';
import { useAsync, useAsyncFn } from 'react-use';
import { createUserRepository } from '../../../modifications';
import { getRepoExists } from '../../../repository';
import type { Build } from '../../../targets';
import { showModalError } from '../../../util';
import { useOctokit } from '../../OctokitProvider';
import { ConfigWizardDispatch, WizardStep } from '../ConfigWizardReducer';
import KeyboardList from '../KeyboardList';
import {
    EMPTY_KEYBOARDS,
    filterKeyboards,
    isKeyboardListValid,
    KeyboardListDispatch,
    keyboardListReducer,
} from '../KeyboardListReducer';
import RepoLink from '../RepoLink';
import { useRepo } from '../RepoProvider';

export interface CreateRepoFormProps {
    owner: string;
}

const useStyles = makeStyles((theme) =>
    createStyles({
        repoForm: {
            marginBottom: theme.spacing(4),
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
    const repoExists = useAsync(() => getRepoExists(octokit, owner, repo), [octokit, owner, repo]);

    const wizardDispatch = useContext(ConfigWizardDispatch);
    const { enqueueSnackbar } = useSnackbar();

    const [createState, startCreateRepo] = useAsyncFn(async () => {
        try {
            const { branch } = await createRepo({ octokit, repo, isPrivate, keyboards });
            setSelectedRepo({ owner, repo, branch });
            return true;
        } catch (error) {
            showModalError(enqueueSnackbar, error);
            console.error(error);
            return false;
        }
    }, [octokit, repo, isPrivate, keyboards]);

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
            <Grid container direction="column" spacing={1} className={classes.repoForm}>
                <Grid item>
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
                </Grid>
                <Grid item>
                    <FormControlLabel
                        control={<Switch checked={isPrivate} onChange={togglePrivate} />}
                        label="Create a private repo"
                    />
                </Grid>
            </Grid>
            <Typography variant="h6">Which keyboards do you use?</Typography>
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

interface CreateParams {
    octokit: Octokit;
    repo: string;
    isPrivate: boolean;
    keyboards: Partial<Build>[];
}

async function createRepo({ octokit, repo, isPrivate, keyboards }: CreateParams) {
    const builds = filterKeyboards(keyboards);

    const result = await createUserRepository(octokit, repo, {
        builds,
        private: isPrivate,
    });

    return result;
}
