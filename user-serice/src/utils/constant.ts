export const RedisKeys = {
    otp: {
        rate: (email: string) => `otp:rate:${email}`,
        session: (sessionId: string) => `otp:session:${sessionId}`,
        attempts: (email: string) => `otp:attempts:${email}`,
    },
};

export const CookieNames = {
    OTP_SESSION: "otp_session",
    ACCESS_TOKEN: "access_token",
    REFRESH_TOKEN: "refresh_token",
    SESSION_ID: "session_id",
} as const;