import { Octokit } from '@octokit/rest';
import React, { createContext, useContext, useMemo } from 'react';
import { useAsync } from 'react-use';
import type { AsyncState } from 'react-use/lib/useAsync';
import { useAccessToken } from './AuthProvider';

export interface GitHubUser {
    login: string;
    name: string | null;
}

export const OctokitContext = createContext<Octokit>(new Octokit());
export const UserContext = createContext<AsyncState<GitHubUser>>({ loading: true });

export const OctokitProvider: React.FunctionComponent = ({ children }) => {
    const [token] = useAccessToken();
    const octokit = useMemo(() => {
        return new Octokit({
            auth: token,
            userAgent: 'zmk-config-builder',
        });
    }, [token]);

    const user = useAsync(async () => {
        const user = await octokit.users.getAuthenticated();
        const { login, name } = user.data;
        return { login, name };
    }, [token]);

    return (
        <OctokitContext.Provider value={octokit}>
            <UserContext.Provider value={user}>{children}</UserContext.Provider>
        </OctokitContext.Provider>
    );
};

export function useOctokit() {
    return useContext(OctokitContext);
}

export function useGitHubUser() {
    return useContext(UserContext);
}
