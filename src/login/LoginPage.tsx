import { Stack } from '@fluentui/react';
import React from 'react';
import { Redirect, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthProvider';
import { PageTitle } from '../PageTitle';
import { LoginSection } from './LoginSection';
import { PrivacyNotice } from './PrivacyNotice';

export const LoginPage: React.FunctionComponent = () => {
    const auth = useAuth();
    const location = useLocation();
    const query = new URLSearchParams(location.search);

    if (auth.isAuthenticated) {
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
