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
import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { useAsyncRetry } from 'react-use';
import { getKeyboards, groupKeyboardsByRepo } from '../../keyboards';
import type { Build, RepoAndBranch } from '../../targets';
import { useOctokit } from '../OctokitProvider';
import KeyboardItem from './KeyboardItem';
import { KeyboardListDispatch } from './KeyboardListReducer';

export interface KeyboardListProps {
    keyboards: Partial<Build>[];
    userRepos?: RepoAndBranch[];
    noController?: boolean;
}

const KeyboardList: React.FunctionComponent<KeyboardListProps> = ({ keyboards, userRepos, noController }) => {
    const octokit = useOctokit();
    const result = useAsyncRetry(async () => {
        const { keyboards, controllers } = await getKeyboards(octokit, userRepos);
        return {
            keyboards: groupKeyboardsByRepo(keyboards),
            controllers: groupKeyboardsByRepo(controllers),
        };
    }, [octokit, userRepos]);

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
                    noController={noController}
                />
            ))}
            <AddKeyboardItem />
        </List>
    );
};

KeyboardList.propTypes = {
    keyboards: PropTypes.array.isRequired,
    userRepos: PropTypes.array,
    noController: PropTypes.bool,
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
