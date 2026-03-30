import Redis from "ioredis";
import { config } from "./index";
import logger from "./logger";



class RedisClient {
    private static instance: Redis;
    private static isConnected = false;

    private constructor() {
        // Prevent direct instantiation
    }


    static getInstance(): Redis {
        if (!RedisClient.instance) {
            RedisClient.instance = new Redis(config.REDIS_URL!, {
                retryStrategy: (times) => {
                    const delay = Math.min(times * 50, 2000);
                    return delay;
                },
                maxRetriesPerRequest: 3,
            });

            RedisClient.setupEventListeners();
        }

        return RedisClient.instance;
    }

    static setupEventListeners() {
        RedisClient.instance.on('connect', () => {
            RedisClient.isConnected = true;
            logger.info("Connected to Redis successfully");
        })

        RedisClient.instance.on('error', (error) => {
            RedisClient.isConnected = false;
            logger.error("Redis connection error: " + error.message); 
        })

        RedisClient.instance.on('close', () => {
            RedisClient.isConnected = false;
            logger.warn("Redis connection closed");
        })

        RedisClient.instance.on('reconnecting', () => {
            logger.warn("Reconnecting to Redis...");
        })

        RedisClient.instance.on('ready', () => {
            logger.warn("Redis client is ready");
        })

        RedisClient.instance.on('end', () => {
            RedisClient.isConnected = false;
            logger.warn("Redis connection ended");
        })
    }


    static async closeConnection() {
        if (RedisClient.instance) {
            try {
                await RedisClient.instance.quit();
                logger.info("Redis connection closed");
            } catch (error) {
                logger.error("Error closing Redis connection: " + (error instanceof Error ? error.message : String(error)));
            }
        }
    }

    static isReady(): boolean {
        return RedisClient.isConnected;
    }

    // static async testConnection(): Promise<boolean> {
    //     try {
    //         const client = RedisClient.getInstance();
    //         await client.ping();
    //         return true;
    //     } catch (error) {
    //         logger.error("Redis ping failed:", error);
    //         return false;
    //     }
    // }

    static async testConnection() {
        try {
            await RedisClient.instance.ping();
            return true;
        } catch (error) {
            logger.error("Redis connection test failed: " + (error instanceof Error ? error.message : String(error)));
            return false;
        }
    }


}



export const redisClient = RedisClient.getInstance();
export { RedisClient };