import createRouter from '@arangodb/foxx/router';
import { Joi } from 'type-arango';
import dd from 'dedent';

import { CenoteService, MoFService } from '../services';
import {
    AccessLevel,
    CenoteType,
    Issue,
    Theme,
    User,
} from '../model/documents';

const cenoteSchema = Joi.object({
    _key: Joi.string(),
    type: Joi.string().allow(...Object.keys(CenoteType)),
    name: Joi.string(),
    touristic: Joi.boolean(),
    issues: Joi.array().items(Joi.string().allow(...Object.keys(Issue))),
    alternativeNames: Joi.array().items(Joi.string()),
    geojson: Joi.object({
        geometry: Joi.object({
            type: 'Point',
            coordinates: [Joi.number(), Joi.number()],
        }),
        type: 'Feature',
        properties: Joi.object({}),
    }),
    // TODO: Also allow returning the document properties?
    gadm: Joi.string(),
    social: Joi.object({
        totalComments: Joi.number(),
        rating: Joi.number().optional(),
    }),
    createdAt: Joi.string().isoDate(),
    updatedAt: Joi.string().isoDate(),
});
const variableSchema = Joi.object({
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
// TODO: Implement comment bucket schema
const commentBucketSchema = Joi.object({});

export default (): Foxx.Router => {
    const router = createRouter();

    // TODO: Test this
    // TODO: Error handling
    router
        .get((req, res) => {
            let user: User | null = null;
            let limit: number | undefined = undefined;
            let continuationToken: string | undefined = undefined;
            if (req.session && req.session.data)
                user = new User(req.session.data);
            if (req.queryParams.limit) limit = Number(req.queryParams.limit);
            if (req.queryParams.continuationToken)
                continuationToken = req.queryParams.continuationToken;
            res.send(CenoteService.listCenotes(user, limit, continuationToken));
        })
        .summary('Get cenotes')
        .description(
            'Allows pagination of cenotes with limit and continuation tokens.',
        )
        .response(
            'ok',
            Joi.object({
                data: Joi.array().items(cenoteSchema).required(),
                hasMore: Joi.boolean().required(),
                continuationToken: Joi.string().required(),
            }).required(),
            ['application/json'],
            'The cenotes requested, a continuation token and a hasMore flag to allow incremental fetching.',
        );

    // TODO: Test this
    // TODO: Error handling
    router
        .get(':_key', (req, res) => {
            let user: User | null = null;
            if (req.session && req.session.data)
                user = new User(req.session.data);
            res.send(CenoteService.getCenote(user, req.pathParams._key));
        })
        .summary('Get a cenote by key')
        .description('Get information about a cenote by key.')
        .response(
            'ok',
            cenoteSchema.required(),
            ['application/json'],
            'The cenote requested.',
        );

    // TODO: Test this
    // TODO: Error handling
    router
        .put(':_key', (req, res) => {
            let user: User | null = null;
            if (req.session && req.session.data)
                user = new User(req.session.data);
            res.send(
                CenoteService.updateCenote(user, req.pathParams._key, req.body),
            );
        })
        .body(cenoteSchema.required(), 'The cenote data to update.')
        .summary('Update a cenote.')
        .description('Updates information about a cenote by key.')
        .response(
            'ok',
            cenoteSchema.required(),
            ['application/json'],
            'The updated cenote.',
        );

    // TODO: Test this
    // TODO: Error handling
    router
        .delete(':_key', (req, res) => {
            let user: User | null = null;
            if (req.session && req.session.data)
                user = new User(req.session.data);
            CenoteService.deleteCenote(user, req.pathParams._key);
        })
        .summary('Remove a cenote.')
        .description('Removes information about a cenote by key.')
        .response(
            'no content',
            'No data is returned by calls to this endpoint.',
        );

    // TODO: Test this
    // TODO: Error handling
    router
        .get('csv', (req, res) => {
            let user: User | null = null;
            if (req.session && req.session.data)
                user = new User(req.session.data);
            res.send(CenoteService.toCsv(user));
        })
        .summary('Get cenotes in CSV format.')
        .description(
            'Returns all cenotes the user has access to in CSV format.',
        )
        .response('ok', ['text/csv'], 'The cenotes in CSV format.');

    // TODO: Test this
    // TODO: Error handling
    router
        .put('csv', (req, res) => {
            let user: User | null = null;
            if (req.session && req.session.data)
                user = new User(req.session.data);
            res.send({
                data: CenoteService.fromCsv(user, req.body.toString()),
            });
        })
        .body(['text/csv'], 'The cenote data to upload in CSV format.')
        .summary('Upload cenote information in CSV format.')
        .description(
            dd`
            Upload cenote information in CSV format.
            Cenotes will be updated when a matching key is found and created otherwise.
            `,
        )
        .response(
            'ok',
            Joi.object({
                data: Joi.array().items(cenoteSchema).required(),
            }).required(),
            ['application/json'],
            'The uploaded cenote information in JSON format.',
        );

    // TODO: Test this
    // TODO: Error handling
    router
        .get(':_key/data/:theme', (req, res) => {
            let user: User | null = null;
            if (req.session && req.session.data)
                user = new User(req.session.data);
            res.send(
                MoFService.getData(
                    user,
                    req.pathParams._key,
                    req.pathParams.theme,
                ),
            );
        })
        .summary('Get measurements or facts of a theme for a specific cenote')
        .description(
            'Returns all variables and corresponding values for a specific theme and cenote',
        )
        .response(
            'ok',
            Joi.object().pattern(
                Joi.string(),
                Joi.object({
                    variable: variableSchema.required(),
                    values: Joi.array()
                        .items(
                            Joi.object({
                                createdAt: Joi.string().isoDate(),
                                value: Joi.any(),
                            }).required(),
                        )
                        .required(),
                }).required(),
            ),
            ['application/json'],
            'All variables and corresponding values sorted by timestamp from most recent to oldest.',
        );

    // TODO: Test this
    // TODO: Error handling
    // TODO: Fix bucket pattern
    router
        .get(':_key/comments', (req, res) => {
            let user: User | null = null;
            if (req.session && req.session.data)
                user = new User(req.session.data);
            res.send(CenoteService.listComments(user, req.pathParams._key));
        })
        .summary('Get comments for a specific cenote')
        .description('Gets all comments for a specific cenote')
        .response(
            'ok',
            commentBucketSchema.required(),
            ['application/json'],
            'All comments for the specified cenote.',
        );

    // TODO: Test this
    // TODO: Error handling
    router
        .get('bounds', (req, res) => {
            res.send(CenoteService.getBounds());
        })
        .summary('Get latitude and longitude bounds')
        .description(
            'Returns the minimum and maximum latitude and longitude for all cenotes in the database.',
        )
        .response(
            'ok',
            Joi.object({
                min: Joi.object({
                    lat: Joi.number().required(),
                    lng: Joi.number().required(),
                }).required(),
                max: Joi.object({
                    lat: Joi.number().required(),
                    lng: Joi.number().required(),
                }).required(),
            }),
            ['application/json'],
            'The latitude and longitude boundaries of all cenotes in the database',
        );

    return router;
};
