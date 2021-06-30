import { registerLanguage } from '../register';
import { conf, language } from './conf';

registerLanguage(
    {
        id: 'conf',
        extensions: ['.conf'],
        filenamePatterns: ['*_defconfig'],
    },
    conf,
    language,
);
