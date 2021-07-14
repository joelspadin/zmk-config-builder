import { DefaultButton, IButtonStyles, useTheme } from '@fluentui/react';
import React, { useMemo } from 'react';
import { RepoId } from '../git/IGitRemote';

export interface IGitHubDesktopBadge {
    repo?: RepoId;
}

export const GitHubDesktopBadge: React.FunctionComponent<IGitHubDesktopBadge> = ({ repo }) => {
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
                // Icon isn't vertically centered for some reason
                svg: {
                    transform: 'translateY(-2px)',
                },
            },
        }),
        [theme],
    );

    if (!repo || repo.type !== 'github') {
        return null;
    }

    const href = `x-github-client://openRepo/https://github.com/${repo.owner}/${repo.name}/`;

    return (
        <DefaultButton
            href={href}
            text="Open in GitHub Desktop"
            iconProps={{ iconName: 'GitHubDesktop' }}
            styles={buttonStyles}
        />
    );
};
