import createRouter from '@arangodb/foxx/router';
import { Joi } from 'type-arango';
import dd from 'dedent';

import { SpeciesService } from '../services';
import { User } from '../model/documents';

const speciesSchema = Joi.object({
    _key: Joi.string(),
    aphiaId: Joi.string(),
    iNaturalistId: Joi.string(),
    createdAt: Joi.string().isoDate(),
    updatedAt: Joi.string().isoDate(),
});

export default (): Foxx.Router => {
    const router = createRouter();

    // TODO: Test this
    // TODO: Error handling
    router
        .get((req, res) => {
            let user: User | null = null;
            if (req.session && req.session.data)
                user = new User(req.session.data);
            res.send(SpeciesService.getSpecies(user));
        })
        .summary('Get species')
        .description('Fetches all known species.')
        .response(
            'ok',
            Joi.array().items(speciesSchema).required(),
            ['application/json'],
            'All species',
        );

    // TODO: Test this
    // TODO: Error handling
    router
        .get(':_key', (req, res) => {
            let user: User | null = null;
            if (req.session && req.session.data)
                user = new User(req.session.data);
            res.send(SpeciesService.getSpeciesByKey(user, req.pathParams._key));
        })
        .summary('Get a species by key')
        .description('Fetches a specific species by key.')
        .response(
            'ok',
            speciesSchema.required(),
            ['application/json'],
            'The species requested',
        );

    // TODO: Test this
    // TODO: Error handling
    router
        .put(':_key', (req, res) => {
            let user: User | null = null;
            if (req.session && req.session.data)
                user = new User(req.session.data);
            res.send(
                SpeciesService.updateSpecies(
                    user,
                    req.pathParams._key,
                    JSON.parse(req.body),
                ),
            );
        })
        .body(speciesSchema.required(), 'The species data to update.')
        .summary('Update a species.')
        .description('Updates information about a species by key.')
        .response(
            'ok',
            speciesSchema.required(),
            ['application/json'],
            'The updated species.',
        );

    // TODO: Test this
    // TODO: Error handling
    router
        .delete(':_key', (req, res) => {
            let user: User | null = null;
            if (req.session && req.session.data)
                user = new User(req.session.data);
            SpeciesService.deleteSpecies(user, req.pathParams._key);
        })
        .summary('Remove a species.')
        .description('Removes information about a species by key.')
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
            res.send(SpeciesService.toCsv(user));
        })
        .summary('Get species in CSV format.')
        .description(
            'Returns all species the user has access to in CSV format.',
        )
        .response('ok', ['text/csv'], 'The species in CSV format.');

    // TODO: Test this
    // TODO: Error handling
    router
        .put('csv', (req, res) => {
            let user: User | null = null;
            if (req.session && req.session.data)
                user = new User(req.session.data);
            res.send(SpeciesService.fromCsv(user, req.body.toString()));
        })
        .body(['text/csv'], 'The species data to upload in CSV format.')
        .summary('Upload species information in CSV format.')
        .description(
            dd`
            Upload species information in CSV format.
            species will be updated when a matching key is found and created otherwise.
            `,
        )
        .response(
            'ok',
            Joi.object({
                data: Joi.array().items(speciesSchema).required(),
            }).required(),
            ['application/json'],
            'The uploaded species information in JSON format.',
        );

    return router;
};
