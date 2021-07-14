import { Stack } from '@fluentui/react';
import React from 'react';
import { PageTitle } from '../PageTitle';
import { Section, SectionHeader } from '../Section';
import { ModulesForm } from './ModulesForm';
import { RemotesForm } from './RemotesForm';
import { ZmkSourceForm } from './ZmkSourceForm';

export const SourcesPage: React.FunctionComponent = () => {
    // TODO: warn and point to repo page if no repo selected.

    return (
        <>
            <Stack>
                <PageTitle>Sources</PageTitle>

                <Section>
                    <SectionHeader>Remotes</SectionHeader>
                    <p>Add repositories to use for ZMK and modules below.</p>
                    <RemotesForm />
                </Section>

                <Section>
                    <SectionHeader>ZMK</SectionHeader>
                    <p>
                        Choose the version of ZMK used to build firmware. You can select a fork or pull request to use
                        in progress boards, shields, and features.
                    </p>
                    <ZmkSourceForm />
                </Section>

                <Section>
                    <SectionHeader>Modules</SectionHeader>
                    <p>Include boards, shields, and features from other repositories.</p>
                    <ModulesForm />
                </Section>
            </Stack>
        </>
    );
};
