import { Kafka, logLevel } from "kafkajs";
import logger from "./looger";
import { config } from ".";


const kafka = new Kafka({
    clientId: config.KAFKA_CLIENT_ID,
    brokers: [config.KAFKA_BROKER || 'localhost:9093'],
    logLevel: logLevel.ERROR,
    retry: {
        initialRetryTime: 300,
        retries: 10,
        maxRetryTime: 30000,
        multiplier: 2,
    }
})


const consumer = kafka.consumer({
    groupId: config.KAFKA_GROUP_ID || 'notification-service-group',
    sessionTimeout: 30000,
    heartbeatInterval: 3000,
})


const shutdown = async () => {
    logger.info('Shutting down Kafka consumer...');
    try {
        await consumer.disconnect();
        logger.info('Kafka consumer disconnected successfully.');
    } catch (error) {
        logger.error('Error during Kafka consumer shutdown', { error: error instanceof Error ? error.message : String(error) });
    } finally {
        process.exit(0);
    }
}


process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

export { kafka, consumer };