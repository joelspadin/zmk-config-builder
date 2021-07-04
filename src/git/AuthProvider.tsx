import React, { createContext, useContext } from 'react';
import { useLocalStorage } from 'react-use';

export interface AuthGitHubToken {
    type: 'github';
    token: string;
}

export type AuthData = AuthGitHubToken;

export interface AuthState {
    readonly data: AuthData | undefined;
    authenticate(data: AuthData): void;
    signOut(): void;
}

export const AuthContext = createContext<AuthState>({
    data: undefined,
    authenticate: () => {},
    signOut: () => {},
});

export const AuthProvider: React.FunctionComponent = ({ children }) => {
    const [data, authenticate, signOut] = useLocalStorage<AuthData | undefined>('auth');

    return <AuthContext.Provider value={{ data, authenticate, signOut }}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthState {
    return useContext(AuthContext);
}
