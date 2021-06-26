import {
    CommandBar,
    DetailsList,
    DetailsListLayoutMode,
    IColumn,
    IContextualMenuItem,
    SelectionMode,
} from '@fluentui/react';
import React from 'react';
import { IBoardConfig } from './BoardsProvider';
import { FileEditCell } from './FileEditCell';

const mockItems: IBoardConfig[] = [
    {
        keymapPath: 'corne.keymap',
        configPath: 'corne.conf',
    },
    {
        keymapPath: 'numble.keymap',
    },
];

const columns: IColumn[] = [
    {
        key: 'keymap',
        name: 'Keymap',
        fieldName: 'keymapPath',
        minWidth: 200,
        // eslint-disable-next-line react/display-name
        onRender: (item: IBoardConfig) => <FileEditCell path={item.keymapPath} />,
    },
    {
        key: 'config',
        name: 'Config',
        fieldName: 'configPath',
        minWidth: 200,
        // eslint-disable-next-line react/display-name
        onRender: (item: IBoardConfig) => <FileEditCell path={item.configPath} />,
    },
];

export const KeymapsForm: React.FunctionComponent = () => {
    const addRow = () => {
        // TODO
    };

    const commands: IContextualMenuItem[] = [
        {
            key: 'addRow',
            text: 'Add keyboard',
            iconProps: { iconName: 'Add' },
            onClick: addRow,
        },
    ];

    return (
        <>
            <CommandBar items={commands} />
            <DetailsList
                columns={columns}
                items={mockItems}
                layoutMode={DetailsListLayoutMode.fixedColumns}
                selectionMode={SelectionMode.none}
            />
        </>
    );
};
