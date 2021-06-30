import * as monaco from 'monaco-editor';

type Monaco = typeof monaco;

export interface LanguageInfo {
    conf?: monaco.languages.LanguageConfiguration;
    language?: monaco.languages.IMonarchLanguage;
}

export type LanguageDefinition = monaco.languages.IMonarchLanguage | PromiseLike<monaco.languages.IMonarchLanguage>;

interface RegisteredLanguage {
    extensionPoint: monaco.languages.ILanguageExtensionPoint;
    configuration: monaco.languages.LanguageConfiguration;
    languageDef: LanguageDefinition;
}

let languagesToRegister: RegisteredLanguage[] = [];

export function registerLanguage(
    extensionPoint: monaco.languages.ILanguageExtensionPoint,
    configuration: monaco.languages.LanguageConfiguration,
    languageDef: LanguageDefinition,
) {
    languagesToRegister.push({ extensionPoint, configuration, languageDef });
}

export function loadLanguages(monaco: Monaco) {
    for (const { extensionPoint, configuration, languageDef } of languagesToRegister) {
        const { id: languageId } = extensionPoint;
        monaco.languages.register(extensionPoint);

        // TODO: why doesn't lazy loading with languages.onLanguage() work?
        monaco.languages.setLanguageConfiguration(languageId, configuration);
        monaco.languages.setMonarchTokensProvider(languageId, languageDef);
    }

    languagesToRegister = [];
}
