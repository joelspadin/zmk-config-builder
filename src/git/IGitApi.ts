export interface IGitApi {
    readonly providerName: string;
    readonly isAuthenticated: boolean;
    readonly username: string;
    readonly avatarUrl?: string;
}
