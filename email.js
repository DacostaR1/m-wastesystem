const nodemailer = require("nodemailer");

// ======================================
// EMAIL CONFIGURATION
// ======================================

console.log("======================================");
console.log("EMAIL MODULE LOADED");
console.log("EMAIL_HOST :", process.env.EMAIL_HOST);
console.log("EMAIL_PORT :", process.env.EMAIL_PORT);
console.log("EMAIL_USER :", process.env.EMAIL_USER);
console.log(
    "EMAIL_PASS :",
    process.env.EMAIL_PASS ? "Loaded" : "Missing"
);
console.log("======================================");

// ======================================
// CREATE SMTP TRANSPORTER
// ======================================

const transporter = nodemailer.createTransport({

    host: process.env.EMAIL_HOST,

    port: Number(process.env.EMAIL_PORT),

    secure: false, // Port 587 uses STARTTLS

    requireTLS: true,

    auth: {

        user: process.env.EMAIL_USER,

        pass: process.env.EMAIL_PASS

    },

    connectionTimeout: 30000,

    greetingTimeout: 30000,

    socketTimeout: 30000,

    tls: {
        rejectUnauthorized: false
    }

});

// ======================================
// VERIFY SMTP CONNECTION
// ======================================

(async () => {

    try {

        await transporter.verify();

        console.log("======================================");
        console.log("SMTP CONNECTION READY");
        console.log("======================================");

    } catch (err) {

        console.log("======================================");
        console.log("SMTP CONNECTION FAILED");
        console.log(err);
        console.log("======================================");

    }

})();

// ======================================
// EXPORT TRANSPORTER
// ======================================

module.exports = transporter;