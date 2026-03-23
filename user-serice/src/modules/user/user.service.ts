import { config } from "../../config";
import logger from "../../config/logger";
import prisma from "../../config/prisma";
import { redisClient } from "../../config/redis";




class UserService {

    public getUserById = async (userId: string) => {

        logger.info(`Fetching profile for user ID: ${userId}`);
        const cachedUser = await redisClient.get(`user:${userId}`);

        if (cachedUser) {
            logger.info(`User profile for ID ${userId} found in cache`);
            return JSON.parse(cachedUser);
        }

        logger.info(`User profile for ID ${userId} not found in cache, querying database`);

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });


        const { password, ...safeUser } = user;

        logger.info(`User profile for ID ${userId} cached for future requests`);
        await redisClient.set(`user:${user.id}`, JSON.stringify(user), 'EX', config.REDIS_USER_TTL);

        return safeUser;
    }
}

export default UserService;