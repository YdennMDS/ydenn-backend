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

exports.sendResetPassword = (user_email, resetPasswordCode) => {
  const resetPasswordCodeSplit = resetPasswordCode;
  const digits = resetPasswordCodeSplit.toString().split("");

  let mailOptions = {
    from: process.env.EMAIL_USER,
    to: user_email,
    subject: "Réinitialisation de votre mot de passe",
    // text: `Voici votre code de réinitialisation de mot de passe : ${resetPasswordCode}. Ce code est valide pour 5 minutes.`,
    html: `<html>
            <body style="margin: 0; padding: 0; box-sizing: border-box">
              <div
                style="
                  width: 100%;
                  height: 100vh;
                  display: flex;
                  flex-direction: column;
                  justify-content: center;
                  align-items: center;
                  gap: 75px;
                "
              >
                <p style="font-size: 20px; font-weight: 500px">
                  Voici votre code de réinitialisation de mot de passe :
                </p>
              <div
                style="
                  width: auto;
                  border: 1px solid black;
                  border-radius: 8px;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                "
              >
                <p
                  style="
                    font-size: 20px;
                    font-weight: bold;
                    display: flex;
                    flex-direction: row;
                    gap: 10px;
                    margin: 30px 25px;
                    cursor: pointer;
                  "
                >
                  <span
                    style="border: 1px solid black; padding: 5px; border-radius: 6px"
                    >${digits[0]}</span
                  >
                  <span
                    style="border: 1px solid black; padding: 5px; border-radius: 6px"
                    >${digits[1]}</span
                  >
                  <span
                    style="border: 1px solid black; padding: 5px; border-radius: 6px"
                    >${digits[2]}</span
                  >
                  <span
                    style="border: 1px solid black; padding: 5px; border-radius: 6px"
                    >${digits[3]}</span
                  >
                  <span
                    style="border: 1px solid black; padding: 5px; border-radius: 6px"
                    >${digits[4]}</span
                  >
                  <span
                    style="border: 1px solid black; padding: 5px; border-radius: 6px"
                    >${digits[5]}</span
                  >
                </p>
              </div>
              <p style="font-size: 20px; font-weight: 500px">
                Ce code est valide pour <span style="color: red">5 minutes</span>.
              </p>
            </div>
          </body>
        </html>`,
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
