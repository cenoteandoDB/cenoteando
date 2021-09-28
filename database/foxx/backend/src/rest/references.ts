import createRouter from '@arangodb/foxx/router';
import { Joi } from 'type-arango';
import dd from 'dedent';

import { ReferenceService } from '../services';
import { ReferenceType, User } from '../model/documents';

const referenceSchema = Joi.object({
    _key: Joi.string(),
    authors: Joi.string(),
    fileName: Joi.string(),
    reference: Joi.string(),
    shortName: Joi.string(),
    type: Joi.string().allow(...Object.keys(ReferenceType)),
    year: Joi.string(),
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
            res.send(ReferenceService.getReferences(user));
        })
        .summary('Get References')
        .description('Fetches all known references.')
        .response(
            'ok',
            Joi.array().items(referenceSchema).required(),
            ['application/json'],
            'All references',
        );

    // TODO: Test this
    // TODO: Error handling
    router
        .get(':_key', (req, res) => {
            let user: User | null = null;
            if (req.session && req.session.data)
                user = new User(req.session.data);
            res.send(
                ReferenceService.getReferenceByKey(user, req.pathParams._key),
            );
        })
        .summary('Get a reference by key')
        .description('Fetches a specific reference by key.')
        .response(
            'ok',
            referenceSchema.required(),
            ['application/json'],
            'The reference requested',
        );

    // TODO: Test this
    // TODO: Error handling
    router
        .put(':_key', (req, res) => {
            let user: User | null = null;
            if (req.session && req.session.data)
                user = new User(req.session.data);
            res.send(
                ReferenceService.updateReference(
                    user,
                    req.pathParams._key,
                    req.body,
                ),
            );
        })
        .body(referenceSchema.required(), 'The reference data to update.')
        .summary('Update a reference.')
        .description('Updates information about a reference by key.')
        .response(
            'ok',
            referenceSchema.required(),
            ['application/json'],
            'The updated reference.',
        );

    // TODO: Test this
    // TODO: Error handling
    router
        .delete(':_key', (req, res) => {
            let user: User | null = null;
            if (req.session && req.session.data)
                user = new User(req.session.data);
            ReferenceService.deleteReference(user, req.pathParams._key);
        })
        .summary('Remove a reference.')
        .description('Removes information about a reference by key.')
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
            res.send(ReferenceService.toCsv(user));
        })
        .summary('Get references in CSV format.')
        .description(
            'Returns all references the user has access to in CSV format.',
        )
        .response('ok', ['text/csv'], 'The references in CSV format.');

    // TODO: Test this
    // TODO: Error handling
    router
        .put('csv', (req, res) => {
            let user: User | null = null;
            if (req.session && req.session.data)
                user = new User(req.session.data);
            res.send(ReferenceService.fromCsv(user, req.body.toString()));
        })
        .body(['text/csv'], 'The reference data to upload in CSV format.')
        .summary('Upload reference information in CSV format.')
        .description(
            dd`
            Upload references information in CSV format.
            References will be updated when a matching key is found and created otherwise.
            `,
        )
        .response(
            'ok',
            Joi.object({
                data: Joi.array().items(referenceSchema).required(),
            }).required(),
            ['application/json'],
            'The uploaded references information in JSON format.',
        );

    return router;
};
