import cors from 'cors';
import { config } from '../config';


const corsMiddleware = cors({
    origin: config.ALLOWED_ORIGINS.split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
         'Origin',
         'X-Requested-With',
         'Content-Type',
         'Accept',
         'Authorization',
    ],
});

export {
    corsMiddleware
}