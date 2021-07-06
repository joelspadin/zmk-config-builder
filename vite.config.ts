import cdn from '@vitejs/plugin-cdn';
import reactRefresh from '@vitejs/plugin-react-refresh';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        reactRefresh(),
        // Vite really doesn't like any way of polyfilling node builtins, so
        // load the browser versions of these modules from a CDN.
        cdn('skypack', {
            '@octokit/rest': '^18.6.6',
            'isomorphic-git': '^1.8.3',
        }),
    ],
});
