import { ITextFieldStyles, mergeStyleSets, PrimaryButton, Stack, Text, TextField } from '@fluentui/react';
import React from 'react';
import { Section } from '../Section';
import { FileChangeCard } from './FileChangeCard';
import { addConfigFile, buildMatrixFile, deleteConfigFile, renameConfigFile } from './mockFiles';

const classNames = mergeStyleSets({
    message: {},
    actions: {
        marginTop: 28,
    },
});

const textFieldStyles: Partial<ITextFieldStyles> = {
    field: {
        fontFamily: "source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace",
        height: 80,
    },
};

export const ChangesPage: React.FunctionComponent = () => {
    return (
        <>
            <Section>
                <p>
                    Check below for a list of staged changes. Once you&apos;re happy with them, write a short
                    description of the changes and click &ldquo;Commit and push&rdquo; to save them as a commit and push
                    the commit to GitHub.
                </p>
                <TextField
                    label="Commit message"
                    multiline
                    autoAdjustHeight
                    styles={textFieldStyles}
                    className={classNames.message}
                />
                <Stack horizontal className={classNames.actions}>
                    <PrimaryButton text="Commit and push" />
                </Stack>
            </Section>

            <Text block as="h2" variant="xLarge">
                Staged changes
            </Text>

            <Stack>
                <FileChangeCard {...addConfigFile} />
                <FileChangeCard {...deleteConfigFile} />
                <FileChangeCard {...renameConfigFile} />
                <FileChangeCard {...buildMatrixFile} />
            </Stack>
        </>
    );
};
