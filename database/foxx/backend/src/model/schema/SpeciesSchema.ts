import Joi from 'joi';

export const SpeciesSchema: Joi.Schema = Joi.object({
    _key: Joi.string(),
    aphiaId: Joi.string().empty('').default('').optional(),
    iNaturalistId: Joi.string().empty('').default('').optional(),
    createdAt: Joi.string().isoDate().optional(),
    updatedAt: Joi.string().isoDate().optional(),
});
