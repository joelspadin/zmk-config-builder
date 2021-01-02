import { Button } from '@material-ui/core';
import React from 'react';
import { useAccessToken } from './AuthProvider';

export interface SignOutButtonProps {}

const SignOutButton: React.FunctionComponent<SignOutButtonProps> = () => {
    const [, , removeToken] = useAccessToken();

    function handleSignOut() {
        removeToken();
    }

    return <Button onClick={handleSignOut}>Sign out</Button>;
};

export default SignOutButton;
