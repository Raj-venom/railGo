const RedisKeys = {
    otp: {
        rate: (email: string) => `otp:rate:${email}`,
        session: (sessionId: string) => `otp:session:${sessionId}`,
        attempts: (email: string) => `otp:attempts:${email}`,
    },
};

const CookieNames = {
    OTP_SESSION: "otp_session",
    ACCESS_TOKEN: "access_token",
    REFRESH_TOKEN: "refresh_token",
    SESSION_ID: "session_id",
} as const;


const TOPICS = {
    OTP_EMAIL: 'notification.email.otp',
    WELCOME_EMAIL: 'notification.email.welcome',
    TICKET_CONFIRMATION: 'notification.email.ticket-confirmation',
    PASSWORD_RESET: 'notification.email.password-reset',
};

export {
    RedisKeys,
    CookieNames,
    TOPICS
}