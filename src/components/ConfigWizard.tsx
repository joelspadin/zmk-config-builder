import React, { useReducer, useState } from 'react';
import { ConfigWizardDispatch, WizardState, wizardStateReducer, WizardStep } from './ConfigWizardReducer';
import ModifyRepoPage from './ModifyRepoPage';
import RepoSelectPage from './RepoSelectPage';

const INITIAL_STATE: WizardState = {
    step: WizardStep.SelectRepo,
};

export interface ConfigWizardProps {}

const ConfigWizard: React.FunctionComponent<ConfigWizardProps> = () => {
    const [state, dispatch] = useReducer(wizardStateReducer, INITIAL_STATE);

    function getContentsForStep() {
        switch (state.step) {
            case WizardStep.SelectRepo:
                return <RepoSelectPage />;

            case WizardStep.ModifyRepo:
                return <ModifyRepoPage />;
        }
    }

    return <ConfigWizardDispatch.Provider value={dispatch}>{getContentsForStep()}</ConfigWizardDispatch.Provider>;
};

export default ConfigWizard;
