import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Button, createStyles, Grid, makeStyles, TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import type { Octokit } from '@octokit/rest';
import { useOctokit } from '../../OctokitProvider';
import { useAsync } from 'react-use';
import { useRepo } from '../RepoProvider';
import { getRepoExists, Repository } from '../../../repository';
import { ConfigWizardDispatch, WizardStep } from '../ConfigWizardReducer';

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
    const classes = useStyles();
    const octokit = useOctokit();
    const [prevRepo, setSelectedRepo] = useRepo();
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

    function handleSelectRepo() {
        if (repo && branch) {
            // TODO: verify this looks like an empty repo or zmk-config repo
            setSelectedRepo({ owner: repo.owner, repo: repo.name, branch });
            wizardDispatch({ type: 'set-step', step: WizardStep.ModifyRepo });
        }
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
                        Select repo
                    </Button>
                </Grid>
            </Grid>
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
