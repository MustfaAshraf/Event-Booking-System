import Joi from 'joi';
import { REGEX, USER_ROLES } from '../../config/constants.js';

export const registerSchema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    email: Joi.string().pattern(REGEX.EMAIL).required().messages({
        'string.pattern.base': 'Please provide a valid email address.'
    }),
    password: Joi.string().pattern(REGEX.PASSWORD).required().messages({
        'string.pattern.base': 'Password must be at least 8 characters long, contain at least one letter and one number.'
    }),
    confirmPassword: Joi.valid(Joi.ref('password')).required().messages({
        'any.only': 'Passwords do not match',
    }),
    role: Joi.string().valid(USER_ROLES.USER, USER_ROLES.ORGANIZER).default(USER_ROLES.USER)
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});