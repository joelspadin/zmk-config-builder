import { IGitApi } from './IGitApi';

export class GitApiStub implements IGitApi {
    public readonly providerName = '';
    public readonly isAuthenticated = false;
    public readonly username = '';
}
