import { z } from 'zod';

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

export const getUserSchema = {
    params: z.object({
        id: z.string().uuid('Invalid user ID format'),
    }),
};

export const listUsersSchema = {
    query: z.object({
        page: z.coerce.number().int().positive().default(1),
        limit: z.coerce.number().int().positive().max(100).default(10),
    }),
};