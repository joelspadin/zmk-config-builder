import { Stack } from '@fluentui/react';
import React from 'react';
import { ExtLink } from '../ExtLink';
import { PageTitle } from '../PageTitle';
import { Section, SectionHeader } from '../Section';
import { UnsavedChangesPrompt } from '../UnsavedChangesPrompt';
import { BuildMatrix } from './BuildMatrix';

export const BuildsPage: React.FunctionComponent = () => {
    // TODO
    const hasChanges = false;

    // TODO
    const actionsUrl = 'https://github.com/joelspadin/zmk-config/actions';

    // TODO: warn and point to repo page if no repo selected.

    return (
        <>
            <UnsavedChangesPrompt hasChanges={hasChanges} />
            <Stack>
                <PageTitle>Builds</PageTitle>

                <Section>
                    <SectionHeader>GitHub build matrix</SectionHeader>
                    <p>
                        GitHub will build firmware for each item in the matrix. Check your repo&apos;s{' '}
                        <ExtLink href={actionsUrl}>Actions tab</ExtLink> for the results.
                    </p>
                    <BuildMatrix />
                </Section>

                {/* <Stack horizontal>
                    <PrimaryButton text="Save changes" disabled={!hasChanges} />
                </Stack> */}
            </Stack>
        </>
    );
};
