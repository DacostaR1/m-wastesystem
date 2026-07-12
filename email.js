const axios = require("axios");

console.log("======================================");
console.log("BREVO EMAIL API LOADED");
console.log(
    "BREVO_API_KEY:",
    process.env.BREVO_API_KEY ? "Loaded" : "Missing"
);
console.log("======================================");

async function sendEmail(to, subject, htmlContent) {
    try {
        const response = await axios.post(
            "https://api.brevo.com/v3/smtp/email",
            {
                sender: {
                    name: "Mobile Waste Collection System - Rubaga",
                    email: process.env.EMAIL_FROM || "afekurobert107@gmail.com"
                },

                to: [
                    {
                        email: to
                    }
                ],

                subject: subject,

                htmlContent: htmlContent
            },
            {
                headers: {
                    "accept": "application/json",
                    "content-type": "application/json",
                    "api-key": process.env.BREVO_API_KEY
                },
                timeout: 30000
            }
        );

        console.log("Email sent successfully");
        console.log(response.data);

        return true;

    } catch (err) {

        console.error("BREVO EMAIL FAILED");

        if (err.response) {
            console.error(err.response.status);
            console.error(err.response.data);
        } else {
            console.error(err.message);
        }

        return false;
    }
}

module.exports = {
    sendEmail
};