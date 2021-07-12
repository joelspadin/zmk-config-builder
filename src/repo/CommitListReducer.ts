import React from 'react';
import { Commit } from '../gitgraph/types';

export interface CommitAddAction {
    type: 'add';
    commits: Commit[];
}

export interface CommitClearAction {
    type: 'clear';
}

export type CommitListAction = CommitAddAction | CommitClearAction;

export const commitListReducer: React.Reducer<Commit[], CommitListAction> = (state, action) => {
    switch (action.type) {
        case 'add':
            return [...state, ...action.commits];

        case 'clear':
            return [];
    }
};
