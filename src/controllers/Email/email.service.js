import { transporter } from "../../utils/mailer.js";



export const sendEmail = async (to, subject, html) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject,
            html
        });
        console.log("Email sent successfully:", info.messageId);
    } catch (error) {
        console.error("Error sending email:", error);
    }
}


        