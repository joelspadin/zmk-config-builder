import React, { createContext, useContext } from 'react';
import { useAsync } from 'react-use';
import { AuthState, useAuth } from './AuthProvider';
import { GitApiStub } from './GitApiStub';
import { createGitHubApi } from './GitHubApi';
import { IGitApi } from './IGitApi';

const stub = new GitApiStub();

async function getApi(auth: AuthState): Promise<IGitApi> {
    if (!auth.data) {
        return stub;
    }

    switch (auth.data.type) {
        case 'github':
            return createGitHubApi(auth.data);
    }

    return stub;
}

export const GitApiContext = createContext<IGitApi>(stub);

export const GitApiProvider: React.FunctionComponent = ({ children }) => {
    const auth = useAuth();
    const api = useAsync(async () => getApi(auth), [auth]);

    return <GitApiContext.Provider value={api.value ?? stub}>{children}</GitApiContext.Provider>;
};

export function useGit(): IGitApi {
    return useContext(GitApiContext);
}
