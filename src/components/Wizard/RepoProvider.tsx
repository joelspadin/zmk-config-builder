import React, { createContext, Dispatch, SetStateAction, useContext } from 'react';
import { useLocalStorage } from 'react-use';

interface RepoId {
    owner: string;
    repo: string;
    branch: string;
}

export type RepoContextValue = [RepoId | undefined, Dispatch<SetStateAction<RepoId | undefined>>, () => void];

export const RepoContext = createContext<RepoContextValue>([undefined, () => {}, () => {}]);

export const RepoProvider: React.FunctionComponent = ({ children }) => {
    const value = useLocalStorage<RepoId>('repo');

    return <RepoContext.Provider value={value}>{children}</RepoContext.Provider>;
};

export function useRepo(): RepoContextValue {
    return useContext(RepoContext);
}
