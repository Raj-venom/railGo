import dotenv from "dotenv";

dotenv.config();

import { config } from "./config";
import logger from "./config/logger";
import app from "./app";

const gracefulShutdown = () => {
    logger.info('Received shutdown signal, closing server gracefully...');
    server.close(() => {
        logger.info('Server closed');
        process.exit(0);
    });

    setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
    }, 30000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

const server = app.listen(config.PORT, () => {
    logger.info(`🚀 API Gateway running on port ${config.PORT} in ${config.NODE_ENV} mode`);
});

process.on('unhandledRejection', (err) => {
    logger.error('Unhandled Rejection: ' + (err instanceof Error ? err.message : String(err)));
    server.close(() => process.exit(1));
});
