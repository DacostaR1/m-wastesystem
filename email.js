const nodemailer = require("nodemailer");

console.log("EMAIL MODULE LOADED");
console.log("EMAIL_HOST =", process.env.EMAIL_HOST);
console.log("EMAIL_PORT =", process.env.EMAIL_PORT);
console.log("EMAIL_USER =", process.env.EMAIL_USER);
console.log("EMAIL_PASS =", process.env.EMAIL_PASS ? "Loaded" : "Missing");


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