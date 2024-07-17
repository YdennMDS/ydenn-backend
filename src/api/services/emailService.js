const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  host: process.env.EMAIL_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

exports.sendConfirmationEmail = (
  user_email,
  user_firstName,
  confirmationToken
) => {
  let mailOptions = {
    from: process.env.EMAIL_USER,
    to: user_email,
    subject: "Votre compte a bien été créé",
    text: `Chère ${user_firstName}, nous vous souhaitons la bienvenue sur Ydenn. Veuillez cliquer sur le lien suivant pour confirmer votre compte : ${process.env.BASE_URL}/user/confirm/${confirmationToken}`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log("* Error sending email *");
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};
