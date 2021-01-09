import { Button, Grid, Typography } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { RepoPushIcon } from '@primer/octicons-react';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import React, { useReducer, useState } from 'react';
import { useAsyncFn } from 'react-use';
import { initUserRepository } from '../../../createRepository';
import type { Repository } from '../../../repository';
import type { Build } from '../../../targets';
import { showModalError } from '../../../util';
import KeyboardList from '../KeyboardList';
import {
    EMPTY_KEYBOARDS,
    filterKeyboards,
    isKeyboardListValid,
    KeyboardListDispatch,
    keyboardListReducer,
} from '../KeyboardListReducer';
import ModifyDialog, { ModifyState } from './ModifyDialog';

interface InitializeRepoFormProps {
    repo: Repository;
    branch: string;
}

const InitializeRepoForm: React.FunctionComponent<InitializeRepoFormProps> = ({ repo, branch }) => {
    const { enqueueSnackbar } = useSnackbar();
    const [state, setState] = useState(ModifyState.None);
    const [keyboards, dispatch] = useReducer(keyboardListReducer, EMPTY_KEYBOARDS);
    const listValid = isKeyboardListValid(keyboards) && filterKeyboards(keyboards).length > 0;

    const [result, startInitRepo] = useAsyncFn(async () => {
        try {
            setState(ModifyState.Working);
            const url = await initRepo(repo, branch, keyboards);
            setState(ModifyState.Done);

            return url;
        } catch (error) {
            setState(ModifyState.None);
            showModalError(enqueueSnackbar, error);
            console.error(error);
            return undefined;
        }
    }, [repo, branch, keyboards]);

    function handleInitRepo() {
        startInitRepo();
    }

    function handleDone() {
        dispatch({ type: 'clear' });
        setState(ModifyState.None);
    }

    return (
        <>
            <p>This ensures your repo contains all the necessary files for building ZMK firmware.</p>
            <Typography variant="h6">Which keyboards do you use?</Typography>
            <p>
                Select one or more keyboards and the stock keymaps for each will be copied into your repo. We&apos;ll
                also set up GitHub to automatically build firmware for these keyboards every time you push a change. You
                can add more keyboards later.
            </p>
            <Alert severity="info">
                If the repo already has a keymap for a keyboard, selecting that keyboard below will overwrite it with
                the stock keymap.
            </Alert>
            <KeyboardListDispatch.Provider value={dispatch}>
                <KeyboardList keyboards={keyboards} />
            </KeyboardListDispatch.Provider>
            <Grid container direction="row" justify="flex-end">
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<RepoPushIcon />}
                    disabled={!listValid}
                    onClick={handleInitRepo}
                >
                    Initialize repo
                </Button>
            </Grid>
            <ModifyDialog state={state} pullRequestUrl={result.value} onClose={handleDone} />
        </>
    );
};

InitializeRepoForm.propTypes = {
    repo: PropTypes.any.isRequired,
    branch: PropTypes.string.isRequired,
};

export default InitializeRepoForm;

async function initRepo(repo: Repository, branch: string, keyboards: Partial<Build>[]) {
    const builds = filterKeyboards(keyboards);

    const result = await initUserRepository(repo, branch, { builds });

    return result.data.html_url;
}
