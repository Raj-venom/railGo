import sgMail from "@sendgrid/mail";

import { config } from "../config";
import logger from "../config/logger";
import { getOtpTemplate, getWelcomeTemplate } from "../templates";
import { MAX_EMAIL_RETRIES } from "../utils/constant";


sgMail.setApiKey(config.SENDGRID_API_KEY);


class EmailService {

    from: string;
    maxRetries: number;


    constructor() {
        this.from = `${config.MAIL_SEND}`;
        this.maxRetries = MAX_EMAIL_RETRIES;
    }

    async sendWithRetry(message: sgMail.MailDataRequired, retries = 0): Promise<{ success: boolean | Error }> {
        try {

            await sgMail.send(message);
            logger.info(`Email sent successfully to ${message.to}`, {
                subject: message.subject,
                attempt: retries + 1
            });

            return { success: true }

        } catch (error) {
            logger.error(`Email sending failed (attempt ${retries + 1}/${this.maxRetries})`, {
                to: message.to,
                error: error.message,
                code: error.code,
            });

            if(retries < this.maxRetries - 1) {
                const delay = Math.pow(2, retries) * 1000; // Exponential backoff
                await new Promise(res => setTimeout(res, delay));
                return this.sendWithRetry(message, retries + 1);
            }

            throw error;
        }
    }

    async sendOtpEmail(email: string, otp: string, ttlMinutes: number) {
        const message = {
            to: email,
            from: this.from,
            subject: "Your OTP Code",
            html: getOtpTemplate(otp, ttlMinutes)
        };

        return this.sendWithRetry(message); 
    }


    async sendWelcomeEmail(email: string, firstName: string) {
        const message = {
            to: email,
            from: this.from,
            subject: "Welcome to DesignKarle!",
            html: getWelcomeTemplate(firstName)
        };

        return this.sendWithRetry(message);
    }

}

export const emailService = new EmailService();