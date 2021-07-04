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
                <NotImplemented />
            </Section>
        </Stack>
    );
};
