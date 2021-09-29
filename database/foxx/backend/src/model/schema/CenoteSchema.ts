import Joi from 'joi';
import { CenoteType, Issue } from '../documents';

export const CenoteSchema: Joi.Schema = Joi.object({
    _key: Joi.string(),
    type: Joi.string().allow(...Object.keys(CenoteType)),
    name: Joi.string(),
    touristic: Joi.boolean(),
    issues: Joi.array().items(Joi.string().allow(...Object.keys(Issue))),
    alternativeNames: Joi.array().items(Joi.string()),
    geojson: Joi.object({
        geometry: Joi.object({
            type: 'Point',
            coordinates: Joi.array().items(Joi.number()).length(2),
        }),
        type: 'Feature',
        properties: Joi.object({}),
    }),
    // TODO: Also allow returning the document properties?
    gadm: Joi.string(),
    social: Joi.object({
        totalComments: Joi.number(),
        rating: Joi.number().optional().allow(null),
    }),
    createdAt: Joi.string().isoDate(),
    updatedAt: Joi.string().isoDate(),
});
