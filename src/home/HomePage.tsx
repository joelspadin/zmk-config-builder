import { Link, mergeStyleSets, Stack } from '@fluentui/react';
import React from 'react';
import { useAuth } from '../AuthProvider';
import { ExtLink } from '../ExtLink';
import { LoginSection } from '../login/LoginSection';
import { PrivacyNotice } from '../login/PrivacyNotice';
import { Notice } from '../Notice';
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
                    This application helps you create and edit a personal GitHub repository for{' '}
                    <ExtLink href="https://zmk.dev">ZMK Firmware</ExtLink>.
                </p>
                <p>
                    This is your own sandbox where you can change keymaps and keyboard settings and even add support for
                    new keyboards. Every time you push a change to GitHub, it will automatically build the firmware for
                    you.
                </p>
                <p>Sign in with GitHub, then use the links in the menu to edit your repo:</p>
                <ul>
                    <li>
                        <Link href="/repo">
                            <strong>Repo:</strong>
                        </Link>{' '}
                        choose the repo to edit, or create a new one.
                    </li>
                    <li>
                        <Link href="/sources">
                            <strong>Sources:</strong>
                        </Link>{' '}
                        choose the version of ZMK used to build firmware.
                    </li>
                    <li>
                        <Link href="/boards">
                            <strong>Keyboards:</strong>
                        </Link>{' '}
                        customize keymaps and keyboard settings; add new keyboards from a template.
                    </li>
                    <li>
                        <Link href="/builds">
                            <strong>Builds:</strong>
                        </Link>{' '}
                        choose which firmware GitHub will build.
                    </li>
                    <li>
                        <Link href="/commit">
                            <strong>Commit:</strong>
                        </Link>{' '}
                        view your changes, commit them to the repo, and push them to GitHub.
                    </li>
                </ul>

                <Notice>
                    This app makes changes to a local copy of the repo which is stored in your browser.{' '}
                    <strong>Your changes will not show up immediately on GitHub.</strong> Once you have made the changes
                    you want, use the <Link href="/commit">commit page</Link> to save them and push them to GitHub.
                </Notice>
            </Section>

            {!auth.isAuthenticated && <LoginSection />}

            <PrivacyNotice />
        </Stack>
    );
};
