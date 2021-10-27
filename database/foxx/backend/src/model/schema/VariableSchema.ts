import Joi from 'joi';
import { AccessLevel, Theme, VariableOrigin, VariableType } from '../documents';

export const VariableSchema: Joi.Schema = Joi.object({
    _key: Joi.string(),
    name: Joi.string(),
    description: Joi.string(),
    type: Joi.string().allow(...Object.keys(VariableType)),
    timeseries: Joi.boolean(),
    multiple: Joi.boolean(),
    accessLevel: Joi.string().allow(...Object.keys(AccessLevel)),
    theme: Joi.string().allow(...Object.keys(Theme)),
    origin: Joi.string().allow(...Object.keys(VariableOrigin)),
    units: Joi.string().empty('').default('').optional(),
    enumValues: Joi.array().items(Joi.string()).optional(),
    methodology: Joi.string().empty('').default('').optional(),
    createdAt: Joi.string().isoDate(),
    updatedAt: Joi.string().isoDate(),
});
