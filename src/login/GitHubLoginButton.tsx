import { DefaultButton, IButtonStyles, Spinner } from '@fluentui/react';
import { oauthAuthorizationUrl } from '@octokit/oauth-authorization-url';
import React, { useState } from 'react';
import { GITHUB_CLIENT_ID, GITHUB_OAUTH_CLIENT, GITHUB_SCOPES } from '../env';
import { useAuth } from '../git/GitApiProvider';
import { getDefaultPopupFeatures } from './popup';

// Icon isn't vertically centered for some reason.
const styles: Partial<IButtonStyles> = {
    icon: {
        svg: {
            transform: 'translateY(-2px)',
        },
    },
};

enum State {
    Default,
    PopupOpen,
    Authenticating,
}

export const GitHubLoginButton: React.FunctionComponent = () => {
    const auth = useAuth();
    const [state, setState] = useState(State.Default);

    const signIn = async () => {
        const popup = new AuthPopupWindow();
        setState(State.PopupOpen);

        try {
            const params = await popup.result();
            setState(State.Authenticating);

            const token = await getAccessToken(params);
            auth.signIn({
                type: 'github',
                token,
            });

            setState(State.Default);
        } catch (error) {
            setState(State.Default);
            // TODO: show an error popup
            console.error(error);
        }
    };

    return (
        <>
            <DefaultButton
                text="Sign in with GitHub"
                iconProps={{ iconName: 'GitHub' }}
                styles={styles}
                disabled={state !== State.Default}
                onClick={signIn}
            />
            {state === State.Authenticating && <Spinner label="Authenticating..." />}
        </>
    );
};

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

class AuthPopupWindow {
    private window: Window | null = null;
    private interval?: number;
    private promise?: Promise<AuthParams>;
    private url: string;

    constructor() {
        const { url } = oauthAuthorizationUrl({
            clientId: GITHUB_CLIENT_ID,
            scopes: GITHUB_SCOPES,
        });

        this.url = url;
    }

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
            this.window?.clearInterval(this.interval);
            this.interval = undefined;
        }
    }
}
