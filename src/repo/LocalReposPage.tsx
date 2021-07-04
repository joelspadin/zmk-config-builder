import React from 'react';
import { NotImplemented } from '../NotImplemented';
import { Section, SectionHeader } from '../Section';

export const LocalReposPage: React.FunctionComponent = () => {
    return (
        <Section>
            <SectionHeader>Local storage</SectionHeader>
            <p>
                The following repos have already been cloned and are being stored locally in your browser. You can
                select one for editing or delete them to free up space.
            </p>
            <NotImplemented />
        </Section>
    );
};
