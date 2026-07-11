const nodemailer = require("nodemailer");

console.log("EMAIL MODULE LOADED");

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth:{
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});


transporter.verify((error)=>{
    if(error){
        console.log("SMTP CONNECTION FAILED:", error.message);
    } else {
        console.log("SMTP CONNECTION READY");
    }
});


module.exports = transporter;