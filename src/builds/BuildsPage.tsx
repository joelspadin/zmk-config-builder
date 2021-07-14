import { Link, Stack } from '@fluentui/react';
import React from 'react';
import { ExternalLink } from '../ExternalLink';
import { PageTitle } from '../PageTitle';
import { Section, SectionHeader } from '../Section';
import { BuildMatrix } from './BuildMatrix';
import { RecentBuildsList } from './RecentBuildsList';

export const BuildsPage: React.FunctionComponent = () => {
    // TODO
    const actionsUrl = 'https://github.com/joelspadin/zmk-config/actions';

    // TODO: warn and point to repo page if no repo selected.

    return (
        <>
            <Stack>
                <PageTitle>Builds</PageTitle>

                <Section>
                    <SectionHeader>GitHub build matrix</SectionHeader>
                    <p>
                        GitHub will build a firmware file for each row in this list. After{' '}
                        <Link href="/commit">committing your changes</Link>, check your repo&apos;s{' '}
                        <ExternalLink href={actionsUrl}>Actions tab</ExternalLink> for the results.
                    </p>
                    <BuildMatrix />
                </Section>

                <Section>
                    <SectionHeader>Recent builds</SectionHeader>
                    <RecentBuildsList />
                </Section>
            </Stack>
        </>
    );
};
