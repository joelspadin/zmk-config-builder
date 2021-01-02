import { Button, CircularProgress } from '@material-ui/core';
import GitHubIcon from '@material-ui/icons/GitHub';
import { oauthAuthorizationUrl } from '@octokit/oauth-authorization-url';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';
import { GITHUB_CLIENT_ID, GITHUB_OAUTH_CLIENT, GITHUB_SCOPES } from '../config';
import { getDefaultPopupFeatures } from '../util';
import { useAccessToken } from './AuthProvider';

export interface SignInButtonProps {
    className?: string;
}

enum State {
    Default,
    PopupOpen,
    Authenticating,
}

const SignInButton: React.FunctionComponent<SignInButtonProps> = (props) => {
    const [state, setState] = useState(State.Default);
    const [, setToken] = useAccessToken();
    const { enqueueSnackbar } = useSnackbar();

    async function handleSignIn() {
        const { url } = oauthAuthorizationUrl({
            clientId: GITHUB_CLIENT_ID,
            scopes: GITHUB_SCOPES,
        });

        const popup = new PopupWindow(url);

        setState(State.PopupOpen);

        try {
            const params = await popup.result();
            setState(State.Authenticating);

            const token = await getAccessToken(params);
            setToken(token);
        } catch (error) {
            console.error(error);
            setState(State.Default);
            enqueueSnackbar(error.toString(), {
                variant: 'error',
                persist: true,
                anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'center',
                },
            });
        }
    }

    function getIcon() {
        if (state === State.Default) {
            return <GitHubIcon />;
        } else {
            return <CircularProgress size={20} />;
        }
    }

    function getText() {
        switch (state) {
            case State.Default:
            case State.PopupOpen:
                return 'Sign in with GitHub';
            case State.Authenticating:
                return 'Authenticating...';
        }
    }

    return (
        <Button
            {...props}
            variant="contained"
            color="primary"
            startIcon={getIcon()}
            disabled={state !== State.Default}
            onClick={handleSignIn}
        >
            {getText()}
        </Button>
    );
};

export default SignInButton;

async function getAccessToken({ code, state }: AuthParams) {
    const params = new URLSearchParams({ code, state });
    const response = await fetch(`${GITHUB_OAUTH_CLIENT}/${GITHUB_CLIENT_ID}?${params.toString()}`);

    const json = await response.json();

    if (!response.ok) {
        const { message } = json;
        throw new Error(`(${response.status}) ${message || response.statusText}`);
    }

    const { token } = json;
    if (typeof token !== 'string') {
        throw new Error('Response from server did not include access token.');
    }

    return token;
}

interface AuthParams {
    code: string;
    state: string;
}

class PopupWindow {
    private window: Window | null = null;
    private interval?: number;
    private promise?: Promise<AuthParams>;

    constructor(private url: string) {}

    result(): Promise<AuthParams> {
        if (!this.promise) {
            this.promise = this.open();
        }

        return this.promise;
    }

    private close() {
        this.cancel();
        this.window?.close();
    }

    private open() {
        const features = getDefaultPopupFeatures(window, 600, 900);
        this.window = window.open(this.url, 'github-oauth-popup', features);

        return new Promise<AuthParams>((resolve, reject) => {
            this.interval = window.setInterval(() => {
                try {
                    const popup = this.window;

                    if (!popup || popup.closed) {
                        this.close();
                        reject(new Error('Sign in window was closed.'));
                        return;
                    }

                    if (popup.location.href === this.url || popup.location.pathname === 'blank') {
                        return;
                    }

                    const params = new URLSearchParams(popup.location.search);
                    resolve({
                        code: params.get('code') ?? '',
                        state: params.get('state') ?? '',
                    });

                    this.close();
                } catch (error) {
                    if (error instanceof DOMException) {
                        // Ignore DOMException: Blocked a frame with origin from accessing a cross-origin frame.
                    } else {
                        throw error;
                    }
                }
            }, 500);
        });
    }

    private cancel() {
        if (this.interval) {
            window.clearInterval(this.interval);
            this.interval = undefined;
        }
    }
}
