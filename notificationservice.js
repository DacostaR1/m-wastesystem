const transporter = require("./email");

async function sendNotification(to, subject, message) {

    try {

        const info = await transporter.sendMail({

            from: `"Mobile Waste Collection System - Rubaga" <${process.env.EMAIL_USER}>`,

            to,

            subject,

            html: message

        });

        console.log("✅ Email sent");
        console.log("Message ID:", info.messageId);

        return true;

    } catch (err) {

        console.error("❌ Email sending failed");
        console.error(err);

        return false;
    }
}

module.exports = {
    sendNotification
};