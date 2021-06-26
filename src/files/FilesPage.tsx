import { Stack } from '@fluentui/react';
import React from 'react';
import { NotImplemented } from '../NotImplemented';
import { PageTitle } from '../PageTitle';
import { Section } from '../Section';

export const FilesPage: React.FunctionComponent = () => {
    return (
        <Stack>
            <PageTitle>File explorer</PageTitle>
            <Section>
                <p>Here you will be able to manually edit the files in your repo.</p>
                <NotImplemented />
            </Section>
        </Stack>
    );
};
