// Based on the C++ language from https://github.com/microsoft/monaco-languages
/*---------------------------------------------------------------------------------------------
 *  The MIT License (MIT)
 *
 *  Copyright (c) Microsoft Corporation
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in all
 *  copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *  SOFTWARE.
 *--------------------------------------------------------------------------------------------*/
import type { languages } from 'monaco-editor';

export const conf: languages.LanguageConfiguration = {
    comments: {
        lineComment: '//',
        blockComment: ['/*', '*/'],
    },
    brackets: [
        ['{', '}'],
        ['[', ']'],
        ['(', ')'],
    ],
    autoClosingPairs: [
        { open: '[', close: ']' },
        { open: '{', close: '}' },
        { open: '(', close: ')' },
        // TODO: auto closing <> requires adding a context for integer cells,
        // which requires adding a context for parenthetical expressions so that
        // < and > are operators inside expressions but brackets outside.
        // { open: '<', close: '>', notIn: ['expression'] },
        { open: "'", close: "'", notIn: ['string', 'comment'] },
        { open: '"', close: '"', notIn: ['string'] },
    ],
    surroundingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '<', close: '>' },
        { open: '"', close: '"' },
        { open: "'", close: "'" },
    ],
};

export const language = <languages.IMonarchLanguage>{
    defaultToken: '',

    brackets: [
        { token: 'delimiter.curly', open: '{', close: '}' },
        { token: 'delimiter.parenthesis', open: '(', close: ')' },
        { token: 'delimiter.square', open: '[', close: ']' },
        { token: 'delimiter.angle', open: '<', close: '>' },
    ],

    keywords: ['/bits/', '/delete-node/', '/delete-property/', '/dts-v1/', '/memreserve/'],

    operators: [
        '=',
        '>',
        '<',
        '!',
        '~',
        '?',
        ':',
        '==',
        '<=',
        '>=',
        '!=',
        '&&',
        '||',
        '+',
        '-',
        '*',
        '/',
        '&',
        '|',
        '^',
        '%',
        '<<',
        '>>',
    ],

    // we include these common regular expressions
    symbols: /[=><!~?:&|+\-*/^%]+/,
    escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
    integersuffix: /(ll|LL|u|U|l|L)?(ll|LL|u|U|l|L)?/,
    floatsuffix: /[fFlL]?/,

    // The main tokenizer for our languages
    tokenizer: {
        root: [
            // identifiers and keywords
            { include: '@identifiers' },

            // The preprocessor checks must be before whitespace as they check /^\s*#/ which
            // otherwise fails to match later after other whitespace has been removed.

            // Inclusion
            [/^\s*#\s*include/, { token: 'keyword.directive.include', next: '@include' }],

            // Preprocessor directive
            [/^\s*#\s*\w+/, 'keyword.directive'],

            // whitespace
            { include: '@whitespace' },

            // &phandle/label
            { include: '@label' },

            // Root node
            // [/\/\s*(?=\{)/, 'identifier'],

            { include: '@nodebegin' },

            { include: '@symbols' },
            { include: '@numbers' },

            // delimiter: after number because of .\d floats
            { include: '@delimiter' },

            { include: '@strings' },
        ],

        whitespace: [
            [/[ \t\r\n]+/, ''],
            [/\/\*/, 'comment', '@comment'],
            [/\/\/.*$/, 'comment'],
        ],

        comment: [
            [/[^/*]+/, 'comment'],
            [/\*\//, 'comment', '@pop'],
            [/[/*]/, 'comment'],
        ],

        strings: [
            // strings
            [/"([^"\\]|\\.)*$/, 'string.invalid'], // non-teminated string
            [/"/, 'string', '@string'],
        ],

        string: [
            [/[^\\"]+/, 'string'],
            [/@escapes/, 'string.escape'],
            [/\\./, 'string.escape.invalid'],
            [/"/, 'string', '@pop'],
        ],

        identifiers: [
            // Constants
            [/[A-Z_]+\b(?!\()/, 'constant'],
            // Root node
            [/(\/)(\s*)(?=\{)/, ['type', '']],
            // Node name
            [/([a-zA-Z_][\w,-]*)(\s*)(?=[{:])/, ['type', '']],
            // Node label
            [/(:)(\s*)(.+)(\s*)(?=\{)/, ['delimiter', '', 'variable.name', '']],
            // Other identifiers
            [
                /(\/)?[a-zA-Z_][\w,-]*\1/,
                {
                    cases: {
                        '@keywords': { token: 'keyword.$0' },
                        '/include/': { token: 'keyword.directive.include', next: '@include' },
                        '@default': 'identifier',
                    },
                },
            ],
        ],

        label: [[/&\w+/, 'variable']],

        symbols: [
            [/[()[\]]/, '@brackets'],
            [/[<>](?![=<>])/, '@brackets'],
            [
                /@symbols/,
                {
                    cases: {
                        '@operators': 'delimiter',
                        '@default': '',
                    },
                },
            ],
        ],

        numbers: [
            [/\d*\d+[eE]([-+]?\d+)?(@floatsuffix)/, 'number.float'],
            [/\d*\.\d+([eE][-+]?\d+)?(@floatsuffix)/, 'number.float'],
            [/0[xX][0-9a-fA-F']*[0-9a-fA-F](@integersuffix)/, 'number.hex'],
            [/0[0-7']*[0-7](@integersuffix)/, 'number.octal'],
            [/0[bB][0-1']*[0-1](@integersuffix)/, 'number.binary'],
            [/\d[\d']*\d(@integersuffix)/, 'number'],
            [/\d(@integersuffix)/, 'number'],
        ],

        delimiter: [[/[;,.]/, 'delimiter']],

        nodebegin: [[/\{/, { token: 'delimiter.curly', next: '@node' }]],

        node: [
            { include: '@identifiers' },
            [/#[\w,-]+/, 'identifier'],

            { include: '@whitespace' },

            { include: '@label' },

            { include: '@nodebegin' },
            [/\}/, { token: 'delimiter.curly', next: '@pop' }],

            { include: '@symbols' },
            { include: '@numbers' },

            // delimiter: after number because of .\d floats
            { include: '@delimiter' },
            { include: '@strings' },
        ],

        include: [
            [
                /(\s*)(<)([^<>]*)(>)/,
                [
                    '',
                    'keyword.directive.include.begin',
                    'string.include.identifier',
                    { token: 'keyword.directive.include.end', next: '@pop' },
                ],
            ],
            [
                /(\s*)(")([^"]*)(")/,
                [
                    '',
                    'keyword.directive.include.begin',
                    'string.include.identifier',
                    { token: 'keyword.directive.include.end', next: '@pop' },
                ],
            ],
        ],
    },
};
