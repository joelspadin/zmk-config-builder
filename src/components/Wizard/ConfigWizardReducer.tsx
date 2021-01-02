import React, { createContext, Dispatch } from 'react';

export enum WizardStep {
    SelectRepo,
    ModifyRepo,
}

export interface WizardState {
    step: WizardStep;
}

interface SetStepAction {
    type: 'set-step';
    step: WizardStep;
}

export type WizardAction = SetStepAction;

export const ConfigWizardDispatch = createContext<Dispatch<WizardAction>>(() => {});

export const wizardStateReducer: React.Reducer<WizardState, WizardAction> = (state, action) => {
    switch (action.type) {
        case 'set-step':
            return { ...state, step: action.step };
    }
};
