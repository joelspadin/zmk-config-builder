import reactRefresh from '@vitejs/plugin-react-refresh';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [reactRefresh()],
    resolve: {
        alias: {
            buffer: 'buffer',
            'node-fetch': 'isomorphic-fetch',
            http: 'stream-http',
            https: 'https-browserify',
            process: 'process/browser',
            stream: 'stream-browserify',
            // https://github.com/nodejs/readable-stream/issues/348
            'readable-stream': 'vite-compatible-readable-stream',
            string_decoder: 'string_decoder',
            url: 'url',
            util: 'util',
        },
    },
});
