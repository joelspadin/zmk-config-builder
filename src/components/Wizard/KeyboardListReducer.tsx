import React, { createContext, Dispatch } from 'react';
import type { BuildTarget } from '../../targets';

export interface KeyboardListItem {
    keyboard?: BuildTarget;
    controller?: BuildTarget;
}

interface AddAction {
    type: 'add';
}

interface RemoveAction {
    type: 'remove';
    index: number;
}

interface SetKeyboardAction {
    type: 'set-keyboard';
    index: number;
    keyboard: BuildTarget | undefined;
}

interface SetControllerAction {
    type: 'set-controller';
    index: number;
    controller: BuildTarget | undefined;
}

export type KeyboardListAction = AddAction | RemoveAction | SetKeyboardAction | SetControllerAction;

export const KeyboardListDispatch = createContext<Dispatch<KeyboardListAction>>(() => {});

export const keyboardListReducer: React.Reducer<KeyboardListItem[], KeyboardListAction> = (state, action) => {
    switch (action.type) {
        case 'add':
            return [...state, { keyboard: undefined, controller: undefined }];

        case 'remove':
            return [...state.slice(0, action.index), ...state.slice(action.index + 1)];

        case 'set-keyboard':
            if (state[action.index]?.keyboard === action.keyboard) {
                return state;
            }
            const isShield = action.keyboard?.type === 'shield';
            return state.map((item, i) =>
                i === action.index
                    ? { keyboard: action.keyboard, controller: isShield ? item.controller : undefined }
                    : item
            );

        case 'set-controller':
            if (state[action.index]?.controller === action.controller) {
                return state;
            }
            return state.map((item, i) => (i === action.index ? { ...item, controller: action.controller } : item));
    }
};
