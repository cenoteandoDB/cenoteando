import createRouter from '@arangodb/foxx/router';
import { User } from '../model/documents';
import { UserService } from '../services';

export default (): Foxx.Router => {
    const router = createRouter();

    // TODO: Documentation
    // TODO: Test this
    // TODO: Error handling
    router.get((req, res) => {
        let user: User | null = null;
        let limit: number | undefined = undefined;
        let continuationToken: string | undefined = undefined;
        if (req.session && req.session.data) user = new User(req.session.data);
        if (req.queryParams.limit) limit = Number(req.queryParams.limit);
        if (req.queryParams.continuationToken)
            continuationToken = req.queryParams.continuationToken;
        res.send(UserService.listUsers(user, limit, continuationToken));
    });

    // TODO: Documentation
    // TODO: Test this
    // TODO: Error handling
    router.get(':_key', (req, res) => {
        let user: User | null = null;
        if (req.session && req.session.data) user = new User(req.session.data);
        res.send(UserService.getUser(user, req.pathParams._key));
    });

    // TODO: Documentation
    // TODO: Test this
    // TODO: Error handling
    router.put(':_key', (req, res) => {
        let user: User | null = null;
        if (req.session && req.session.data) user = new User(req.session.data);
        UserService.updateUser(user, req.pathParams._key, JSON.parse(req.body));
    });

    // TODO: Documentation
    // TODO: Test this
    // TODO: Error handling
    router.delete(':_key', (req, res) => {
        let user: User | null = null;
        if (req.session && req.session.data) user = new User(req.session.data);
        UserService.deleteUser(user, req.pathParams._key);
    });

    // TODO: Documentation
    // TODO: Test this
    // TODO: Error handling
    router.get('csv', (req, res) => {
        let user: User | null = null;
        if (req.session && req.session.data) user = new User(req.session.data);
        res.send(UserService.toCsv(user));
    });

    return router;
};
