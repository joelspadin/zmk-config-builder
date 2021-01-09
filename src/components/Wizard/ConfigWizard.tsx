import React, { useReducer } from 'react';
import { ConfigWizardDispatch, WizardState, wizardStateReducer, WizardStep } from './ConfigWizardReducer';
import ModifyRepoPage from './Modify/ModifyRepoPage';
import { useRepo } from './RepoProvider';
import RepoSelectPage from './Select/RepoSelectPage';

export interface ConfigWizardProps {}

const ConfigWizard: React.FunctionComponent<ConfigWizardProps> = () => {
    const [repo] = useRepo();
    const initialState: WizardState = {
        step: repo ? WizardStep.ModifyRepo : WizardStep.SelectRepo,
    };

    const [state, dispatch] = useReducer(wizardStateReducer, initialState);

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
