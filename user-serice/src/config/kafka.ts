import { Kafka, logLevel } from "kafkajs";
import logger from "./logger";
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

const producer = kafka.producer({
    allowAutoTopicCreation: true,
    transactionTimeout: 30000,
    idempotent: true,
    maxInFlightRequests: 5,
    retry: {
        retries: 5,
    },
})

let isConnected: Promise<void> | null = null;

const connectProducer = async () => {
    if (!isConnected) {
        isConnected = producer.connect()
            .then(() => {
                logger.info("Kafka producer connected successfully");
            })
            .catch((err) => {
                isConnected = null;
                throw err;
            });
    }

    return isConnected;
};

const disconnectProducer = async () => {
    if (isConnected) {
        try {
            await producer.disconnect();
            logger.info('Kafka producer disconnected successfully.');
        } catch (error) {
            logger.error('Error during Kafka producer shutdown', { error: error instanceof Error ? error.message : String(error) });
        } finally {
            process.exit(0);
        }
    }
}


process.on('SIGINT', disconnectProducer);
process.on('SIGTERM', disconnectProducer);

export { kafka, producer, connectProducer, disconnectProducer };