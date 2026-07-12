const { sendEmail } = require("./email");

/**
 * Send an email notification
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} message - HTML email content
 * @returns {Promise<boolean>}
 */
async function sendNotification(to, subject, message) {
    try {
        const sent = await sendEmail(to, subject, message);

        if (sent) {
            console.log(`Notification sent successfully to ${to}`);
            return true;
        }

        console.log(`Failed to send notification to ${to}`);
        return false;

    } catch (error) {
        console.error("Notification Error:", error.message);
        return false;
    }
}

module.exports = {
    sendNotification
};