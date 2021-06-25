import { Stack } from '@fluentui/react';
import React from 'react';
import { NotImplemented } from '../NotImplemented';
import { PageTitle } from '../PageTitle';
import { Section, SectionHeader } from '../Section';
import { UnsavedChangesPrompt } from '../UnsavedChangesPrompt';
import { KeymapsForm } from './KeymapsForm';

export const BoardsPage: React.FunctionComponent = () => {
    // TODO
    const hasChanges = false;

    // TODO: warn and point to repo page if no repo selected.

    return (
        <>
            <UnsavedChangesPrompt hasChanges={hasChanges} />
            <Stack>
                <PageTitle>Keyboards</PageTitle>

                <Section>
                    <SectionHeader>Keymaps and configuration</SectionHeader>
                    <KeymapsForm />
                </Section>

                <Section>
                    <SectionHeader>Custom shields</SectionHeader>
                    <NotImplemented />
                </Section>

                <Section>
                    <SectionHeader>Custom boards</SectionHeader>
                    <NotImplemented />
                </Section>

                {/* <Stack horizontal>
                    <PrimaryButton text="Save changes" disabled={!hasChanges} />
                </Stack> */}
            </Stack>
        </>
    );
};
