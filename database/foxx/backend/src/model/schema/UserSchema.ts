import Joi from 'joi';
import { UserRole } from '../documents';

export const UserSchema: Joi.Schema = Joi.object({
    _key: Joi.string(),
    email: Joi.string().email(),
    name: Joi.string(),
    role: Joi.string().allow(...Object.keys(UserRole)),
    createdAt: Joi.string().isoDate(),
    updatedAt: Joi.string().isoDate(),
});
