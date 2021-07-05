import React from 'react';
import { ExternalLink } from '../ExternalLink';
import { Section, SectionHeader } from '../Section';

export const PrivacyNotice: React.FunctionComponent = () => (
    <Section>
        <SectionHeader>Privacy statement</SectionHeader>
        <p>
            ZMK Config Builder does not send your personal information to anyone except as necessary to sign in with
            GitHub and modify your source code stored there. See{' '}
            <ExternalLink href="https://docs.github.com/en/github/site-policy/github-privacy-statement">
                GitHub&apos;s privacy statement
            </ExternalLink>{' '}
            for more information.
        </p>
        <p>
            This app communicates only with GitHub, an{' '}
            <ExternalLink href="https://github.com/joelspadin/github-oauth-client">external server</ExternalLink> needed
            to authenticate with GitHub when signing in, and a{' '}
            <ExternalLink href="https://github.com/isomorphic-git/cors-proxy">proxy server</ExternalLink> needed because
            GitHub doesn&apos;t support CORS. These servers only relay data between your browser and GitHub. They do not
            retain it.
        </p>
        <p>TL;DR: we don&apos;t collect your data. GitHub does (it wouldn&apos;t be very useful if it didn&apos;t).</p>
    </Section>
);
