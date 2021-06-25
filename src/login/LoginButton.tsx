import { DefaultButton, IButtonStyles } from '@fluentui/react';
import React from 'react';
import { useAuth } from '../AuthProvider';

// Icon isn't vertically centered for some reason.
const styles: Partial<IButtonStyles> = {
    icon: {
        svg: {
            transform: 'translateY(-2px)',
        },
    },
};

export const LoginButton: React.FunctionComponent = () => {
    // TODO: actually sign in
    const auth = useAuth();
    return (
        <DefaultButton
            text="Sign in with GitHub"
            iconProps={{ iconName: 'GitHub' }}
            styles={styles}
            onClick={() => {
                auth.setAccessToken('faketoken');
            }}
        />
    );
};
