export interface SlackTokenResponse {
    ok: boolean;
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    authed_user: {
        id: string;
        scope: string;
        access_token: string;
        token_type: string;
        expires_in?: number;
        refresh_token?: string;
    };
    team: {
        id: string;
        name: string;
    };
}
export interface SlackChannel {
    id: string;
    name: string;
    is_member: boolean;
}
export declare class SlackService {
    /**
     * Exchange long-lived access token for rotatable tokens
     * This is required when token rotation is enabled
     */
    private static exchangeLongLivedToken;
    private static refreshAccessToken;
    static exchangeCodeForToken(code: string): Promise<SlackTokenResponse>;
    static getValidAccessToken(userId: string): Promise<string>;
    static getChannels(accessToken: string): Promise<SlackChannel[]>;
    static sendMessage(accessToken: string, channelId: string, message: string): Promise<void>;
}
//# sourceMappingURL=slackService.d.ts.map