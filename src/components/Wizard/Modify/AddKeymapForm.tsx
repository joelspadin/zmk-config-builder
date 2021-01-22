import { Button, Grid, Typography } from '@material-ui/core';
import { RepoPushIcon } from '@primer/octicons-react';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import React, { useReducer, useState } from 'react';
import { useAsyncFn } from 'react-use';
import { NoFilesChangedError, Repository } from '../../../repository';
import type { Build } from '../../../targets';
import { showMessage, showModalError } from '../../../util';
import { getNewKeymapFiles } from '../../../zmk';
import KeyboardList from '../KeyboardList';
import { EMPTY_KEYBOARDS, filterKeyboards, KeyboardListDispatch, keyboardListReducer } from '../KeyboardListReducer';
import ModifyDialog, { ModifyState } from './ModifyDialog';
import { useRefreshPullRequests } from './PullRequestList';

interface AddKeymapFormProps {
    repo: Repository;
    branch: string;
}

const AddKeymapForm: React.FunctionComponent<AddKeymapFormProps> = ({ repo, branch }) => {
    const refreshPullRequests = useRefreshPullRequests();
    const { enqueueSnackbar } = useSnackbar();
    const [state, setState] = useState(ModifyState.None);
    const [keyboards, dispatch] = useReducer(keyboardListReducer, EMPTY_KEYBOARDS);
    const listValid = filterKeyboards(keyboards).length > 0;

    const [result, startAddKeymaps] = useAsyncFn(async () => {
        try {
            setState(ModifyState.Working);
            const url = await addKeymaps(repo, branch, keyboards);
            setState(ModifyState.Done);

            refreshPullRequests();

            return url;
        } catch (error) {
            setState(ModifyState.None);

            if (error instanceof NoFilesChangedError) {
                showMessage(enqueueSnackbar, 'You already have keymaps for all the selected keyboards. Nothing to do.');
            } else {
                showModalError(enqueueSnackbar, error);
                console.error(error);
            }

            return undefined;
        }
    }, [repo, branch, keyboards, refreshPullRequests]);

    function handleAddKeymaps() {
        startAddKeymaps();
    }

    function handleDone() {
        dispatch({ type: 'clear' });
        setState(ModifyState.None);
    }

    return (
        <>
            <Typography variant="h6">Which keyboards should be added?</Typography>
            <p>
                Select one or more keyboards and the stock keymaps for each will be copied into your repo. You can then
                edit them to customize your keymaps.
            </p>
            <KeyboardListDispatch.Provider value={dispatch}>
                <KeyboardList keyboards={keyboards} noController />
            </KeyboardListDispatch.Provider>
            <Grid container direction="row" justify="flex-end">
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<RepoPushIcon />}
                    disabled={!listValid}
                    onClick={handleAddKeymaps}
                >
                    Add keymaps
                </Button>
            </Grid>
            <ModifyDialog state={state} pullRequestUrl={result.value} onClose={handleDone} />
        </>
    );
};

AddKeymapForm.propTypes = {
    repo: PropTypes.any.isRequired,
    branch: PropTypes.string.isRequired,
};

export default AddKeymapForm;

const MAX_SINGLE_LINE_KEYBOARDS = 3;

async function addKeymaps(repo: Repository, branch: string, keyboards: Partial<Build>[]) {
    const builds = filterKeyboards(keyboards);

    let message: string;

    if (builds.length <= MAX_SINGLE_LINE_KEYBOARDS) {
        message = `Add ${builds.map((b) => b.keyboard.name).join(', ')}`;
    } else {
        const list = builds.map((b) => `- ${b.keyboard.name}`).join('\n');
        message = `Add keyboards\n\n${list}`;
    }

    const files = await getNewKeymapFiles(repo.octokit, builds);
    const commit = await repo.createCommit(files, message, { branch, noOverwrite: true });
    const pull = await repo.createpullRequest(commit, branch, 'add-keymaps');

    return pull.data.html_url;
}
