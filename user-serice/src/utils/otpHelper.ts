import { config } from "../config";
import { randomInt } from "crypto";
import { redisClient } from "../config/redis";
import { TooManyRequestsError } from "./ApiError";


type OtpSessionMeta = {
    firstName: string;
    lastName: string;
    email: string;
    hashedPassword: string;
};

export const RedisKeys = {
    otp: {
        rate: (email: string) => `otp:rate:${email}`,
        session: (sessionId: string) => `otp:session:${sessionId}`,
        attempts: (email: string) => `otp:attempts:${email}`,
    },
};

const RATE_MAX = Number(config.OTP_RATE_MAX_PER_HOUR ?? 5);
const ATTEMPT_MAX = Number(config.OTP_MAX_VERIFY_ATTEMPTS ?? 5);
const OTP_TTL = Number(config.OTP_TTL ?? 300);
const HMAC_SECRET = config.OTP_HMAC_SECRET;




export function generateOTP(length: number = 6): string {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return randomInt(min, max + 1).toString().padStart(length, "0");
}
function hashOtp(email: string, otp: string): string {
    return require("crypto").createHmac("sha256", HMAC_SECRET).update(email + ":" + otp).digest("hex");
}

async function createOtpSession(meta: OtpSessionMeta): Promise<{ otp: string; otpSessionId: string }> {

    // check rate limit
    // if rate limit exceeded, throw error
    // generate OTP
    // hash OTP with HMAC secret
    // generate session ID
    // store session in Redis with TTL
    // increate rate limit counter for email
    // set expiration for rate limit counter

    // return session ID and otp  => return {otp, otpSessionId};


    const rateKey = RedisKeys.otp.rate(meta.email);
    const currentRate = parseInt(await redisClient.get(rateKey) || "0", 10);

    if (currentRate >= RATE_MAX) {
        throw new TooManyRequestsError(
            `Too many OTP requests for ${meta.email}. Please try again later.`,
            "OTP_RATE_LIMIT"
        )
    }

    const otp = generateOTP();
    const otpSessionId = crypto.randomUUID();

    const hashedOtp = hashOtp(meta.email, otp);


    await redisClient.set(RedisKeys.otp.session(otpSessionId), JSON.stringify({
        hashedOtp,
        meta
    }), 'EX', OTP_TTL);

    await redisClient.incr(rateKey);
    await redisClient.expire(rateKey, 3600);
    return { otp, otpSessionId };

}