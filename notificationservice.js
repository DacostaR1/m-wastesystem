const { sendEmail } = require("./email");

async function sendNotification(to, subject, message) {

    console.log("======================================");
    console.log("sendNotification() CALLED");
    console.log("TO:", to);
    console.log("SUBJECT:", subject);
    console.log("======================================");

    try {

        const sent = await sendEmail(to, subject, message);

        console.log("sendEmail() returned:", sent);

        return sent;

    } catch (error) {

        console.error("Notification Error");
        console.error(error);

        return false;
    }
}

module.exports = {
    sendNotification
};