const transporter = require("./email");


async function sendNotification(to, subject, message){

    try {

        await transporter.sendMail({

            from: `"Mobile Waste Collection System - Rubaga" <${process.env.EMAIL_USER}>`,

            to: to,

            subject: subject,

            html: message

        });


        console.log("Email sent successfully to:", to);

        return true;


    } catch(error){

        console.log("Email error:", error.message);

        return false;

    }

}


module.exports = {
    sendNotification
};