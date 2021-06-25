import {
    Dropdown,
    IDropdownOption,
    IDropdownStyleProps,
    IDropdownStyles,
    IStyleFunctionOrObject,
} from '@fluentui/react';
import React from 'react';
import { IRemote } from './RemotesProvider';

const options: IDropdownOption<IRemote>[] = [
    {
        key: 'zmk',
        text: 'zmk',
        data: {
            name: 'zmk',
            urlBase: 'https://github.com/zmkfirmware',
        },
    },
    {
        key: 'okke-formsma',
        text: 'okke-formsma',
        data: {
            name: 'okke-formsma',
            urlBase: 'https://github.com/okke-formsma',
        },
    },
];

export interface IRemoteDropdownProps {
    label?: string;
    styles?: IStyleFunctionOrObject<IDropdownStyleProps, IDropdownStyles>;
    value?: IRemote;
    onChange?: (newValue: IRemote | undefined) => void;
}

export const RemoteDropdown: React.FunctionComponent<IRemoteDropdownProps> = ({ label, styles, value, onChange }) => {
    return (
        <Dropdown
            label={label}
            selectedKey={value?.name ?? undefined}
            onChange={(ev, item) => {
                onChange?.(item?.data);
            }}
            options={options}
            styles={styles}
        />
    );
};
