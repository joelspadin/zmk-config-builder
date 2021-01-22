import {
    Button,
    createStyles,
    FormControl,
    FormControlLabel,
    FormLabel,
    Grid,
    LinearProgress,
    makeStyles,
    Radio,
    RadioGroup,
    Typography,
} from '@material-ui/core';
import { ArrowBack } from '@material-ui/icons';
import { TabContext, TabPanel } from '@material-ui/lab';
import { GitBranchIcon } from '@primer/octicons-react';
import PropTypes from 'prop-types';
import React, { useContext, useMemo, useState } from 'react';
import { Repository } from '../../../repository';
import ErrorMessage from '../../ErrorMessage';
import { useGitHubUser, useOctokit } from '../../OctokitProvider';
import UnderConstruction from '../../UnderConstruction';
import { ConfigWizardDispatch, WizardStep } from '../ConfigWizardReducer';
import RepoLink from '../RepoLink';
import { useRepo } from '../RepoProvider';
import AddKeymapsForm from './AddKeymapForm';
import InitializeRepoForm from './InitializeRepoForm';
import { PullRequestList, PullRequestListProvider } from './PullRequestList';

const useStyles = makeStyles((theme) =>
    createStyles({
        title: {
            marginBottom: theme.spacing(4),
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
            alignItems: 'center',
        },
        noGrow: {
            width: '100%',
        },
        repo: {
            marginInlineEnd: theme.spacing(2),
        },
        branch: {
            marginInlineEnd: theme.spacing(1),
            color: theme.palette.text.secondary,
            flexGrow: 1,
        },
    })
);

enum Action {
    None = '',
    InitRepo = 'init-repo',
    AddKeymap = 'add-keymap',
    NewKeyboard = 'new-keyboard',
    ChangeWorkflow = 'change-workflow',
}

export interface ModifyRepoProps {}

const ModifyRepoPage: React.FunctionComponent<ModifyRepoProps> = (props) => {
    const octokit = useOctokit();
    const classes = useStyles();
    const user = useGitHubUser();
    const wizardDispatch = useContext(ConfigWizardDispatch);
    const [repoId] = useRepo();
    const [action, setAction] = useState(Action.None);

    const repo = useMemo(() => {
        return repoId ? new Repository(octokit, repoId.owner, repoId.repo) : undefined;
    }, [octokit, repoId]);
    const branch = repoId?.branch ?? '';

    function handleReturn() {
        wizardDispatch({ type: 'set-step', step: WizardStep.SelectRepo });
    }

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        setAction(event.target.value as Action);
    }

    if (user.error) {
        return <ErrorMessage error={user.error} />;
    }

    if (user.value === undefined) {
        return <LinearProgress />;
    }

    if (!repo) {
        return (
            <Button startIcon={<ArrowBack />} onClick={handleReturn}>
                Select a repo
            </Button>
        );
    }

    return (
        <PullRequestListProvider>
            <Grid container direction="column" spacing={2}>
                <Grid item className={classes.noGrow}>
                    <Typography variant="h6" className={classes.title}>
                        <span className={classes.repo}>
                            Updating <RepoLink owner={user.value.login} repo={repo.name} />
                        </span>
                        <span className={classes.branch}>
                            <GitBranchIcon size={20} /> {branch}
                        </span>
                        <Button startIcon={<ArrowBack />} onClick={handleReturn}>
                            Change repo/branch
                        </Button>
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Any changes you make below will be made as a pull request instead of a direct commit on the
                        selected branch. You can then inspect the changes and choose whether to approve them.
                    </Typography>
                    <PullRequestList />
                </Grid>
                <Grid item>
                    <TabContext value={action}>
                        <FormControl>
                            <FormLabel>What would you like to do?</FormLabel>
                            <RadioGroup aria-label="repo action" name="action" value={action} onChange={handleChange}>
                                <FormControlLabel
                                    value={Action.InitRepo}
                                    control={<Radio />}
                                    label="Initialize the ZMK config repo"
                                />
                                <FormControlLabel
                                    value={Action.AddKeymap}
                                    control={<Radio />}
                                    label="Add keymaps for keyboards ZMK already supports"
                                />
                                <FormControlLabel
                                    value={Action.NewKeyboard}
                                    control={<Radio />}
                                    label="Add support for a new keyboard to ZMK "
                                />
                                <FormControlLabel
                                    value={Action.ChangeWorkflow}
                                    control={<Radio />}
                                    label="Change which firmware GitHub automatically builds"
                                />
                            </RadioGroup>
                        </FormControl>
                        <TabPanel value={Action.InitRepo}>
                            <InitializeRepoForm repo={repo} branch={branch} />
                        </TabPanel>
                        <TabPanel value={Action.AddKeymap}>
                            <AddKeymapsForm repo={repo} branch={branch} />
                        </TabPanel>
                        <TabPanel value={Action.NewKeyboard}>
                            <UnderConstruction />
                        </TabPanel>
                        <TabPanel value={Action.ChangeWorkflow}>
                            <UnderConstruction />
                        </TabPanel>
                    </TabContext>
                </Grid>
            </Grid>
        </PullRequestListProvider>
    );
};

ModifyRepoPage.propTypes = {
    onCancel: PropTypes.func,
};

export default ModifyRepoPage;
