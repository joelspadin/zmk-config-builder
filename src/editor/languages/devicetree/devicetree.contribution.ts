import { registerLanguage } from '../register';
import { conf, language } from './devicetree';

registerLanguage(
    {
        id: 'devicetree',
        aliases: ['Devicetree', 'dts'],
        extensions: ['.dts', '.dtsi', '.keymap', '.overlay'],
    },
    conf,
    language,
);
