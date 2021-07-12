import { Stack } from '@fluentui/react';
import React from 'react';
import { Redirect, useLocation } from 'react-router-dom';
import { useGitRemote } from '../git/GitRemoteProvider';
import { PageTitle } from '../PageTitle';
import { LoginSection } from './LoginSection';
import { PrivacyNotice } from './PrivacyNotice';

export const LoginPage: React.FunctionComponent = () => {
    const remote = useGitRemote();
    const location = useLocation();
    const query = new URLSearchParams(location.search);

    if (remote.isAuthenticated) {
        return <Redirect to={query.get('from') ?? '/'} />;
    }

    return (
        <Stack>
            <PageTitle>Sign in</PageTitle>
            <LoginSection />
            <PrivacyNotice />
        </Stack>
    );
};
