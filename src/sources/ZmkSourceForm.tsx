import { ComboBox, IComboBoxOption, IComboBoxStyles, IDropdownStyles, Stack } from '@fluentui/react';
import React from 'react';
import { CONTROL_WIDTH } from '../styles';
import { RemoteDropdown } from './RemoteDropdown';

const dropdownStyles: Partial<IDropdownStyles> = {
    dropdown: {
        width: CONTROL_WIDTH,
    },
};

const comboBoxStyles: Partial<IComboBoxStyles> = {
    root: {
        width: CONTROL_WIDTH,
    },
};

export const ZmkSourceForm: React.FunctionComponent = () => {
    // TODO: suggest repos on remote
    const repoOptions: IComboBoxOption[] = [
        {
            key: 'zmk',
            text: 'zmk',
        },
    ];

    // TODO: suggest branches
    const revisionOptions: IComboBoxOption[] = [
        {
            key: 'main',
            text: 'main',
        },
    ];

    return (
        <Stack tokens={{ childrenGap: 10 }}>
            <RemoteDropdown label="Remote" styles={dropdownStyles} />
            <ComboBox
                label="Repository"
                defaultSelectedKey="zmk"
                allowFreeform
                autoComplete="on"
                openOnKeyboardFocus
                useComboBoxAsMenuWidth
                options={repoOptions}
                styles={comboBoxStyles}
            />
            <ComboBox
                label="Branch or revision"
                defaultSelectedKey="main"
                allowFreeform
                autoComplete="on"
                openOnKeyboardFocus
                useComboBoxAsMenuWidth
                options={revisionOptions}
                styles={comboBoxStyles}
            />
        </Stack>
    );
};
