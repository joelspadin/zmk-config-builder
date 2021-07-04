import React from 'react';
import { PageTitle } from '../PageTitle';

export const OAuthCallbackPage: React.FunctionComponent = () => {
    return (
        <>
            <PageTitle>Logged in</PageTitle>
            <p>You may close this window if it does not close automatically.</p>
        </>
    );
};
