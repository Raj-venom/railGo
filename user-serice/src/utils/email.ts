import sgMail from "@sendgrid/mail";


import { config } from "../config";


sgMail.setApiKey(config.SENDGRID_API_KEY);
const minutes = (Number(config.OTP_TTL) || 300) / 60;


async function sendOtpEmail(to: string, otp: string) {

    const msg = {
        to,
        from: `${config.MAIL_SEND}`,
        subject: "Your OTP Code",
        text: `Your OTP code is ${otp}. It is valid for ${minutes} minutes.`,
        html: `
            <p>Your OTP code is <strong>${otp}</strong>. It is valid for ${minutes} minutes.</p>
            <p>If you did not request this code, please ignore this email.</p>
        `,
    };

    await sgMail.send(msg);
}

async function sendWelcomeEmail(to: string, firstName: string) {

    const msg = {
        to,
        from: `${config.MAIL_SEND}`,
        subject: "Welcome to Our Service!",
        text: `Hello ${firstName},\n\nWelcome to our service! We're excited to have you on board. Your account has been successfully created, and you're all set to get started.\n\nIf you have any questions or need assistance, feel free to reach out to our support team.\n\nBest regards,\nThe Team`,
        html: `
            <!DOCTYPE html>
            <html>
            <body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f4f4f4;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
                <tr>
                    <td align="center">
                    <table width="500" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.1);">
                        <tr>
                        <td style="background:linear-gradient(135deg,#667eea,#764ba2);padding:40px;text-align:center;">
                            <h1 style="color:#ffffff;margin:0;font-size:28px;">Welcome Aboard! 🎉</h1>
                        </td>
                        </tr>
                        <tr>
                        <td style="padding:40px;text-align:center;">
                            <h2 style="color:#333333;margin:0 0 10px;">Hello, ${firstName}!</h2>
                            <p style="color:#666666;font-size:16px;line-height:1.6;margin:0 0 30px;">
                            We're thrilled to have you with us. Your account has been successfully created and you're all set to get started.
                            </p>
                            <a href="#" style="background:linear-gradient(135deg,#667eea,#764ba2);color:#ffffff;padding:14px 32px;border-radius:25px;text-decoration:none;font-size:16px;font-weight:bold;display:inline-block;">
                            Get Started →
                            </a>
                        </td>
                        </tr>
                        <tr>
                        <td style="background:#f9f9f9;padding:20px;text-align:center;border-top:1px solid #eeeeee;">
                            <p style="color:#999999;font-size:12px;margin:0;">
                            © ${new Date().getFullYear()} RailGo. All rights reserved.
                            </p>
                        </td>
                        </tr>
                    </table>
                    </td>
                </tr>
                </table>
            </body>
            </html>
            `,
    };

    await sgMail.send(msg);
}


export {
    sendOtpEmail,
    sendWelcomeEmail
}