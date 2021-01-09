import React, { createContext, Dispatch } from 'react';
import type { Build, BuildTarget } from '../../targets';

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

interface ClearAction {
    type: 'clear';
}

export const EMPTY_KEYBOARDS = [{ keyboard: undefined, controller: undefined }];

export type KeyboardListAction = AddAction | RemoveAction | SetKeyboardAction | SetControllerAction | ClearAction;

export const KeyboardListDispatch = createContext<Dispatch<KeyboardListAction>>(() => {});

export const keyboardListReducer: React.Reducer<Partial<Build>[], KeyboardListAction> = (state, action) => {
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

        case 'clear':
            return EMPTY_KEYBOARDS;
    }
};

export function isKeyboardListValid(keyboards: Partial<Build>[]) {
    for (const item of keyboards) {
        if (item.keyboard?.type === 'shield' && item.controller === undefined) {
            return false;
        }
    }

    return true;
}

export function filterKeyboards(keyboards: Partial<Build>[]): Build[] {
    return keyboards.filter((item) => item.keyboard !== undefined) as Build[];
}
