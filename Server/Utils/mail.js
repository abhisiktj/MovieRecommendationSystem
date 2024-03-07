//mail service using ethereal in dev enviroment

const nodemailer = require("nodemailer");

const sendMail = async (email, subject, text) => {
  const mailOptions = {
    from: process.env.email,
    to: email,
    subject: subject,
    text: text,
  };
  let resp = await wrapedSendMail(mailOptions);
  return resp;
};

//returns a promise whether mail sent or not

async function wrapedSendMail(mailOptions) {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: process.env.email,
        pass: process.env.password,
      },
    });

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

module.exports = { sendMail };
