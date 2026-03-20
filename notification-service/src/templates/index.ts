import { config } from "../config";

const getOtpTemplate = (otp: string, ttlMinutes: number): string => `
    <div style="font-family: Arial, sans-serif; max-width: 420px; margin: auto; padding: 20px; border: 1px solid #e5e5e5; border-radius: 10px; background: #ffffff;">
        <h2 style="color: #4A3AFF; text-align: center; margin: 0 0 20px 0;">DesignKarle</h2>
        <p style="font-size: 16px; color: #333;">Hi,</p>
        <p style="font-size: 16px; color: #333;">Welcome to <strong>DesignKarle</strong> 👋 Use the code below to complete your sign up:</p>
        <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; padding: 14px 26px; font-size: 32px; letter-spacing: 8px; font-weight: bold; background: #F4F4FF; border-radius: 8px; color: #4A3AFF; border: 1px solid #e0e0ff;">${otp}</div>
        </div>
        <p style="font-size: 15px; color: #555;">This code expires in <strong>${ttlMinutes} minutes</strong>.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;" />
        <p style="font-size: 14px; color: #888; text-align: center;">Happy Learning 🎉<br/><strong>Team DesignKarle</strong></p>
    </div>
`;

const getWelcomeTemplate = (firstName: string): string => `
    <div style="font-family: Arial, sans-serif; max-width: 420px; margin: auto; padding: 20px; border: 1px solid #e5e5e5; border-radius: 10px; background: #ffffff;">
        <h2 style="color: #4A3AFF; text-align: center; margin: 0 0 20px 0;">DesignKarle</h2>
        <p style="font-size: 16px; color: #333;">Hi <strong>${firstName}</strong>,</p>
        <p style="font-size: 16px; color: #333;">Welcome to <strong>DesignKarle</strong> 👋 Your account is ready to use.</p>
        <div style="text-align: center; margin: 25px 0;">
            <a href="${config.FRONTEND_URL}/login" style="display: inline-block; padding: 12px 22px; background: #4A3AFF; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Login to Your Account</a>
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;" />
        <p style="font-size: 14px; color: #888; text-align: center;">Happy Learning 🎉<br/><strong>Team DesignKarle</strong></p>
    </div>
`;

const getTicketConfirmationTemplate = (ticketData: any): string => {
    const { pnr, trainName, trainNumber, from, to, date, passengers, amount } = ticketData;
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e5e5; border-radius: 10px; background: #ffffff;">
            <h2 style="color: #4A3AFF; text-align: center;">🎫 Ticket Confirmed</h2>
            <div style="background: #F4F4FF; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>PNR:</strong> ${pnr}</p>
                <p style="margin: 5px 0;"><strong>Train:</strong> ${trainName} (${trainNumber})</p>
            </div>
            <p style="margin: 10px 0;"><strong>From:</strong> ${from} <strong>To:</strong> ${to}</p>
            <p style="margin: 10px 0;"><strong>Date:</strong> ${date} | <strong>Amount:</strong> ₹${amount}</p>
            <h3 style="color: #333; margin-top: 20px;">Passengers:</h3>
            ${passengers.map((p: any, i: number) => `<p style="margin: 5px 0;">${i + 1}. ${p.name} (${p.age}y, ${p.gender})</p>`).join('')}
            <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;" />
            <p style="font-size: 14px; color: #888; text-align: center;">Safe Journey! 🚂<br/><strong>Team IRCTC</strong></p>
        </div>
    `;
};

export {
    getOtpTemplate,
    getWelcomeTemplate,
    getTicketConfirmationTemplate
}
