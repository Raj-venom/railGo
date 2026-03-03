export const RedisKeys = {
    otp: {
        rate: (email: string) => `otp:rate:${email}`,
        session: (sessionId: string) => `otp:session:${sessionId}`,
        attempts: (email: string) => `otp:attempts:${email}`,
    },
};
