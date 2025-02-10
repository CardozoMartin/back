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
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #004aad; text-align: center;">Bienvenido a Bahía ACC</h2>
        <p>Hola,</p>
        <p>Gracias por registrarte en <strong>Bahía ACC</strong>. Para completar tu registro, por favor verifica tu correo electrónico haciendo clic en el siguiente botón:</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="http://localhost:3000/api/auth/verify/${codigoVerificacion}" 
             style="background-color: #004aad; color: white; padding: 12px 20px; border-radius: 5px; text-decoration: none; font-weight: bold;">
             Verificar correo
          </a>
        </div>
        <p>Una vez que confirmes tu correo, serás redirigido automáticamente a nuestra página principal.</p>
        <p>Si no has creado esta cuenta, ignora este mensaje.</p>
        <p>Saludos,<br>El equipo de Bahía ACC</p>
      </div>`,
  };

  await transporter.sendMail(mailOptions);
};

export default transporter;