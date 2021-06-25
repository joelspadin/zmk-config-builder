import { IconButton, Stack, StackItem, Theme } from '@fluentui/react';
import React from 'react';

export interface IFileEditCellProps {
    path?: string;
    className?: string;
    theme?: Theme;
}

export const FileEditCell: React.FunctionComponent<IFileEditCellProps> = ({ path, className, theme }) => {
    if (!path) {
        return null;
    }

    return (
        <Stack horizontal verticalAlign="center" className={className} theme={theme}>
            <StackItem grow>{path}</StackItem>
            <StackItem>
                <IconButton iconProps={{ iconName: 'Edit' }} />
            </StackItem>
        </Stack>
    );
};
