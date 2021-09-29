import Joi from 'joi';
import { AccessLevel, Theme } from '../documents';

export const VariableSchema: Joi.Schema = Joi.object({
    _key: Joi.string(),
    name: Joi.string(),
    description: Joi.string(),
    type: Joi.string(),
    timeseries: Joi.boolean(),
    multiple: Joi.boolean(),
    accessLevel: Joi.string().allow(...Object.keys(AccessLevel)),
    theme: Joi.string().allow(...Object.keys(Theme)),
    createdAt: Joi.string().isoDate(),
    updatedAt: Joi.string().isoDate(),
});
