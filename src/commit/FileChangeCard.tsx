import {
    classNamesFunction,
    CommandButton,
    IconButton,
    IIconProps,
    IStyle,
    IStyleFunctionOrObject,
    Link,
    Stack,
    Theme,
    useTheme,
} from '@fluentui/react';
import { useBoolean, useId } from '@fluentui/react-hooks';
import { DiffEditor, DiffOnMount } from '@monaco-editor/react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import React, { useCallback, useMemo, useState } from 'react';
import { useMedia } from 'react-use';
import { ConfirmPrompt, useConfirmPrompt } from '../ConfirmPrompt';
import { useMonacoLanguages } from '../editor/languages/languages';
import { mediaQuery } from '../styles';

interface IFileChangeCardStyles {
    root: IStyle;
    header: IStyle;
    expandButton: IStyle;
    resetButton: IStyle;
    fileName: IStyle;
    rename: IStyle;
    editor: IStyle;
}

export interface IFileContents {
    name: string;
    text: string;
}

export interface IFileChangeCardProps {
    original?: IFileContents;
    modified?: IFileContents;
    defaultCollapsed?: boolean;
}

const baseOptions: monaco.editor.IDiffEditorConstructionOptions = {
    readOnly: true,
    scrollBeyondLastLine: false,
    scrollbar: {
        alwaysConsumeMouseWheel: false,
    },
};

const MAX_EDITOR_HEIGHT = 800;

const getClassNames = classNamesFunction<Theme, IFileChangeCardStyles>();

const getStyles: IStyleFunctionOrObject<Theme, IFileChangeCardStyles> = (theme: Theme) => {
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
        },
        header: {
            height: 42,
            padding: '0 5px',
        },
        resetButton: {
            marginLeft: 'auto !important',
        },
        fileName: {
            color: theme.palette.neutralPrimary,
        },
        rename: {
            '::after': {
                content: '"→"',
                marginInlineStart: 10,
            },
        },
    };
};

export const FileChangeCard: React.FunctionComponent<IFileChangeCardProps> = ({
    original,
    modified,
    defaultCollapsed,
}) => {
    useMonacoLanguages();

    const renderSideBySide = useMedia('(min-width: 1084px)');
    const [expanded, { toggle: toggleExpanded }] = useBoolean(!defaultCollapsed);
    const [height, setHeight] = useState<number>();

    const fileName = modified?.name ?? original?.name;
    const isRename = original && modified && original.name !== modified.name;

    // Monaco doesn't like it if two files have the same URI, so stick a unique
    // prefix on each file name.
    const id = useId();
    const originalModelPath = original ? `${id}/original/${original.name}` : undefined;
    const modifiedModelPath = modified ? `${id}/modified/${modified.name}` : undefined;

    const theme = useTheme();
    const classNames = getClassNames(getStyles, theme);

    const expandIconProps = useMemo<IIconProps>(
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

    const options = useMemo(
        () => ({
            ...baseOptions,
            renderSideBySide,
            ariaLabel: `Changes for file ${fileName}`,
        }),
        [renderSideBySide],
    );

    const handleEditorDidMount: DiffOnMount = useCallback(
        (editor) => {
            const originalHeight = editor.getOriginalEditor().getScrollHeight();
            const modifiedHeight = editor.getModifiedEditor().getScrollHeight();

            setHeight(Math.min(MAX_EDITOR_HEIGHT, Math.max(originalHeight, modifiedHeight)));
        },
        [setHeight],
    );

    const resetChange = useCallback(() => {
        console.log('reset change');
    }, [original, modified]);

    const confirmReset = useConfirmPrompt(resetChange);

    return (
        <div className={classNames.root}>
            <Stack horizontal verticalAlign="center" className={classNames.header} tokens={{ childrenGap: 10 }}>
                <IconButton
                    title="Toggle file expanded"
                    className={classNames.expandButton}
                    iconProps={expandIconProps}
                    onClick={toggleExpanded}
                />
                {isRename && <span className={classNames.fileName + ' ' + classNames.rename}>{original?.name}</span>}
                <Link className={classNames.fileName}>{fileName}</Link>
                <CommandButton
                    text="Reset changes"
                    className={classNames.resetButton}
                    iconProps={{ iconName: 'Delete' }}
                    onClick={confirmReset.show}
                />
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
            <ConfirmPrompt
                title={`Reset ${fileName}?`}
                message="Are you sure you want to revert the changes to this file? This cannot be undone."
                confirmText="Reset"
                {...confirmReset.props}
            />
        </div>
    );
};
