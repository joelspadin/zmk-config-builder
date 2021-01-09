const CLIENT_ID_PROD = '97ece080324a50cfe1a4';
const CLIENT_ID_DEV = '1b6a37155cb37413d834';

export const CONFIG_BUILDER_REPO_URL = 'https://github.com/joelspadin/zmk-config-builder';

export const GITHUB_OAUTH_CLIENT = 'https://zmk-oauth-client.herokuapp.com';
export const GITHUB_CLIENT_ID = window.location.hostname === 'localhost' ? CLIENT_ID_DEV : CLIENT_ID_PROD;
export const GITHUB_SCOPES = ['repo', 'workflow'];

export const ZMK_OWNER = 'zmkfirmware';
export const ZMK_REPO = 'zmk';
export const ZMK_MAIN_BRANCH = 'main';
