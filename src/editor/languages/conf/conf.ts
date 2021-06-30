// Based on the INI language from https://github.com/microsoft/monaco-languages
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
        lineComment: '#',
    },
    autoClosingPairs: [
        { open: '"', close: '"' },
        { open: "'", close: "'" },
    ],
    surroundingPairs: [
        { open: '"', close: '"' },
        { open: "'", close: "'" },
    ],
};

export const language: languages.IMonarchLanguage = {
    defaultToken: '',
    tokenPostfix: '.ini',

    // we include these common regular expressions
    escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

    // The main tokenizer for our languages
    tokenizer: {
        root: [
            // keys
            [/(^\w+)(\s*)(=)/, ['key', '', 'delimiter']],

            // whitespace
            { include: '@whitespace' },

            // numbers
            [/\d+/, 'number'],

            // boolean
            [/\b(y|n)\b/, 'keyword'],

            // strings: recover on non-terminated strings
            [/"([^"\\]|\\.)*$/, 'string.invalid'], // non-teminated string
            [/'([^'\\]|\\.)*$/, 'string.invalid'], // non-teminated string
            [/"/, 'string', '@string."'],
            [/'/, 'string', "@string.'"],
        ],

        whitespace: [
            [/[ \t\r\n]+/, ''],
            [/^\s*[#;].*$/, 'comment'],
        ],

        string: [
            [/[^\\"']+/, 'string'],
            [/@escapes/, 'string.escape'],
            [/\\./, 'string.escape.invalid'],
            [
                /["']/,
                {
                    cases: {
                        '$#==$S2': { token: 'string', next: '@pop' },
                        '@default': 'string',
                    },
                },
            ],
        ],
    },
};
