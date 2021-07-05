import React, { createContext } from 'react';
import { useLocalStorage } from 'react-use';

export interface AuthGitHubToken {
    type: 'github';
    token: string;
}

export type AuthData = AuthGitHubToken;

export interface BaseAuthState {
    readonly data: AuthData | undefined;
    signIn(data: AuthData): void;
    signOut(): void;
}

export interface AuthState extends BaseAuthState {
    readonly isAuthenticated: boolean;
    readonly isAuthenticating: boolean;
}

export const AuthContext = createContext<BaseAuthState>({
    data: undefined,
    signIn: () => {},
    signOut: () => {},
});

export const AuthProvider: React.FunctionComponent = ({ children }) => {
    const [data, signIn, signOut] = useLocalStorage<AuthData | undefined>('auth');

    return <AuthContext.Provider value={{ data, signIn, signOut }}>{children}</AuthContext.Provider>;
};
