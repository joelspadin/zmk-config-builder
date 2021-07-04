import type { languages } from 'monaco-editor';

export const conf: languages.LanguageConfiguration = {
    comments: {
        lineComment: '#',
    },
    brackets: [
        ['(', ')'],
        ['[', ']'],
    ],
    autoClosingPairs: [
        { open: '(', close: ')' },
        { open: '[', close: ']' },
        { open: "'", close: "'", notIn: ['string', 'comment'] },
        { open: '"', close: '"', notIn: ['string'] },
    ],
    surroundingPairs: [
        { open: '(', close: ')' },
        { open: '[', close: ']' },
        { open: "'", close: "'" },
        { open: '"', close: '"' },
    ],
};

export const language = <languages.IMonarchLanguage>{
    brackets: [
        { token: 'delimiter.parenthesis', open: '(', close: ')' },
        { token: 'delimiter.square', open: '[', close: ']' },
    ],

    keywords: [
        'comment',
        'config',
        'default',
        'select',
        'def_bool',
        'def_hex',
        'def_int',
        'def_string',
        'def_tristate',
        'range',
        'imply',
        'optional',
        'prompt',
        'mainmenu',
        'menu',
        'menuconfig',
        'endmenu',
        'choice',
        'endchoice',
        'if',
        'endif',
        'option',
        'source',
        'osource',
        'rsource',
        'orsource',
    ],

    typeKeywords: ['bool', 'hex', 'int', 'string', 'tristate'],

    constants: ['n', 'm', 'y'],

    operators: ['-', '!', '&&', '||', '=', '!=', '<', '>', '<=', '>='],

    // we include these common regular expressions
    symbols: /[=><!~?:&|+\-*/^%]+/,
    escapes: /\\(?:[a-z\\"'])/,

    tokenizer: {
        root: [
            // identifiers and keywords
            { include: '@help' },

            [/\bdepends on\b/, 'keyword'],
            [/\bvisible if\b/, 'keyword'],
            [
                /\b[a-z_][a-z_-]*\b/,
                {
                    cases: {
                        '@typeKeywords': 'type',
                        '@keywords': 'keyword',
                        '@constants': 'constant',
                        '@default': 'identifier',
                    },
                },
            ],
            [/\b[A-Z_]+\b/, 'type.identifier'],

            // whitespace
            { include: '@whitespace' },

            // delimiters and operators
            [/[()[\]]/, '@brackets'],
            [/@symbols/, { cases: { '@operators': 'operator', '@default': '' } }],

            // numbers
            [/0[xX][0-9a-fA-F]+/, 'number.hex'],
            [/\d+/, 'number'],

            // strings
            [/"([^"\\]|\\.)*$/, 'string.invalid'], // non-teminated string
            [/"/, { token: 'string.quote', bracket: '@open', next: '@dblstring' }],

            [/'([^'\\]|\\.)*$/, 'string.invalid'], // non-teminated string
            [/'/, { token: 'string.quote', bracket: '@open', next: '@string' }],
        ],

        help: [[/^\s+help\s*$/, 'keyword', '@helpTextFirstLine']],

        helpTextFirstLine: [
            [/^(\s+).+$/, 'string', '@helpTextContinued.$1'],
            [/./, '@rematch', '@popall'],
        ],

        helpTextContinued: [
            [
                /^(\s*).+$/,
                {
                    cases: {
                        '$1==$S2': 'string',
                        '@default': { token: '@rematch', next: '@popall' },
                    },
                },
            ],
        ],

        dblstring: [
            [/\$\(/, { token: 'variable.name', bracket: '@open', next: '@variable' }],
            [/[^\\"]+/, 'string'],
            [/@escapes/, 'string.escape'],
            [/\\./, 'string.escape.invalid'],
            [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }],
        ],

        string: [
            [/\$\(/, { token: 'variable.name', bracket: '@open', next: '@variable' }],
            [/[^\\']+/, 'string'],
            [/@escapes/, 'string.escape'],
            [/\\./, 'string.escape.invalid'],
            [/'/, { token: 'string.quote', bracket: '@close', next: '@pop' }],
        ],

        variable: [
            [/[^)]+/, 'variable.name'],
            [/\)/, { token: 'variable.name', bracket: '@close', next: '@pop' }],
        ],

        whitespace: [
            [/[ \t\r\n]+/, 'white'],
            [/(^#.*$)/, 'comment'],
        ],
    },
};