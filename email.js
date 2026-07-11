const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const nodemailer = require("nodemailer");

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

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10),
    secure: parseInt(process.env.EMAIL_PORT, 10) === 465,

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },

    family: 4,

    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 20000,

    tls: {
        rejectUnauthorized: false
    }
});

(async () => {
    try {
        await transporter.verify();
        console.log("SMTP CONNECTION READY");
    } catch (err) {
        console.error("SMTP CONNECTION FAILED");
        console.error(err);
    }
})();

module.exports = transporter;