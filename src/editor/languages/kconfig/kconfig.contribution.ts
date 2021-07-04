import { registerLanguage } from '../register';
import { conf, language } from './kconfig';

registerLanguage(
    {
        id: 'kconfig',
        filenames: ['Kconfig'],
        filenamePatterns: ['Kconfig.*'],
    },
    conf,
    language,
);
