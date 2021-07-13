import cdn from '@vitejs/plugin-cdn';
import reactRefresh from '@vitejs/plugin-react-refresh';
import * as rollup from 'rollup';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
    const plugins = [reactRefresh()];
    const rollupPlugins: rollup.Plugin[] = [];

    switch (command) {
        case 'build':
            rollupPlugins.push(nodePolyfills());
            break;

        case 'serve':
            plugins.push(
                // Polyfilling node builtins doesn't work when serving, so
                // load the browser versions of these modules from a CDN.
                cdn('skypack', {
                    '@octokit/rest': '^18.6.6',
                    'isomorphic-git': '^1.8.3',
                }),
            );
            break;
    }

    return {
        plugins,
        build: {
            rollupOptions: {
                plugins: rollupPlugins,
            },
        },
    };
});
