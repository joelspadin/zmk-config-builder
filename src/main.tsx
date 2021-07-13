import { initializeIcons, mergeStyles, registerIcons } from '@fluentui/react';
import { MarkGithubIcon } from '@primer/octicons-react';
import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './App';
import './index.css';
import './polyfills.js';

registerIcons({
    icons: {
        GitHub: <MarkGithubIcon />,
    },
});

initializeIcons();

mergeStyles({
    ':global(body,html,#root)': {
        margin: 0,
        padding: 0,
        height: '100vh',
    },
});

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById('root'),
);
