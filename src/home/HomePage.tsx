import { mergeStyleSets, Stack } from '@fluentui/react';
import React from 'react';
import { Alert } from '../Alert';
import { ExternalLink } from '../ExternalLink';
import { useAuth } from '../git/GitRemoteProvider';
import { InternalLink } from '../InternalLink';
import { LoginSection } from '../login/LoginSection';
import { PrivacyNotice } from '../login/PrivacyNotice';
import { PageTitle } from '../PageTitle';
import { Section } from '../Section';

const classNames = mergeStyleSets({
    root: {
        'ul:last-child': {
            marginBottom: 0,
        },
    },
});

export const HomePage: React.FunctionComponent = () => {
    const auth = useAuth();

    return (
        <Stack className={classNames.root}>
            <PageTitle>ZMK Config Builder</PageTitle>
            <Section>
                <p>
                    This application helps you create and edit a personal Git repository for{' '}
                    <ExternalLink href="https://zmk.dev">ZMK Firmware</ExternalLink>.
                </p>
                <p>
                    This is your own sandbox where you can change keymaps and keyboard settings and even add support for
                    new keyboards. Every time you push a change to GitHub, it will automatically build the firmware for
                    you.
                </p>
                <p>Sign in with GitHub, then use the links in the menu to edit your repo:</p>
                <ul>
                    <li>
                        <InternalLink href="/repo">
                            <strong>Repo:</strong>
                        </InternalLink>{' '}
                        choose the repo to edit, or create a new one.
                    </li>
                    <li>
                        <InternalLink href="/sources">
                            <strong>Sources:</strong>
                        </InternalLink>{' '}
                        choose the version of ZMK used to build firmware.
                    </li>
                    <li>
                        <InternalLink href="/boards">
                            <strong>Keyboards:</strong>
                        </InternalLink>{' '}
                        customize keymaps and keyboard settings; add new keyboards from a template.
                    </li>
                    <li>
                        <InternalLink href="/builds">
                            <strong>Builds:</strong>
                        </InternalLink>{' '}
                        choose which firmware GitHub will build.
                    </li>
                    <li>
                        <InternalLink href="/files">
                            <strong>Files:</strong>
                        </InternalLink>{' '}
                        view and manually edit the files in the repo.
                    </li>
                    <li>
                        <InternalLink href="/commit">
                            <strong>Commit:</strong>
                        </InternalLink>{' '}
                        view your changes, commit them to the repo, and push them to GitHub.
                    </li>
                </ul>

                <Alert>
                    This app makes changes to a local copy of the repo which is stored in your browser.{' '}
                    <strong>Your changes will not show up immediately on GitHub.</strong> Once you have made the changes
                    you want, use the <InternalLink href="/commit">commit page</InternalLink> to save them and push them
                    to GitHub.
                </Alert>
            </Section>

            {!auth.isAuthenticating && !auth.isAuthenticated && <LoginSection />}

            <PrivacyNotice />
        </Stack>
    );
};
