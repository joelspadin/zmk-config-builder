import {
    Button,
    createStyles,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    makeStyles,
    TextField,
    Typography,
} from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import type { Octokit } from '@octokit/rest';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import React, { useContext, useState } from 'react';
import { useAsync } from 'react-use';
import { getRepoExists, Repository } from '../../../repository';
import { showModalError } from '../../../util';
import { isUserConfigRepo } from '../../../zmk';
import { useOctokit } from '../../OctokitProvider';
import { ConfigWizardDispatch, WizardStep } from '../ConfigWizardReducer';
import RepoLink from '../RepoLink';
import { useRepo } from '../RepoProvider';

const useStyles = makeStyles((theme) =>
    createStyles({
        owner: {
            opacity: 0.5,
        },
    })
);

export interface SelectRepoFormProps {
    owner: string;
}

const SelectRepoForm: React.FunctionComponent<SelectRepoFormProps> = ({ owner }) => {
    const { enqueueSnackbar } = useSnackbar();
    const classes = useStyles();
    const octokit = useOctokit();
    const [prevRepo, setSelectedRepo] = useRepo();
    const [confirmOpen, setConfimOpen] = useState(false);
    const [emptyRepoOpen, setEmptyRepoOpen] = useState(false);

    const wizardDispatch = useContext(ConfigWizardDispatch);

    const initialSelection: RepoItem | null = prevRepo ? { name: prevRepo.repo, owner: prevRepo.owner } : null;
    const [repo, setRepo] = React.useState<RepoItem | null>(initialSelection);
    const [branch, setBranch] = React.useState<string | null>(prevRepo?.branch ?? null);

    const repoExists = useAsync(async () => {
        if (repo) {
            return getRepoExists(octokit, repo.owner, repo.name);
        }
        return false;
    }, [octokit, repo]);

    const repos = useAsync(() => getRepos(octokit), [octokit]);
    const branches = useAsync(async () => {
        if (repo) {
            return getBranches(octokit, repo.owner, repo.name);
        }
        return [];
    }, [octokit, repo]);

    const selectedRepoMissing = !!repo && repoExists.value === false;
    const canSelectRepo = !!repo && !!branch && !selectedRepoMissing;

    let helperText: string | undefined;
    if (selectedRepoMissing) {
        helperText = 'This repo does not exist.';
    }

    async function handleRepoChange(event: React.ChangeEvent<{}>, newValue: RepoItem | null) {
        setRepo(newValue);
        if (newValue) {
            setBranch(await getDefaultBranch(octokit, newValue.owner, newValue.name));
        } else {
            setBranch(null);
        }
    }

    function handleBranchChange(event: React.ChangeEvent<{}>, newValue: string | null) {
        setBranch(newValue);
    }

    async function handleSelectRepo() {
        if (repo && branch) {
            try {
                if (await isUserConfigRepo(new Repository(octokit, repo.owner, repo.name), branch)) {
                    selectRepo(repo, branch);
                } else {
                    setConfimOpen(true);
                }
            } catch (error) {
                if (error instanceof Error && error.message.includes('Git Repository is empty')) {
                    setEmptyRepoOpen(true);
                } else {
                    showModalError(enqueueSnackbar, error);
                }
            }
        }
    }

    function handleCloseConfirm() {
        setConfimOpen(false);
    }

    function handleConfirm() {
        if (repo && branch) {
            selectRepo(repo, branch);
        }
    }

    function handleCloseEmptyRepo() {
        setEmptyRepoOpen(false);
    }

    function selectRepo(repo: RepoItem, branch: string) {
        setSelectedRepo({ owner: repo.owner, repo: repo.name, branch });
        wizardDispatch({ type: 'set-step', step: WizardStep.ModifyRepo });
    }

    return (
        <>
            <Grid container direction="column" spacing={2}>
                <Grid item>
                    <Autocomplete
                        id="repo-name"
                        selectOnFocus
                        clearOnBlur
                        handleHomeEndKeys
                        value={repo}
                        onChange={handleRepoChange}
                        options={repos.value ?? []}
                        getOptionLabel={(option) => `${option.owner}/${option.name}`}
                        getOptionSelected={(option, value) =>
                            option.owner === value.owner && option.name === value.name
                        }
                        renderOption={(option) => (
                            <span>
                                <span className={classes.owner}>{option.owner}/</span>
                                {option.name}
                            </span>
                        )}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Repository"
                                variant="outlined"
                                error={selectedRepoMissing}
                                helperText={helperText}
                            />
                        )}
                    />
                </Grid>
                <Grid item>
                    <Autocomplete
                        id="branch-name"
                        selectOnFocus
                        clearOnBlur
                        handleHomeEndKeys
                        value={branch}
                        onChange={handleBranchChange}
                        options={branches.value ?? []}
                        renderInput={(params) => <TextField {...params} label="Branch" variant="outlined" />}
                    />
                </Grid>
                <Grid item container direction="row" justify="flex-end">
                    <Button variant="contained" color="primary" disabled={!canSelectRepo} onClick={handleSelectRepo}>
                        Use this repo
                    </Button>
                </Grid>
            </Grid>
            <Dialog
                disableBackdropClick
                disableEscapeKeyDown
                maxWidth="xs"
                aria-labelledby="confirmation-dialog-title"
                open={confirmOpen}
            >
                <DialogTitle id="confirmation-dialog-title">Use this repo?</DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        <RepoLink owner={repo?.owner ?? ''} repo={repo?.name ?? ''} /> doesn&apos;t look like a ZMK user
                        config repo. Are you sure you want to use this repo?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseConfirm} color="primary" autoFocus>
                        Cancel
                    </Button>
                    <Button onClick={handleConfirm} color="primary">
                        Use this repo anyways
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                aria-aria-labelledby="empty-repo-dialog-title"
                maxWidth="xs"
                open={emptyRepoOpen}
                onClose={handleCloseEmptyRepo}
            >
                <DialogTitle id="empty-repo-dialog-title">Repository is empty</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" paragraph>
                        <RepoLink owner={repo?.owner ?? ''} repo={repo?.name ?? ''} /> can&apos;t be used because it is
                        empty. Please create a commit in it first.
                    </Typography>
                    <Typography variant="body1">
                        Open the link above for instructions on how to create an initial commit.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEmptyRepo} color="primary" autoFocus>
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

SelectRepoForm.propTypes = {
    owner: PropTypes.string.isRequired,
};

export default SelectRepoForm;

interface RepoItem {
    name: string;
    owner: string;
}

async function getDefaultBranch(octokit: Octokit, owner: string, repo: string) {
    return new Repository(octokit, owner, repo).getDefaultBranch();
}

async function getRepos(octokit: Octokit): Promise<RepoItem[]> {
    const repos = await octokit.paginate(octokit.repos.listForAuthenticatedUser);
    return repos
        .filter((r) => !!r.owner)
        .map((r) => ({ name: r.name, owner: r.owner!.login }))
        .sort((a, b) => {
            const cmp = a.owner.localeCompare(b.owner);
            if (cmp !== 0) {
                return cmp;
            }

            return a.name.localeCompare(b.name);
        });
}

async function getBranches(octokit: Octokit, owner: string, repo: string) {
    const defaultBranch = await getDefaultBranch(octokit, owner, repo);
    const branches = await octokit.paginate(octokit.repos.listBranches, { owner, repo });

    return branches
        .map((b) => b.name)
        .sort((a, b) => {
            if (a === defaultBranch) {
                return b === defaultBranch ? 0 : -1;
            }
            if (b === defaultBranch) {
                return 1;
            }
            return a.localeCompare(b);
        });
}
