const CLIENT_ID_PRODUCTION = '703da2b79764b1239a79';
const CLIENT_ID_DEV = '1b6a37155cb37413d834';

export const GITHUB_OAUTH_CLIENT = 'https://zmk-oauth-client.herokuapp.com';
export const GITHUB_CLIENT_ID = window.location.hostname === 'localhost' ? CLIENT_ID_DEV : CLIENT_ID_PRODUCTION;
export const GITHUB_SCOPES = ['repo', 'workflow'];
