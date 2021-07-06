import {
    CommandBar,
    DetailsList,
    DetailsListLayoutMode,
    IColumn,
    Icon,
    IContextualMenuItem,
    IStyle,
    mergeStyleSets,
    Selection,
    SelectionMode,
    TooltipHost,
} from '@fluentui/react';
import { useConst, useForceUpdate } from '@fluentui/react-hooks';
import * as filesize from 'filesize';
import React, { useCallback, useState } from 'react';
import { useAsync } from 'react-use';
import { ConfirmPrompt, useConfirmPrompt } from '../ConfirmPrompt';
import { getRepoDisplayName, RepoId, repoIdEquals } from '../git/IGitApi';
import { useRepos } from '../git/RepoProvider';

interface IRepoItem {
    isCurrent: boolean;
    repo: RepoId;
    size?: number;
}

const classNames = mergeStyleSets({
    statusIcon: {
        verticalAlign: 'middle',
        fontSize: 16,
    } as IStyle,
});

const columns: IColumn[] = [
    {
        key: 'state',
        name: 'State',
        isIconOnly: true,
        minWidth: 16,
        maxWidth: 16,
        // eslint-disable-next-line react/display-name
        onRender: (item: IRepoItem) => {
            return (
                item.isCurrent && (
                    <TooltipHost content="Current repo">
                        <Icon iconName="POISolid" className={classNames.statusIcon} />
                    </TooltipHost>
                )
            );
        },
    },
    {
        key: 'name',
        name: 'Name',
        minWidth: 100,
        maxWidth: 200,
        isRowHeader: true,
        isPadded: true,
        // eslint-disable-next-line react/display-name
        onRender: (item: IRepoItem) => {
            return getRepoDisplayName(item.repo);
        },
    },
    {
        key: 'size',
        name: 'Size',
        minWidth: 100,
        maxWidth: 120,
        // eslint-disable-next-line react/display-name
        onRender: (item: IRepoItem) => {
            return item.size && <span>{filesize(item.size)}</span>;
        },
    },
];

export const LocalRepoList: React.FunctionComponent = () => {
    const state = useRepos();
    const [items, setItems] = useState<IRepoItem[]>([]);

    useAsync(async () => {
        const repos = state.listRepos();
        const items = repos.map<IRepoItem>((repo) => ({
            repo,
            isCurrent: !!state.current && repoIdEquals(repo, state.current.id),
        }));
        setItems(items);

        for (let i = 0; i < repos.length; i++) {
            const fs = state.getFs(repos[i]);
            items[i].size = await fs.promises.du('/');
        }

        setItems([...items]);
    }, [state]);

    const forceUpdate = useForceUpdate();
    const selection = useConst(
        () =>
            new Selection({
                onSelectionChanged: forceUpdate,
            }),
    );
    const selectedItem = selection.getSelection()?.[0] as IRepoItem | undefined;

    const selectRepo = useCallback(
        (item?: IRepoItem) => {
            if (item && !item.isCurrent) {
                state.setRepo(item.repo);
            }
        },
        [state],
    );

    const deleteRepo = useCallback(
        (item?: IRepoItem) => {
            if (item && !item.isCurrent) {
                state.deleteRepo(item.repo);
            }
        },
        [state],
    );

    const deletePrompt = useConfirmPrompt(() => deleteRepo(selectedItem));

    const commands: IContextualMenuItem[] = [
        {
            key: 'select',
            text: 'Switch to repo',
            iconProps: { iconName: 'CheckedOutByYou12' },
            disabled: selection.count === 0 || selectedItem?.isCurrent,
            onClick: () => selectRepo(selectedItem),
        },
        {
            key: 'delete',
            text: 'Delete',
            iconProps: { iconName: 'Delete' },
            disabled: selection.count === 0 || selectedItem?.isCurrent,
            onClick: deletePrompt.show,
        },
    ];

    return (
        <>
            <CommandBar items={commands} />
            <DetailsList
                items={items}
                columns={columns}
                layoutMode={DetailsListLayoutMode.justified}
                selectionMode={SelectionMode.single}
                selection={selection}
                selectionPreservedOnEmptyClick
            />
            {selectedItem && (
                <ConfirmPrompt
                    {...deletePrompt.props}
                    title={`Delete ${getRepoDisplayName(selectedItem.repo)}`}
                    message="Are you sure you want to delete this repo? All uncommitted changes will be lost"
                    confirmText="Delete repo"
                />
            )}
        </>
    );
};
