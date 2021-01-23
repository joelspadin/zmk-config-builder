import { Grid, CircularProgress, Button, Typography } from '@material-ui/core';
import { RepoPushIcon } from '@primer/octicons-react';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import React, { useReducer, useState } from 'react';
import { useAsync, useAsyncFn } from 'react-use';
import yaml from 'yaml';
import { getKeyboards } from '../../../keyboards';
import { updateGitHubWorkflow } from '../../../modifications';
import type { Repository } from '../../../repository';
import type { Build, BuildTarget, RepoAndBranch } from '../../../targets';
import { MATRIX_NODE, WORKFLOW_FILE } from '../../../templates';
import { showModalError } from '../../../util';
import KeyboardList from '../KeyboardList';
import {
    filterKeyboards,
    isKeyboardListValid,
    KeyboardListDispatch,
    keyboardListReducer,
} from '../KeyboardListReducer';
import ModifyDialog, { ModifyState } from './ModifyDialog';
import { useRefreshPullRequests } from './PullRequestList';

export interface GitHubWorkflowFormProps {
    repo: Repository;
    branch: string;
}

const GitHubWorkflowForm: React.FunctionComponent<GitHubWorkflowFormProps> = ({ repo, branch }) => {
    const refreshPullRequests = useRefreshPullRequests();
    const { enqueueSnackbar } = useSnackbar();
    const [state, setState] = useState(ModifyState.None);
    const [keyboards, dispatch] = useReducer(keyboardListReducer, []);
    const listValid = isKeyboardListValid(keyboards) && filterKeyboards(keyboards).length > 0;

    const getMatrix = useAsync(async () => {
        const builds = await getCurrentBuildMatrix({ repo, branch });
        dispatch({ type: 'reset', builds });
    }, [repo, branch, dispatch]);

    const [result, startUpdateWorkflow] = useAsyncFn(async () => {
        try {
            setState(ModifyState.Working);
            const url = await updateGitHubWorkflow(repo, branch, filterKeyboards(keyboards));
            setState(ModifyState.Done);

            refreshPullRequests();
            return url;
        } catch (error) {
            setState(ModifyState.None);
            showModalError(enqueueSnackbar, error);
            console.error(error);
            return undefined;
        }
    }, [repo, branch, keyboards, refreshPullRequests]);

    function handleUpdateWorkflow() {
        startUpdateWorkflow();
    }

    function handleDone() {
        setState(ModifyState.None);
    }

    if (getMatrix.loading) {
        return (
            <Grid container direction="row" spacing={2} alignItems="center">
                <Grid item>
                    <CircularProgress />
                </Grid>
                <Grid item>Reading GitHub workflow...</Grid>
            </Grid>
        );
    }

    const userRepos = [{ repo, branch }];

    return (
        <>
            <Typography variant="h6">Which keyboards should be built?</Typography>
            <p>Select one or more keyboards for GitHub to build every time you make a commit.</p>
            <KeyboardListDispatch.Provider value={dispatch}>
                <KeyboardList keyboards={keyboards} userRepos={userRepos} />
            </KeyboardListDispatch.Provider>
            <Grid container direction="row" justify="flex-end">
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<RepoPushIcon />}
                    disabled={!listValid}
                    onClick={handleUpdateWorkflow}
                >
                    Update build matrix
                </Button>
            </Grid>
            <ModifyDialog state={state} pullRequestUrl={result.value} onClose={handleDone} />
        </>
    );
};

GitHubWorkflowForm.propTypes = {
    repo: PropTypes.any.isRequired,
    branch: PropTypes.string.isRequired,
};

export default GitHubWorkflowForm;

async function getCurrentBuildMatrix({ repo, branch }: RepoAndBranch): Promise<Build[]> {
    const commit = await repo.getLatestCommit(branch);
    const file = await commit.tree.getFile(WORKFLOW_FILE);
    if (!file) {
        return [];
    }

    const workflow = yaml.parse(await file.getText());
    const matrix = getMatrixNode(workflow);
    if (!isBuildMatrix(matrix)) {
        return [];
    }

    const { keyboards, controllers } = await getKeyboards(repo.octokit, [{ repo, branch }]);

    const builds: Build[] = [];
    for (const item of matrix) {
        const build = matrixItemToBuild(keyboards, controllers, item);
        if (build) {
            builds.push(build);
        }
    }

    return dedupeBuilds(builds);
}

function getMatrixNode(workflow: any) {
    const keys = MATRIX_NODE;
    let node = workflow;

    for (const k of keys) {
        if (node && typeof node === 'object' && k in node) {
            node = node[k];
        } else {
            return undefined;
        }
    }

    return node;
}

interface MatrixItem {
    board: string;
    shield?: string;
}

function isBuildMatrix(x: unknown): x is MatrixItem[] {
    return (
        Array.isArray(x) &&
        x.every((item) => {
            return (
                item &&
                typeof item === 'object' &&
                typeof item.board === 'string' &&
                (typeof item.shield === 'string' || typeof item.shield === 'undefined')
            );
        })
    );
}

function findTarget(targets: BuildTarget[], name: string) {
    return targets.find((item) => item.name === name || item.buildTargets.includes(name));
}

function matrixItemToBuild(keyboards: BuildTarget[], controllers: BuildTarget[], item: MatrixItem): Build | undefined {
    if (item.shield) {
        const keyboard = findTarget(keyboards, item.shield);
        const controller = findTarget(controllers, item.board);
        if (keyboard && controller) {
            return { keyboard, controller };
        }
    } else {
        const keyboard = findTarget(keyboards, item.board);
    }

    return undefined;
}

function dedupeBuilds(builds: Build[]): Build[] {
    const result: Build[] = [];
    for (const build of builds) {
        const other = result.find((x) => x.keyboard === build.keyboard && x.controller === build.controller);
        if (!other) {
            result.push(build);
        }
    }
    return result;
}
