import React, { createContext, useContext } from 'react';
import { useAsync } from 'react-use';
import { useMessageBar } from '../MessageBarProvider';
import { AuthContext, AuthState, BaseAuthState } from './AuthProvider';
import { createGitHubApi } from './GitHubRemote';
import { IGitRemote } from './IGitRemote';
import { StubRemote } from './StubRemote';

const stub = new StubRemote();

async function getApi(auth: BaseAuthState): Promise<IGitRemote | undefined> {
    if (!auth.data) {
        return undefined;
    }

    switch (auth.data.type) {
        case 'github':
            return createGitHubApi(auth.data);
    }

    return undefined;
}

export const GitRemoteContext = createContext<IGitRemote | undefined>(undefined);

// TODO: if we support other APIs aside from GitHub, we will need to dynamically
// switch which one we're using based on the selected repo. Also will requre
// storing authentication for multiple services at once.
export const GitRemoteProvider: React.FunctionComponent = ({ children }) => {
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

    return <GitRemoteContext.Provider value={api.value}>{children}</GitRemoteContext.Provider>;
};

export function useGitRemote(): IGitRemote {
    return useContext(GitRemoteContext) ?? stub;
}

export function useAuth(): AuthState {
    const auth = useContext(AuthContext);
    const git = useContext(GitRemoteContext);

    return {
        isAuthenticating: auth.data !== undefined && git === undefined,
        isAuthenticated: git?.isAuthenticated ?? false,
        ...auth,
    };
}
