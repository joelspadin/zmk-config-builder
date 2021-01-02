import { LinearProgress, Paper, styled, Tab, Typography } from '@material-ui/core';
import { Alert, AlertTitle, Skeleton, TabContext, TabList, TabPanel } from '@material-ui/lab';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import CreateRepoForm from './CreateRepoForm';
import ErrorMessage from './ErrorMessage';
import { useGitHubUser } from './OctokitProvider';
import { useRepo } from './RepoProvider';

enum Mode {
    CreateRepo = 'create',
    SelectRepo = 'select',
}

export interface RepoSelectProps {}

const StyledTab = styled(Tab)(({ theme }) => ({
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
}));

const RepoSelectPage: React.FunctionComponent<RepoSelectProps> = (props) => {
    const user = useGitHubUser();
    const [repo] = useRepo();
    const [activeTab, setActiveTab] = useState(repo ? Mode.SelectRepo : Mode.CreateRepo);

    const handleChange = (event: React.ChangeEvent<{}>, newValue: string) => {
        setActiveTab(newValue as Mode);
    };

    if (user.error) {
        return <ErrorMessage error={user.error} />;
    }

    if (user.value === undefined) {
        return <LinearProgress />;
    }

    return (
        <Typography component="div">
            <p>Please create a new user config repo or select your existing one.</p>
            <TabContext value={activeTab}>
                <Paper square>
                    <TabList onChange={handleChange} aria-label="repo selection tabs">
                        <StyledTab label="Create a new repo" value={Mode.CreateRepo} />
                        <StyledTab label="Use an existing repo" value={Mode.SelectRepo} />
                    </TabList>
                </Paper>
                <TabPanel value={Mode.CreateRepo}>
                    <CreateRepoForm owner={user.value.login} />
                </TabPanel>
                <TabPanel value={Mode.SelectRepo}>
                    <p>Repo search/selector goes here.</p>
                </TabPanel>
            </TabContext>
        </Typography>
    );
};

export default RepoSelectPage;
