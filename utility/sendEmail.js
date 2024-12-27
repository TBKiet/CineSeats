const nodemailer = require('nodemailer');
const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    });
    const mailOptions = {
        from: `CineSeats <${process.env.EMAIL_USERNAME}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };
    await transporter.sendMail(mailOptions, (err, info) => {
        if (err) console.error(err);
        else console.log('Email sent: ' + info.response);
    });
};
module.exports = sendEmail;
