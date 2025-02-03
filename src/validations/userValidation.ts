import Joi from 'joi';

// Esquema de validación para el registro de usuarios
export const registerSchema = Joi.object({
  nombre: Joi.string().required(),
  apellido: Joi.string().required(),
  email: Joi.string().email().required(),
  telefono: Joi.string().required(),
  password: Joi.string().min(6).required(),
});

// Esquema de validación para el login
export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});