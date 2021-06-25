import {
    CommandBar,
    DefaultButton,
    DetailsList,
    DetailsListLayoutMode,
    DetailsRow,
    IColumn,
    IContextualMenuItem,
    IDetailsRowProps,
    IDetailsRowStyles,
    Selection,
    SelectionMode,
} from '@fluentui/react';
import { useBoolean, useConst, useForceUpdate } from '@fluentui/react-hooks';
import React, { useCallback, useMemo, useState } from 'react';
import { ConfirmPrompt, useConfirmPrompt } from '../ConfirmPrompt';
import { AddKeyboardDialog } from './AddKeyboardDialog';
import { IBuildItem } from './BuildMatrixProvider';

const defaultItems: IBuildItem[] = [
    {
        shield: 'corne_left',
        board: 'nice_nano',
    },
    {
        shield: 'corne_right',
        board: 'nice_nano',
    },
    {
        board: 'numble',
    },
];

function renderRow(props: IDetailsRowProps | undefined) {
    const rowStyles: Partial<IDetailsRowStyles> = {
        checkCell: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
        },
        cell: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            fontSize: 14,
        },
    };
    if (props) {
        return <DetailsRow {...props} styles={rowStyles} />;
    }
    return null;
}

function sortItems(a: IBuildItem, b: IBuildItem) {
    let result = (a.shield ?? '').localeCompare(b.shield ?? '');
    if (result !== 0) {
        return result;
    }

    result = a.board.localeCompare(b.board);
    if (result !== 0) {
        return result;
    }

    return (a.extraArgs ?? '').localeCompare(b.extraArgs ?? '');
}

function normalizeItems(items: IBuildItem[]) {
    // Deduplicate and sort
    const key = (x: IBuildItem) => `${x.shield ?? ''};${x.board};${x.extraArgs ?? ''}`;

    const map = new Map(items.map((x) => [key(x), x]));
    return [...map.values()].sort(sortItems);
}

export const BuildMatrix: React.FunctionComponent = () => {
    const forceUpdate = useForceUpdate();
    const selection = useConst(
        () =>
            new Selection({
                onSelectionChanged: forceUpdate,
            }),
    );

    // TODO: use a reducer for editing/persisting items
    const [items, setItems] = useState<IBuildItem[]>(normalizeItems(defaultItems));

    const [showAddDialog, { setTrue: setShowAddDialogTrue, setFalse: setShowAddDialogFalse }] = useBoolean(false);

    const addRows = useCallback(
        (newItems: IBuildItem[]) => {
            setShowAddDialogFalse();
            setItems(normalizeItems([...items, ...newItems]));
        },
        [items],
    );

    const deleteRows = useCallback(() => {
        const selected = selection.getSelectedIndices();
        const newItems = items.filter((value, index) => {
            return !selected.includes(index);
        });
        setItems(newItems);
    }, [selection, items]);

    const confirmDelete = useConfirmPrompt(deleteRows);

    const editRow = useCallback(
        (index: number) => {
            console.log('Edit keyboard', index);
        },
        [items],
    );

    const columns = useMemo<IColumn[]>(
        () => [
            {
                key: 'shield',
                name: 'Shield',
                fieldName: 'shield',
                minWidth: 80,
                maxWidth: 120,
            },
            {
                key: 'board',
                name: 'Board',
                fieldName: 'board',
                minWidth: 80,
                maxWidth: 120,
            },
            {
                key: 'extraArgs',
                name: 'CMake args',
                fieldName: 'extraArgs',
                minWidth: 80,
            },
            {
                key: 'actions',
                name: '',
                minWidth: 80,
                // eslint-disable-next-line react/display-name
                onRender: (item: IBuildItem, index) => {
                    return <DefaultButton text="Edit" onClick={() => editRow(index!)} />;
                },
            },
        ],
        [],
    );

    const commands: IContextualMenuItem[] = [
        {
            key: 'addRow',
            text: 'Add keyboard',
            iconProps: { iconName: 'Add' },
            onClick: setShowAddDialogTrue,
        },
        {
            key: 'deleteRows',
            text: 'Delete',
            iconProps: { iconName: 'Delete' },
            disabled: selection.count === 0,
            onClick: confirmDelete.show,
        },
    ];

    return (
        <>
            <CommandBar items={commands} />
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
            <AddKeyboardDialog isOpen={showAddDialog} onDismiss={setShowAddDialogFalse} onConfirm={addRows} />
            <ConfirmPrompt
                title="Delete builds"
                message="Are you sure you want to remove the selected keyboards from the build?"
                confirmText="Delete"
                {...confirmDelete.props}
            />
        </>
    );
};
