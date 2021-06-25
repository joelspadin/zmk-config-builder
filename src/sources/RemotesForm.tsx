import {
    CommandBar,
    DetailsList,
    DetailsListLayoutMode,
    DetailsRow,
    IColumn,
    IContextualMenuItem,
    IDetailsRowProps,
    IDetailsRowStyles,
    Selection,
    SelectionMode,
    TextField,
} from '@fluentui/react';
import { useConst, useForceUpdate } from '@fluentui/react-hooks';
import React, { useCallback, useMemo, useState } from 'react';
import { ConfirmPrompt, useConfirmPrompt } from '../ConfirmPrompt';
import { IRemote } from './RemotesProvider';

const defaultItems: IRemote[] = [
    {
        name: 'zmk',
        urlBase: 'https://github.com/zmkfirmware',
    },
    {
        name: 'okke-formsma',
        urlBase: 'https://github.com/okke-formsma',
    },
];

function renderRow(props: IDetailsRowProps | undefined) {
    const rowStyles: Partial<IDetailsRowStyles> = {
        checkCell: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
        },
    };
    if (props) {
        return <DetailsRow {...props} styles={rowStyles} />;
    }
    return null;
}

export const RemotesForm: React.FunctionComponent = () => {
    const forceUpdate = useForceUpdate();
    const selection = useConst(
        () =>
            new Selection({
                onSelectionChanged: forceUpdate,
            }),
    );

    // TODO: use a reducer for editing/persisting items
    const [items, setItems] = useState<IRemote[]>(defaultItems);

    const addRow = useCallback(() => {
        setItems([...items, { name: '', urlBase: '' }]);
    }, [items]);

    const deleteRows = useCallback(() => {
        const selected = selection.getSelectedIndices();
        const newItems = items.filter((value, index) => {
            return !selected.includes(index);
        });
        setItems(newItems);
    }, [selection, items]);

    const confirmDelete = useConfirmPrompt(deleteRows);

    const setName = useCallback(
        (index: number, name: string) => {
            const newItems = [...items];
            items[index].name = name;
            setItems(newItems);
        },
        [items],
    );

    const setUrlBase = useCallback(
        (index: number, url: string) => {
            const newItems = [...items];
            items[index].urlBase = url;
            setItems(newItems);
        },
        [items],
    );

    const columns = useMemo<IColumn[]>(
        () => [
            {
                key: 'name',
                name: 'Name',
                minWidth: 100,
                maxWidth: 150,
                // eslint-disable-next-line react/display-name
                onRender: (item: IRemote, index) => {
                    const onChange = useCallback(
                        (ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
                            setName(index!, newValue || '');
                        },
                        [index],
                    );
                    return <TextField value={item.name} underlined placeholder="Name" onChange={onChange} />;
                },
            },
            {
                key: 'url',
                name: 'URL base',
                minWidth: 100,
                // eslint-disable-next-line react/display-name
                onRender: (item: IRemote, index: number | undefined) => {
                    const onChange = useCallback(
                        (ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
                            setUrlBase(index!, newValue || '');
                        },
                        [index],
                    );
                    return (
                        <TextField
                            type="url"
                            value={item.urlBase}
                            underlined
                            placeholder="URL base"
                            onChange={onChange}
                        />
                    );
                },
            },
        ],
        [],
    );

    const commands: IContextualMenuItem[] = [
        {
            key: 'addRow',
            text: 'Add remote',
            iconProps: { iconName: 'Add' },
            onClick: addRow,
        },
        {
            key: 'deleteRows',
            text: 'Delete',
            iconProps: { iconName: 'Delete' },
            disabled: selection.count === 0,
            onClick: confirmDelete.show,
        },
    ];

    const farCommands: IContextualMenuItem[] = [
        {
            key: 'default',
            text: 'Restore defaults',
            iconProps: { iconName: 'RevToggleKey' },
            onClick: () => {},
        },
    ];

    // TODO: add save button
    return (
        <>
            <CommandBar items={commands} farItems={farCommands} />
            <DetailsList
                items={items}
                columns={columns}
                setKey="multiple"
                layoutMode={DetailsListLayoutMode.justified}
                selectionMode={SelectionMode.multiple}
                selection={selection}
                selectionPreservedOnEmptyClick={true}
                onRenderRow={renderRow}
            />
            <ConfirmPrompt
                title="Delete remotes"
                message="Are you sure you want to remove the selected remotes?"
                confirmText="Delete"
                {...confirmDelete.props}
            />
        </>
    );
};
