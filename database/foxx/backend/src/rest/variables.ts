import createRouter from '@arangodb/foxx/router';
import Joi from 'joi';
import dd from 'dedent';

import { VariableService } from '../services';
import { User, Variable } from '../model/documents';
import { VariableSchema } from '../model/schema';

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
            res.send(
                VariableService.listVariables(user, limit, continuationToken),
            );
        })
        .summary('Get variables')
        .description(
            'Allows pagination of variables with limit and continuation tokens.',
        )
        .response(
            'ok',
            Joi.object({
                data: Joi.array().items(VariableSchema).required(),
                hasMore: Joi.boolean().required(),
                continuationToken: Joi.string().required(),
            }).required(),
            ['application/json'],
            'The variables requested, a continuation token and a hasMore flag to allow incremental fetching.',
        );

    // TODO: Test this
    // TODO: Error handling
    router
        .get(':_key', (req, res) => {
            let user: User | null = null;
            if (req.session && req.session.data)
                user = new User(req.session.data);
            res.send(VariableService.getVariable(user, req.pathParams._key));
        })
        .summary('Get a variable by key')
        .description('Get information about a variable by key.')
        .response(
            'ok',
            VariableSchema.required(),
            ['application/json'],
            'The variable requested.',
        );

    router
        .post((req, res) => {
            let user: User | null = null;
            if (req.session && req.session.data)
                user = new User(req.session.data);
            res.send(VariableService.createVariable(user, req.body));
        })
        .body(VariableSchema.required(), 'The variable data to create.')
        .summary('Create a variable.')
        .description('Creates variable with information given.')
        .response(
            'created',
            VariableSchema.required(),
            ['application/json'],
            'The created variable.',
        );

    // TODO: Test this
    // TODO: Error handling
    router
        .put(':_key', (req, res) => {
            let user: User | null = null;
            if (req.session && req.session.data)
                user = new User(req.session.data);
            VariableService.updateVariable(user, req.pathParams._key, req.body);
        })
        .body(VariableSchema.required(), 'The variable data to update.')
        .summary('Update a variable.')
        .description('Updates information about a variable by key.')
        .response(
            'ok',
            VariableSchema.required(),
            ['application/json'],
            'The updated variable.',
        );

    // TODO: Test this
    // TODO: Error handling
    router
        .delete(':_key', (req, res) => {
            let user: User | null = null;
            if (req.session && req.session.data)
                user = new User(req.session.data);
            VariableService.deleteVariable(user, req.pathParams._key);
        })
        .summary('Remove a variable.')
        .description('Removes information about a variable by key.')
        .response(
            'no content',
            'No data is returned by calls to this endpoint.',
        );

    // TODO: Documentation
    // TODO: Test this
    // TODO: Error handling
    router
        .get('csv', (req, res) => {
            let user: User | null = null;
            if (req.session && req.session.data)
                user = new User(req.session.data);
            res.send(VariableService.toCsv(user));
        })
        .summary('Get variables in CSV format.')
        .description(
            'Returns all variables the user has access to in CSV format.',
        )
        .response('ok', ['text/csv'], 'The variables in CSV format.');

    // TODO: Documentation
    // TODO: Test this
    // TODO: Error handling
    router
        .put('csv', (req, res) => {
            let user: User | null = null;
            if (req.session && req.session.data)
                user = new User(req.session.data);
            const result: Readonly<Variable>[] = [];
            req.body.forEach((data) => {
                // TODO: REMOVE THIS
                console.log(data);
                console.log(JSON.stringify(data));
                result.concat(VariableService.fromCsv(user, data.data));
            });
            res.send(result);
        })
        .body(
            ['multipart/form-data'],
            'The CSV files with variable data to upload.',
        )
        .summary('Upload variable information in CSV format.')
        .description(
            dd`
            Upload variable information in CSV format.
            Variables will be updated when a matching key is found and created otherwise.
            `,
        )
        .response(
            'ok',
            Joi.object({
                data: Joi.array().items(VariableSchema).required(),
            }).required(),
            ['application/json'],
            'The uploaded variable information in JSON format.',
        );

    return router;
};
