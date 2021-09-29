import Joi from 'joi';
import { ReferenceType } from '../documents';

export const ReferenceSchema: Joi.Schema = Joi.object({
    _key: Joi.string(),
    authors: Joi.string().optional(),
    fileName: Joi.string().optional(),
    reference: Joi.string().optional(),
    shortName: Joi.string().optional(),
    type: Joi.string().allow(...Object.keys(ReferenceType)),
    year: Joi.string().optional(),
    createdAt: Joi.string().isoDate().optional(),
    updatedAt: Joi.string().isoDate().optional(),
});
