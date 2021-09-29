import createRouter from '@arangodb/foxx/router';
import Joi from 'joi';
import { User } from '../model/documents';
import { UserService } from '../services';
import { UserSchema } from '../model/schema';

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
            res.send(UserService.listUsers(user, limit, continuationToken));
        })
        .summary('Get users')
        .description('Fetches all known users.')
        .response(
            'ok',
            Joi.array().items(UserSchema).required(),
            ['application/json'],
            'All users',
        );

    // TODO: Test this
    // TODO: Error handling
    router
        .get(':_key', (req, res) => {
            let user: User | null = null;
            if (req.session && req.session.data)
                user = new User(req.session.data);
            res.send(UserService.getUser(user, req.pathParams._key));
        })
        .summary('Get a user by key')
        .description('Fetches a specific user by key.')
        .response(
            'ok',
            UserSchema.required(),
            ['application/json'],
            'The user requested',
        );

    // TODO: Test this
    // TODO: Error handling
    router
        .put(':_key', (req, res) => {
            let user: User | null = null;
            if (req.session && req.session.data)
                user = new User(req.session.data);
            UserService.updateUser(user, req.pathParams._key, req.body);
        })
        .body(UserSchema.required(), 'The user data to update.')
        .summary('Update a user.')
        .description('Updates information about a user by key.')
        .response(
            'ok',
            UserSchema.required(),
            ['application/json'],
            'The updated user.',
        );

    // TODO: Test this
    // TODO: Error handling
    router
        .delete(':_key', (req, res) => {
            let user: User | null = null;
            if (req.session && req.session.data)
                user = new User(req.session.data);
            UserService.deleteUser(user, req.pathParams._key);
        })
        .summary('Remove a user.')
        .description('Removes information about a user by key.')
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
            res.send(UserService.toCsv(user));
        })
        .summary('Get users in CSV format.')
        .description('Returns all users the user has access to in CSV format.')
        .response('ok', ['text/csv'], 'The species in CSV format.');

    return router;
};
