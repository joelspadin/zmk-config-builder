import { Button, Grid, Typography } from '@material-ui/core';
import { RepoPushIcon } from '@primer/octicons-react';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import React, { useReducer, useState } from 'react';
import { useAsyncFn } from 'react-use';
import type { Repository } from '../../../repository';
import type { Build } from '../../../targets';
import { showModalError } from '../../../util';
import { getNewKeymapFiles } from '../../../zmk';
import KeyboardList from '../KeyboardList';
import { EMPTY_KEYBOARDS, filterKeyboards, KeyboardListDispatch, keyboardListReducer } from '../KeyboardListReducer';
import ModifyDialog, { ModifyState } from './ModifyDialog';

interface AddKeymapFormProps {
    repo: Repository;
    branch: string;
}

const AddKeymapForm: React.FunctionComponent<AddKeymapFormProps> = ({ repo, branch }) => {
    const { enqueueSnackbar } = useSnackbar();
    const [state, setState] = useState(ModifyState.None);
    const [keyboards, dispatch] = useReducer(keyboardListReducer, EMPTY_KEYBOARDS);
    const listValid = filterKeyboards(keyboards).length > 0;

    const [result, startAddKeymaps] = useAsyncFn(async () => {
        try {
            setState(ModifyState.Working);
            const url = await addKeymaps(repo, branch, keyboards);
            setState(ModifyState.Done);

            return url;
        } catch (error) {
            setState(ModifyState.None);
            showModalError(enqueueSnackbar, error);
            console.error(error);
            return undefined;
        }
    }, [repo, branch, keyboards]);

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

async function addKeymaps(repo: Repository, branch: string, keyboards: Partial<Build>[]) {
    const builds = filterKeyboards(keyboards);

    const list = builds.map((b) => `- ${b.keyboard.name}`).join('\n');
    const message = `Add keyboards\n\n${list}`;

    const files = await getNewKeymapFiles(repo.octokit, builds);
    const commit = await repo.createCommit(files, message, branch);
    const pull = await repo.createpullRequest(commit, branch);

    return pull.data.html_url;
}
