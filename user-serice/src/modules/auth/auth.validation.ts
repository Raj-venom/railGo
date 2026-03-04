import { z } from 'zod';
import { CookieNames } from '../../utils/constant';

export const signUpSchema = {
    body: z.object({
        firstName: z.string().min(1, 'First name is required'),
        lastName: z.string().min(1, 'Last name is required'),
        email: z.string().email('Invalid email address'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        confirmPassword: z.string().min(1, 'Confirm password is required'),
    }).refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    }),
};


export const loginSchema = {
    body: z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
    }),
};


export const verifyOTPSchema = {

    body: z.object({
        otp: z.string().min(1, 'OTP is required'),
    }),
    cookies: z.object({
        [CookieNames.OTP_SESSION]: z.string().min(1, 'OTP session ID is required in cookies'),
    })
}


export const rotateRefreshTokenSchema = {

    cookies: z.object({
        [CookieNames.REFRESH_TOKEN]: z.string().min(1, 'Refresh token is required in cookies'),
    })

};
