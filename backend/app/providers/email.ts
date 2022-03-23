import nodemailer from "nodemailer";

export const smtpTransport =
  nodemailer.createTransport({
    host: process.env.MAILSERVER_ADDRESS || "",
    port: Number(process.env.MAILSERVER_PORT || 0),
    secure: false,
    auth: {
      user: process.env.MAILSERVER_USERNAME,
      pass: process.env.MAILSERVER_PASSWORD,
    },
  })
;
