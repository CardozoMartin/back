import User, { IUser } from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendVerificationEmail } from '../config/nodemailer';

class AuthService {
  // Registrar un nuevo usuario
  async registerUser(userData: IUser): Promise<IUser> {
    const { nombre, apellido, email, telefono, password } = userData;

    // Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generar un código de verificación
    const codigoVerificacion = jwt.sign({ email }, process.env.JWT_SECRET!, { expiresIn: '1h' });

    const user = new User({
      nombre,
      apellido,
      email,
      telefono,
      password: hashedPassword,
      codigoVerificacion,
    });

    // Enviar correo de verificación
    await sendVerificationEmail(email, codigoVerificacion);

    return await user.save();
  }

  // Verificar el correo electrónico
  async verifyEmail(codigoVerificacion: string): Promise<void> {
    const decoded = jwt.verify(codigoVerificacion, process.env.JWT_SECRET!) as { email: string };
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    user.activo = true;
    user.codigoVerificacion = '';
    await user.save();
  }

  // Login de usuario
  async loginUser(email: string, password: string): Promise<string> {
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    if (!user.activo) {
      throw new Error('Por favor, verifica tu correo electrónico');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Contraseña incorrecta');
    }

    // Generar token JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: '1h' });
    return token;
  }
}

export default new AuthService();