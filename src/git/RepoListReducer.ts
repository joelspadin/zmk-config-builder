import React from 'react';
import { getRepoDisplayName, RepoId, repoIdEquals } from './IGitApi';

export interface RepoAddAction {
    type: 'add';
    repo: RepoId;
}

export interface RepoDeleteAction {
    type: 'delete';
    repo: RepoId;
}

export type RepoListAction = RepoAddAction | RepoDeleteAction;

function exists(repos: RepoId[], repo: RepoId) {
    return repos.some((x) => repoIdEquals(x, repo));
}

function sorted(repos: RepoId[]) {
    repos.sort((a, b) => getRepoDisplayName(a).localeCompare(getRepoDisplayName(b)));
    return repos;
}

function omit(repos: RepoId[], omit: RepoId) {
    return repos.filter((x) => !repoIdEquals(x, omit));
}

export const repoListReducer: React.Reducer<RepoId[], RepoListAction> = (state, action) => {
    switch (action.type) {
        case 'add':
            if (exists(state, action.repo)) {
                return state;
            }
            return sorted([...state, action.repo]);

        case 'delete':
            return omit([...state], action.repo);
    }
};
