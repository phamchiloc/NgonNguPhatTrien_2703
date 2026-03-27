const nodemailer = require("nodemailer");

const SMTP_HOST = process.env.SMTP_HOST || "sandbox.smtp.mailtrap.io";
const SMTP_PORT = Number(process.env.SMTP_PORT || 2525);
const SMTP_USER = process.env.SMTP_USER || "fc70463c322ac2";
const SMTP_PASS = process.env.SMTP_PASS || "3232824acdb83e";

function ensureSmtpCredentials() {
    if (!SMTP_USER || !SMTP_PASS) {
        throw new Error("Missing Mailtrap credentials: set SMTP_USER and SMTP_PASS");
    }
}

const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: false,
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
    },
    tls: {
        rejectUnauthorized: false,
    },
});

module.exports = {
    sendMail: async function (to, url) {
        ensureSmtpCredentials();
        await transporter.sendMail({
            from: "admin@hehehe.com",
            to: to,
            subject: "reset pass",
            text: "click vo day de doi pass",
            html: "click vo <a href=" + url + ">day</a> de doi pass",
        });
    },
    sendAccountPasswordMail: async function (to, username, password) {
        ensureSmtpCredentials();
        await transporter.sendMail({
            from: "admin@hehehe.com",
            to: to,
            subject: "Thong tin tai khoan",
            text: "Tai khoan: " + username + "\nMat khau: " + password,
            html: "<p>Tai khoan: <b>" + username + "</b></p><p>Mat khau: <b>" + password + "</b></p>",
        });
    }
};
