import { ActionButton, ComboBox, IComboBoxOption, IComboBoxStyles, PrimaryButton, Stack } from '@fluentui/react';
import React from 'react';
import { PageTitle } from '../PageTitle';
import { Section, SectionHeader } from '../Section';
import { UnsavedChangesPrompt } from '../UnsavedChangesPrompt';

const ControlWidth = 300;

const comboBoxStyles: Partial<IComboBoxStyles> = {
    root: {
        width: ControlWidth,
    },
};

export const RepoSelectPage: React.FunctionComponent = () => {
    const hasChanges = false;
    const repoOptions: IComboBoxOption[] = [];
    const branchOptions: IComboBoxOption[] = [];

    return (
        <>
            <UnsavedChangesPrompt hasChanges={hasChanges} />
            <Stack>
                <PageTitle>Repository</PageTitle>

                <Section>
                    <SectionHeader>Select your ZMK config repo</SectionHeader>
                    <ActionButton text="Create a new repo" iconProps={{ iconName: 'Add' }} />
                    <Stack tokens={{ childrenGap: 10 }}>
                        <ComboBox label="Repository" options={repoOptions} styles={comboBoxStyles} />
                        <ComboBox label="Branch" options={branchOptions} styles={comboBoxStyles} />
                    </Stack>
                </Section>
                <Stack horizontal>
                    <PrimaryButton text="Save changes" disabled={!hasChanges} />
                </Stack>
            </Stack>
        </>
    );
};
