import {
    Button,
    createStyles,
    Grid,
    Link,
    List,
    ListItem,
    ListItemText,
    makeStyles,
    Typography,
} from '@material-ui/core';
import { Refresh } from '@material-ui/icons';
import type { Octokit } from '@octokit/rest';
import React, { createContext, useContext } from 'react';
import { useAsync, useAsyncRetry } from 'react-use';
import { useOctokit } from '../../OctokitProvider';
import { useRepo } from '../RepoProvider';

const useStyles = makeStyles((theme) =>
    createStyles({
        ellipsis: {
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        },
    })
);

export interface PullRequestItem {
    title: string;
    body: string | null;
    url: string;
}

const RefreshContext = createContext(() => {});
const ListContext = createContext<PullRequestItem[]>([]);

export function useRefreshPullRequests() {
    return useContext(RefreshContext);
}

const MAX_PULLS = 6;

export const PullRequestListProvider: React.FunctionComponent = ({ children }) => {
    const octokit = useOctokit();
    const [repo] = useRepo();
    const list = useAsyncRetry(async () => {
        if (!repo) {
            return [];
        }

        const pulls = await octokit.pulls.list({
            owner: repo.owner,
            repo: repo.repo,
            state: 'open',
            per_page: MAX_PULLS + 1,
        });

        return pulls.data.map((pull) => ({ title: pull.title, body: pull.body, url: pull.html_url }));
    }, [octokit, repo]);

    return (
        <RefreshContext.Provider value={list.retry}>
            <ListContext.Provider value={list.value ?? []}>{children}</ListContext.Provider>
        </RefreshContext.Provider>
    );
};

export interface PullRequestListProps {}

export const PullRequestList: React.FunctionComponent<PullRequestListProps> = () => {
    const classes = useStyles();
    const pulls = useContext(ListContext);
    const refresh = useContext(RefreshContext);
    const octokit = useOctokit();
    const [repo] = useRepo();
    const pullsUrl = useAsync(async () => {
        return repo ? getPullRequestUrl(octokit, repo.owner, repo.repo) : undefined;
    }, [octokit, repo]);

    if (pulls.length === 0) {
        return null;
    }

    let showMore = false;
    if (pulls.length > MAX_PULLS) {
        pulls.pop();
        showMore = true;
    }

    return (
        <>
            <Grid container direction="row" wrap="wrap" alignItems="baseline" spacing={2}>
                <Grid item>
                    <Typography variant="subtitle1">There are open pull requests on your repo:</Typography>
                </Grid>
                <Grid item>
                    <Button startIcon={<Refresh />} onClick={refresh}>
                        Refresh
                    </Button>
                </Grid>
            </Grid>
            <List dense>
                {pulls.map((pull, i) => (
                    <Link key={i} target="_blank" href={pull.url}>
                        <ListItem button>
                            <ListItemText classes={{ primary: classes.ellipsis }}>
                                {pull.body ?? pull.title}
                            </ListItemText>
                        </ListItem>
                    </Link>
                ))}
                {showMore && (
                    <Link target="_blank" href={pullsUrl.value ?? '#'}>
                        <ListItem button>
                            <ListItemText>And more...</ListItemText>
                        </ListItem>
                    </Link>
                )}
            </List>
        </>
    );
};

async function getPullRequestUrl(octokit: Octokit, owner: string, repo: string) {
    const response = await octokit.repos.get({ owner, repo });
    return `${response.data.html_url}/pulls`;
}
