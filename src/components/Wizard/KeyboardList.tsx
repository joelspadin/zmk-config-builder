import {
    Button,
    CircularProgress,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
} from '@material-ui/core';
import { Add } from '@material-ui/icons';
import { Alert, AlertTitle } from '@material-ui/lab';
import type { Octokit } from '@octokit/rest';
import React, { useContext } from 'react';
import { useAsyncRetry } from 'react-use';
import { ZMK_MAIN_BRANCH, ZMK_OWNER, ZMK_REPO } from '../../config';
import { Repository } from '../../repository';
import { discoverBuildTargets, partitionBuildTargets } from '../../targets';
import KeyboardItem from './KeyboardItem';
import { KeyboardListDispatch, KeyboardListItem } from './KeyboardListReducer';
import { useOctokit } from '../OctokitProvider';
import PropTypes from 'prop-types';

export interface KeyboardListProps {
    keyboards: KeyboardListItem[];
}

const KeyboardList: React.FunctionComponent<KeyboardListProps> = ({ keyboards }) => {
    const octokit = useOctokit();
    const result = useAsyncRetry(() => getKeyboards(octokit), [octokit]);

    if (result.loading) {
        return (
            <Grid container direction="row" spacing={2} alignItems="center">
                <Grid item>
                    <CircularProgress />
                </Grid>
                <Grid item>Finding keyboards...</Grid>
            </Grid>
        );
    }

    if (result.error) {
        return (
            <Alert
                severity="error"
                action={
                    <Button color="inherit" size="small" onClick={result.retry}>
                        Retry
                    </Button>
                }
            >
                <AlertTitle>Error</AlertTitle>
                {result.error.message}
            </Alert>
        );
    }

    return (
        <List>
            {keyboards.map((item, i) => (
                <KeyboardItem
                    key={i}
                    index={i}
                    keyboardOptions={result.value?.keyboards ?? []}
                    controllerOptions={result.value?.controllers ?? []}
                    keyboard={item.keyboard}
                    controller={item.controller}
                />
            ))}
            <AddKeyboardItem />
        </List>
    );
};

KeyboardList.propTypes = {
    keyboards: PropTypes.array.isRequired,
};

export default KeyboardList;

interface AddKeyboardItemProps {}

const AddKeyboardItem: React.FunctionComponent<AddKeyboardItemProps> = () => {
    const dispatch = useContext(KeyboardListDispatch);

    function handleAdd() {
        dispatch({ type: 'add' });
    }

    return (
        <ListItem button onClick={handleAdd}>
            <ListItemIcon>
                <IconButton edge="start" tabIndex={-1} aria-labelledby="add-keyboard" aria-label="add keyboard">
                    <Add />
                </IconButton>
            </ListItemIcon>
            <ListItemText id="add-keyboard" primary="Add another keyboard" />
        </ListItem>
    );
};

async function getKeyboards(octokit: Octokit) {
    const repo = new Repository(octokit, ZMK_OWNER, ZMK_REPO);
    const targets = await discoverBuildTargets({ repo, branch: ZMK_MAIN_BRANCH });
    return partitionBuildTargets(targets);
}
