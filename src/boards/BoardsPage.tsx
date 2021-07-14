import { Stack } from '@fluentui/react';
import React from 'react';
import { NotImplemented } from '../NotImplemented';
import { PageTitle } from '../PageTitle';
import { Section, SectionHeader } from '../Section';
import { KeymapsForm } from './KeymapsForm';

export const BoardsPage: React.FunctionComponent = () => {
    // TODO: warn and point to repo page if no repo selected.

    return (
        <>
            <Stack>
                <PageTitle>Keyboards</PageTitle>

                <Section>
                    <SectionHeader>Keymaps and configuration</SectionHeader>
                    <p>This shows the keymaps and keyboard configuration files in your repo. Click one to edit it.</p>
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
            </Stack>
        </>
    );
};
