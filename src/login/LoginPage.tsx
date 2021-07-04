import { Stack } from '@fluentui/react';
import React from 'react';
import { Redirect, useLocation } from 'react-router-dom';
import { useGit } from '../git/GitApiProvider';
import { PageTitle } from '../PageTitle';
import { LoginSection } from './LoginSection';
import { PrivacyNotice } from './PrivacyNotice';

export const LoginPage: React.FunctionComponent = () => {
    const git = useGit();
    const location = useLocation();
    const query = new URLSearchParams(location.search);

    if (git.isAuthenticated) {
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
