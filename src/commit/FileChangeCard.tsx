import { classNamesFunction, IconButton, IIconProps, IStyle, Link, Stack, Theme, useTheme } from '@fluentui/react';
import { useBoolean, useId } from '@fluentui/react-hooks';
import { DiffEditor, DiffOnMount } from '@monaco-editor/react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import React, { useCallback, useMemo, useState } from 'react';
import { mediaQuery } from '../styles';

interface IFileChangeCardStyles {
    root: IStyle;
    header: IStyle;
    expandButton: IStyle;
    fileName: IStyle;
    rename: IStyle;
    editor: IStyle;
}

const getClassNames = classNamesFunction<Theme, IFileChangeCardStyles>();

export interface IFileContents {
    name: string;
    text: string;
}

export interface IFileChangeCardProps {
    original?: IFileContents;
    modified?: IFileContents;
    defaultExpanded?: boolean;
}

const options: monaco.editor.IDiffEditorConstructionOptions = {
    automaticLayout: true,
    readOnly: true,
    scrollBeyondLastLine: false,
};

export const FileChangeCard: React.FunctionComponent<IFileChangeCardProps> = ({
    original,
    modified,
    defaultExpanded,
}) => {
    const [expanded, { toggle: toggleExpanded }] = useBoolean(defaultExpanded ?? true);
    const [height, setHeight] = useState<number>();

    const fileName = modified?.name ?? original?.name;
    const isRename = original && modified && original.name !== modified.name;

    // Monaco doesn't like it if two files have the same URI, so stick a unique
    // prefix on each file name.
    const id = useId();
    const originalModelPath = original ? `${id}/original/${original.name}` : undefined;
    const modifiedModelPath = modified ? `${id}/modified/${modified.name}` : undefined;

    const theme = useTheme();
    const classNames = getClassNames(() => {
        return {
            root: {
                backgroundColor: theme.palette.white,
                boxShadow: theme.effects.elevation8,
                marginLeft: -28,
                marginRight: -28,
                marginBottom: 28,
                [mediaQuery.widthMedium]: {
                    marginLeft: 0,
                    marginRight: 0,
                    borderRadius: theme.effects.roundedCorner4,
                },
                overflow: 'hidden',
                maxHeight: '80vh',
            },
            header: {
                height: 42,
            },
            expandButton: {
                marginLeft: 5,
            },
            fileName: {
                color: theme.palette.neutralPrimary,
            },
            rename: {
                '::after': {
                    content: '"→"',
                    marginLeft: 10,
                },
            },
        };
    }, theme);

    const iconProps = useMemo<IIconProps>(
        () => ({
            iconName: expanded ? 'ChevronFold10' : 'ChevronUnfold10',
            styles: {
                root: {
                    color: theme.palette.neutralSecondaryAlt,
                },
            },
        }),
        [theme, expanded],
    );

    const handleEditorDidMount: DiffOnMount = useCallback(
        (editor) => {
            const originalEditor = editor.getOriginalEditor();
            const modifiedEditor = editor.getModifiedEditor();

            setHeight(Math.max(originalEditor.getScrollHeight(), modifiedEditor.getScrollHeight()));
        },
        [setHeight],
    );

    return (
        <div className={classNames.root}>
            <Stack horizontal verticalAlign="center" className={classNames.header} tokens={{ childrenGap: 10 }}>
                <IconButton className={classNames.expandButton} iconProps={iconProps} onClick={toggleExpanded} />
                {isRename && <span className={classNames.fileName + ' ' + classNames.rename}>{original?.name}</span>}
                <Link className={classNames.fileName}>{fileName}</Link>
            </Stack>
            {expanded && (
                <DiffEditor
                    className={classNames.editor}
                    original={original?.text}
                    modified={modified?.text}
                    originalModelPath={originalModelPath}
                    modifiedModelPath={modifiedModelPath}
                    onMount={handleEditorDidMount}
                    height={height}
                    theme={theme.isInverted ? 'vs-dark' : 'light'}
                    options={options}
                />
            )}
        </div>
    );
};
