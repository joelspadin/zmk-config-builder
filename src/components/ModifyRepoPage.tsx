import {
    Button,
    createStyles,
    FormControl,
    FormControlLabel,
    FormLabel,
    LinearProgress,
    makeStyles,
    Radio,
    RadioGroup,
    Typography,
} from '@material-ui/core';
import { ArrowBack } from '@material-ui/icons';
import { Alert, AlertTitle } from '@material-ui/lab';
import { GitBranchIcon } from '@primer/octicons-react';
import PropTypes from 'prop-types';
import React, { useContext, useState } from 'react';
import { ConfigWizardDispatch, WizardStep } from './ConfigWizardReducer';
import { useGitHubUser } from './OctokitProvider';
import RepoLink from './RepoLink';
import { useRepo } from './RepoProvider';

const useStyles = makeStyles((theme) =>
    createStyles({
        title: {
            marginBottom: theme.spacing(4),
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
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
    AddKeymap = 'add-keymap',
    NewKeyboard = 'new-keyboard',
    ChangeWorkflow = 'change-workflow',
}

export interface ModifyRepoProps {}

const ModifyRepoPage: React.FunctionComponent<ModifyRepoProps> = (props) => {
    const classes = useStyles();
    const user = useGitHubUser();
    const wizardDispatch = useContext(ConfigWizardDispatch);
    const [repo] = useRepo();
    const [action, setAction] = useState(Action.None);

    function handleReturn() {
        wizardDispatch({ type: 'set-step', step: WizardStep.SelectRepo });
    }

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        setAction(event.target.value as Action);
    }

    if (user.error) {
        return (
            <Alert severity="error">
                <AlertTitle>Error</AlertTitle>
                {user.error.message}
            </Alert>
        );
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
        <Typography component="div">
            <Typography variant="h6" className={classes.title}>
                <span className={classes.repo}>
                    Updating <RepoLink owner={user.value.login} repo={repo.repo} />
                </span>
                <span className={classes.branch}>
                    <GitBranchIcon size={20} /> {repo.branch}
                </span>
                <Button startIcon={<ArrowBack />} onClick={handleReturn}>
                    Change repo
                </Button>
            </Typography>
            <FormControl>
                <FormLabel>What would you like to do?</FormLabel>
                <RadioGroup aria-label="repo action" name="action" value={action} onChange={handleChange}>
                    <FormControlLabel
                        value={Action.AddKeymap}
                        control={<Radio />}
                        label="Make a keymap for a keyboard ZMK already supports"
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
        </Typography>
    );
};

ModifyRepoPage.propTypes = {
    onCancel: PropTypes.func,
};

export default ModifyRepoPage;
