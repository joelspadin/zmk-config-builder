import React, { createContext, Dispatch, SetStateAction, useContext } from 'react';
import { useLocalStorage } from 'react-use';

export type AccessToken = string | undefined;

export type AccessTokenValue = [AccessToken, Dispatch<SetStateAction<AccessToken>>, () => void];

export const AccessTokenContext = createContext<AccessTokenValue>([undefined, () => {}, () => {}]);

export const AuthProvider: React.FunctionComponent = ({ children }) => {
    const value = useLocalStorage<AccessToken>('accessToken');

    return <AccessTokenContext.Provider value={value}>{children}</AccessTokenContext.Provider>;
};

export function useAccessToken(): AccessTokenValue {
    return useContext(AccessTokenContext);
}

export function isSignedIn(token: AccessToken) {
    return !!token;
}

export function useSignedIn() {
    const [token] = useAccessToken();
    return isSignedIn(token);
}
