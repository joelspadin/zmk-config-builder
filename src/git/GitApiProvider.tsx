import React, { createContext, useContext } from 'react';
import { useAsync } from 'react-use';
import { useMessageBar } from '../MessageBarProvider';
import { AuthContext, AuthState, BaseAuthState } from './AuthProvider';
import { GitApiStub } from './GitApiStub';
import { createGitHubApi } from './GitHubApi';
import { IGitApi } from './IGitApi';

const stub = new GitApiStub();

async function getApi(auth: BaseAuthState): Promise<IGitApi | undefined> {
    if (!auth.data) {
        return undefined;
    }

    switch (auth.data.type) {
        case 'github':
            return createGitHubApi(auth.data);
    }

    return undefined;
}

export const GitApiContext = createContext<IGitApi | undefined>(undefined);

export const GitApiProvider: React.FunctionComponent = ({ children }) => {
    const messageBar = useMessageBar();
    const auth = useContext(AuthContext);
    const api = useAsync(async () => {
        try {
            return await getApi(auth);
        } catch (error) {
            messageBar.error(error);
            return undefined;
        }
    }, [auth]);

    return <GitApiContext.Provider value={api.value}>{children}</GitApiContext.Provider>;
};

export function useGit(): IGitApi {
    return useContext(GitApiContext) ?? stub;
}

export function useAuth(): AuthState {
    const auth = useContext(AuthContext);
    const git = useContext(GitApiContext);

    return {
        isAuthenticating: auth.data !== undefined && git === undefined,
        isAuthenticated: git?.isAuthenticated ?? false,
        ...auth,
    };
}
