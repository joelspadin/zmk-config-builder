import { ComboBox, IComboBoxOption, IComboBoxStyles } from '@fluentui/react';
import React, { useMemo } from 'react';

export interface IKeyboardComponent {
    type: 'board' | 'shield';
    name: string;
    parts: string | string[];
}

export interface IKeyboardSelectProps {
    label?: string;
    options: IKeyboardComponent[];
    value?: IKeyboardComponent;
    onChange?: (value: IKeyboardComponent | undefined) => any;
    styles?: Partial<IComboBoxStyles>;
}

export const KeyboardSelect: React.FunctionComponent<IKeyboardSelectProps> = ({
    label,
    options,
    value,
    onChange,
    styles,
}) => {
    const comboOptions = useMemo<IComboBoxOption[]>(() => {
        return options.map((option) => {
            return {
                key: option.name,
                text: option.name,
                data: option,
            } as IComboBoxOption;
        });
    }, [options]);

    return (
        <ComboBox
            label={label}
            allowFreeform
            autoComplete="on"
            useComboBoxAsMenuWidth
            openOnKeyboardFocus
            styles={styles}
            options={comboOptions}
            selectedKey={value?.name || undefined}
            onChange={(ev, option) => {
                onChange?.(option?.data as IKeyboardComponent);
            }}
        />
    );
};
