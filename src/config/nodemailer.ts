import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
const transporter = nodemailer.createTransport({
  service: 'Gmail', // Puedes usar otro servicio como Outlook, Yahoo, etc.
  auth: {
    user: process.env.EMAIL_USER, // Tu correo electrónico
    pass: process.env.EMAIL_PASS, // Tu contraseña de aplicación (no la de tu cuenta)
  },
});

export const sendVerificationEmail = async (email: string, codigoVerificacion: string) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verifica tu correo electrónico',
    html: `<p>Por favor, haz clic en el siguiente enlace para verificar tu correo electrónico:</p>
           <a href="http://localhost:3000/api/auth/verify/${codigoVerificacion}">Verificar correo</a>`,
  };

  await transporter.sendMail(mailOptions);
};

export default transporter;