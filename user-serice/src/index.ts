import dotenv from "dotenv";

dotenv.config({
    path: "./.env"
})

import { config } from "./config";
import logger from "./config/logger";
import app from "./app";





const startServer = () => {
    try {
        app.listen(config.PORT, () => {
            `⚙️ ${config.SERVICE_NAME} is running on http://localhost:${config.PORT}`

        })
    } catch (error) {
        logger.error("Failed to start server", { error });
        process.exit(1);
    }
}

startServer();