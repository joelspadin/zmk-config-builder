import { initializeIcons, registerIcons } from '@fluentui/react';
import { DesktopDownloadIcon, MarkGithubIcon } from '@primer/octicons-react';
import React from 'react';
import vscode from './icons/vscode.svg';

registerIcons({
    icons: {
        GitHub: <MarkGithubIcon />,
        GitHubDesktop: <DesktopDownloadIcon />,
        vscode: <img src={vscode} />,
    },
});

initializeIcons();
