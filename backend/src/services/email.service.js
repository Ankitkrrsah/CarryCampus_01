import nodemailer from "nodemailer";

const sendEmail = async (to, subject, text, html) => {
    try {
        
        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail', 
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS 
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: to,
            subject: subject,
            text: text,
            html: html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: " + info.response);
        return { success: true, info };

    } catch (error) {
        console.error("Error sending email:", error);
        return { success: false, error };
    }
};

export { sendEmail };