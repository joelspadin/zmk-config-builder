import { mergeStyleSets, Text } from '@fluentui/react';
import React from 'react';
import { Section } from '../Section';
import { LoginButton } from './LoginButton';

const classNames = mergeStyleSets({
    actions: {
        marginTop: 20,
        marginBottom: 20,
    },
});

export const LoginSection: React.FunctionComponent = () => {
    return (
        <Section>
            <p>Please sign in to GitHub so this app can modify your repo.</p>
            <div className={classNames.actions}>
                <LoginButton />
            </div>
            <Text block as="h3" variant="large">
                A note on permissions
            </Text>
            <p>
                Unfortunately, GitHub does not allow restricting GitHub OAuth apps to specific repos, so this app needs
                full access to your repos to create and modify your personal ZMK config repo. It also needs permissions
                for GitHub workflows to change which firmware GitHub builds for you.
            </p>
            <p>
                This does <em>not</em> give permissions to delete any repos.
            </p>
            <p>
                This app will only make changes to your data on GitHub when you request it to. It can make the following
                changes:
            </p>
            <ul>
                <li>Create new repos.</li>
                <li>Create new commits on the repo and branch you have selected.</li>
            </ul>
        </Section>
    );
};
