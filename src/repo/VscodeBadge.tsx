import { DefaultButton, IButtonStyles, useTheme } from '@fluentui/react';
import React, { useMemo } from 'react';
import { RepoId } from '../git/IGitRemote';

export interface IVscodeBadgeProps {
    repo?: RepoId;
}

export const VscodeBadge: React.FunctionComponent<IVscodeBadgeProps> = ({ repo }) => {
    const theme = useTheme();
    const buttonStyles = useMemo<IButtonStyles>(
        () => ({
            root: {
                paddingInlineStart: 8,
            },
            label: {
                color: theme.semanticColors.bodyText,
            },
            icon: {
                width: 16,
                height: 16,
                img: {
                    width: '100%',
                    height: '100%',
                },
            },
        }),
        [theme],
    );

    if (!repo || repo.type !== 'github') {
        return null;
    }

    const href = `https://open.vscode.dev/${repo.owner}/${repo.name}`;

    return (
        <DefaultButton
            href={href}
            target="_blank"
            rel="noreferrer"
            text="Open in Visual Studio Code"
            iconProps={{ iconName: 'vscode' }}
            styles={buttonStyles}
        />
    );
};
