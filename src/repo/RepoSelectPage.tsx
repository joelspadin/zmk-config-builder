import {
    ActionButton,
    ComboBox,
    IComboBoxOption,
    IComboBoxStyles,
    mergeStyleSets,
    PrimaryButton,
    Stack,
} from '@fluentui/react';
import React from 'react';
import { Section, SectionHeader } from '../Section';
import { GraphView } from './GraphView';

const CONTROL_WIDTH = 300;

const classNames = mergeStyleSets({
    actions: {
        marginTop: 28,
    },
});

const comboBoxStyles: Partial<IComboBoxStyles> = {
    root: {
        width: CONTROL_WIDTH,
    },
};

export const RepoSelectPage: React.FunctionComponent = () => {
    const repoOptions: IComboBoxOption[] = [
        {
            key: 'johndoe/zmk-config',
            text: 'johndoe/zmk-config',
        },
    ];
    const branchOptions: IComboBoxOption[] = [
        {
            key: 'main',
            text: 'main',
        },
        {
            key: 'feature-1',
            text: 'feature-1',
        },
        {
            key: 'feature-2',
            text: 'feature-2',
        },
    ];

    return (
        <>
            <Stack>
                <Section>
                    <SectionHeader>Select your ZMK config repo</SectionHeader>
                    <p>
                        If you already have a ZMK config repo, select it from the list below. Otherwise, you can create
                        a new repo from a template.
                    </p>
                    <ActionButton text="Create a new repo" iconProps={{ iconName: 'Add' }} />
                    <ComboBox label="Repository" options={repoOptions} styles={comboBoxStyles} useComboBoxAsMenuWidth />
                    <Stack horizontal className={classNames.actions}>
                        <PrimaryButton text="Change repo" />
                    </Stack>
                </Section>
                <Section>
                    <SectionHeader>Select the branch to edit</SectionHeader>
                    <ComboBox label="Branch" options={branchOptions} styles={comboBoxStyles} useComboBoxAsMenuWidth />
                    <Stack horizontal className={classNames.actions}>
                        <PrimaryButton text="Change branch" />
                    </Stack>
                </Section>
                <GraphView />
            </Stack>
        </>
    );
};
