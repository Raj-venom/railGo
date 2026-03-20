import { producer, connectProducer } from "../../config/kafka";
import logger from "../../config/logger";
import { TOPICS } from "../../utils/constant";

type KafkaMessage = {
    topic: string;
    messages: Array<{
        key: string;
        value: string;
        timeStamp: string;
    }>;
};

class NotificationProducer {

    isInitialized: boolean;

    constructor() {
        this.isInitialized = false;
    }

    async initialize() {
        if (!this.isInitialized) {
            await connectProducer();
            this.isInitialized = true;
        }
    }

    async sendMessage(topic: string, key: string, value: any) {
        try {

            await this.initialize();

            const message: KafkaMessage = {
                topic,
                messages: [{
                    key: key || `${topic}-${Date.now()}`,
                    value: JSON.stringify(value),
                    timeStamp: Date.now().toString()
                }]
            }

            const result = await producer.send(message);

            logger.info(`Message sent to kafka topic: ${topic}`, {
                key,
                partition: result[0].partition,
                offset: result[0].offset,
            })

        } catch (error) {

            logger.error(`Failed to send message to kafka topic: ${topic}`, {
                error: error.message,
                stack: error.stack,
                key
            })
            throw error;
        }
    }

    async sendOtpEmail(email: string, otp: string, ttlMinutes: number) {
        return this.sendMessage(
            TOPICS.OTP_EMAIL,
            `otp-${email}`,
            { email, otp, ttlMinutes }
        )
    }

    async sendWelcomeEmail(email: string, firstName: string) {
        return this.sendMessage(
            TOPICS.WELCOME_EMAIL,
            `welcome-${email}`,
            { email, firstName }
        )
    }

}


export const notificationProducer = new NotificationProducer();