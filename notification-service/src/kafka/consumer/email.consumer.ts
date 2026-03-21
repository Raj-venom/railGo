import { consumer } from "../../config/kafka";
import logger from "../../config/logger";
import { emailService } from "../../services/email.service";
import { TOPICS } from "../../utils/constant";


class EmailConsumer {

    async start() {
        try {

            await consumer.connect();
            logger.info("Email consumer connected to Kafka");

            await consumer.subscribe({
                topics: Object.values(TOPICS),
                fromBeginning: true
            })


            await consumer.run({
                eachMessage: async ({ topic, partition, message }) => {
                    try {
                        const value = JSON.parse(message.value.toString());
                        logger.info(`Processing message from topic: ${topic}`, {
                            partition,
                            offset: message.offset,
                            key: message.key?.toString(),
                        });

                        await this.handleMessage(topic, value);

                    } catch (error) {

                        logger.error('Error processing message', {
                            topic,
                            partition,
                            offset: message.offset,
                            error: error.message,
                            stack: error.stack,
                        });


                    }
                }
            })


        } catch (error) {
            logger.error(`Failed to start email consumer: ${error.message}`);
            throw error;
        }
    }

    async handleMessage(topic: string, data: any) {
        switch (topic) {
            case TOPICS.OTP_EMAIL:
                await this.handleOtpEmail(data);
                break;
            case TOPICS.WELCOME_EMAIL:
                await this.handleWelcomeEmail(data);
                break;
            default:
                logger.warn(`No handler defined for topic: ${topic}`);
        }
    }


    async handleOtpEmail(data: { email: string; otp: string; ttlMinutes?: number }) {

        const { email, otp, ttlMinutes } = data;

        if (!email || !otp) {
            throw new Error('Missing required fields: email or otp');
        }

        await emailService.sendOtpEmail(email, otp, ttlMinutes || 5);
        logger.info(`OTP email sent to ${email}`);
    }

    async handleWelcomeEmail(data: { email: string; firstName: string }) {
        const { email, firstName } = data;

        if (!email || !firstName) {
            throw new Error('Missing required fields: email or firstName');
        }

        await emailService.sendWelcomeEmail(email, firstName);
        logger.info(`Welcome email sent to ${email}`);
    }


    async stop() {
        await consumer.disconnect();
        logger.info("Email consumer disconnected from Kafka");
    }

}

export const emailConsumer = new EmailConsumer();