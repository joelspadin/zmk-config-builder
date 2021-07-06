import FS from '@isomorphic-git/lightning-fs';
import React, { createContext, useContext, useMemo } from 'react';
import { useLocalStorage } from 'react-use';
import { useLocalStorageReducer } from '../hooks';
import { getRepoDisplayName, getRepoKey, RepoId, repoIdEquals } from './IGitApi';
import { repoListReducer } from './RepoListReducer';

export interface CurrentRepo {
    id: RepoId;
    fs: FS;
}

export interface RepoState {
    /** The active repo */
    current: CurrentRepo | undefined;

    /** Changes the active repo and returns its filesystem */
    setRepo(repo: RepoId): FS;
    /** Gets the filesystem for a repo which may or may not be the active one */
    getFs(repo: RepoId): FS;

    /** Gets a list of all cloned repos */
    listRepos(): RepoId[];
    /** Returns whether a repo has been cloned */
    exists(repo: RepoId): boolean;
    /** Deletes all data for a repo */
    deleteRepo(repo: RepoId): Promise<void>;
}

function getFs(repo: RepoId) {
    return new FS(getRepoKey(repo));
}

function deleteRepo(repo: RepoId) {
    return new Promise<void>((resolve, reject) => {
        const request = indexedDB.deleteDatabase(getRepoKey(repo));

        request.addEventListener('blocked', () => {
            reject(new Error(`Cannot delete repo ${getRepoDisplayName(repo)}: blocked.`));
        });

        request.addEventListener('error', () => {
            reject(new Error(`Error deleting repo ${getRepoDisplayName(repo)}: ${request.error}`));
        });

        request.addEventListener('success', () => {
            resolve();
        });
    });
}

const stub: RepoState = {
    current: undefined,
    setRepo: getFs,
    getFs: getFs,

    listRepos: () => [],
    exists: () => false,
    deleteRepo: async () => {},
};

export const RepoContext = createContext<RepoState>(stub);

export const RepoProvider: React.FunctionComponent = ({ children }) => {
    // TODO: switch to indexedDB.databases() once that is supported across all browsers.
    const [repos, dispatch] = useLocalStorageReducer('repos', repoListReducer, []);
    const [currentRepo, setCurrentRepo] = useLocalStorage<RepoId>('currentRepo');

    const current = useMemo<CurrentRepo | undefined>(() => {
        if (currentRepo) {
            return {
                id: currentRepo,
                fs: getFs(currentRepo),
            };
        }
        return undefined;
    }, [currentRepo]);

    const state = useMemo<RepoState>(() => {
        return {
            current,
            setRepo: (repo) => {
                dispatch({ type: 'add', repo });
                setCurrentRepo(repo);
                return getFs(repo);
            },
            getFs: getFs,

            listRepos: () => repos,
            exists: (repo: RepoId) => repos.some((x) => repoIdEquals(x, repo)),
            deleteRepo: async (repo) => {
                if (current && repoIdEquals(repo, current.id)) {
                    throw new Error('Cannot delete the active repo');
                }

                await deleteRepo(repo);
                dispatch({ type: 'delete', repo });
            },
        };
    }, [current, repos, dispatch, currentRepo, setCurrentRepo]);

    return <RepoContext.Provider value={state}>{children}</RepoContext.Provider>;
};

export function useRepos() {
    return useContext(RepoContext);
}

export function useCurrentRepo() {
    return useContext(RepoContext).current?.id;
}

export function useFs() {
    return useContext(RepoContext).current?.fs;
}
