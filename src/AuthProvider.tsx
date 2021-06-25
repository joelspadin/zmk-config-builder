import React, { createContext, useContext } from 'react';
import { useLocalStorage } from 'react-use';

export interface AuthState {
    isAuthenticated: boolean;
    accessToken: string | undefined;
    setAccessToken(token: string | undefined): void;
    signOut(): void;
}

export const AccessTokenContext = createContext<AuthState>({
    isAuthenticated: false,
    accessToken: undefined,
    setAccessToken: () => {},
    signOut: () => {},
});

export const AuthProvider: React.FunctionComponent = ({ children }) => {
    const [accessToken, setAccessToken, removeAccessToken] = useLocalStorage<string | undefined>('accessToken');
    const isAuthenticated = !!accessToken;
    const signOut = removeAccessToken;

    return (
        <AccessTokenContext.Provider value={{ isAuthenticated, accessToken, setAccessToken, signOut }}>
            {children}
        </AccessTokenContext.Provider>
    );
};

export function useAuth(): AuthState {
    return useContext(AccessTokenContext);
}
