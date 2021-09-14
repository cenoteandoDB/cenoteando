import createRouter from '@arangodb/foxx/router';

import { VariableService } from '../services';
import { User } from '../model/documents';

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
        res.send(VariableService.listVariables(user, limit, continuationToken));
    });

    // TODO: Documentation
    // TODO: Test this
    // TODO: Error handling
    router.get(':_key', (req, res) => {
        let user: User | null = null;
        if (req.session && req.session.data) user = new User(req.session.data);
        res.send(VariableService.getVariable(user, req.pathParams._key));
    });

    // TODO: Documentation
    // TODO: Test this
    // TODO: Error handling
    router.put(':_key', (req, res) => {
        let user: User | null = null;
        if (req.session && req.session.data) user = new User(req.session.data);
        VariableService.updateVariable(
            user,
            req.pathParams._key,
            JSON.parse(req.body),
        );
    });

    // TODO: Documentation
    // TODO: Test this
    // TODO: Error handling
    router.delete(':_key', (req, res) => {
        let user: User | null = null;
        if (req.session && req.session.data) user = new User(req.session.data);
        VariableService.deleteVariable(user, req.pathParams._key);
    });

    // TODO: Documentation
    // TODO: Test this
    // TODO: Error handling
    router.get('csv', (req, res) => {
        let user: User | null = null;
        if (req.session && req.session.data) user = new User(req.session.data);
        res.send(VariableService.toCsv(user));
    });

    // TODO: Documentation
    // TODO: Test this
    // TODO: Error handling
    router.put('csv', (req, res) => {
        let user: User | null = null;
        if (req.session && req.session.data) user = new User(req.session.data);
        res.send(VariableService.fromCsv(user, req.body.toString()));
    });

    return router;
};
