import { useMonaco } from '@monaco-editor/react';
import { useEffect } from 'react';
import './conf/conf.contribution';
import './devicetree/devicetree.contribution';
import { loadLanguages } from './register';

export { loadLanguages } from './register';

export function useMonacoLanguages() {
    const monaco = useMonaco();

    useEffect(() => {
        if (monaco) {
            loadLanguages(monaco);
        }
    }, [monaco]);
}
