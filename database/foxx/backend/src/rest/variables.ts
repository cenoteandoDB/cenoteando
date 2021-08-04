import createRouter from '@arangodb/foxx/router';

import { VariableService } from '../services';
import { User } from '../model/documents';

export default (): Foxx.Router => {
    const router = createRouter();

    // TODO: Documentation
    // TODO: Test this
    router.get((req, res) => {
        let user: User | null = null;
        let limit: number | undefined = undefined;
        let continuationToken: string | undefined = undefined;
        if (req.session && req.session.data) user = new User(req.session.data);
        if (req.queryParams.limit) limit = req.queryParams.limit;
        if (req.queryParams.continuationToken)
            continuationToken = req.queryParams.continuationToken;
        res.send(VariableService.listVariables(user, limit, continuationToken));
    });

    // TODO: Documentation
    // TODO: Test this
    router.get(':_key', (req, res) => {
        let user: User | null = null;
        if (req.session && req.session.data) user = new User(req.session.data);
        res.send(VariableService.getVariable(user, req.pathParams._key));
    });

    // TODO: Documentation
    // TODO: Test this
    router.get('csv', (req, res) => {
        let user: User | null = null;
        if (req.session && req.session.data) user = new User(req.session.data);
        res.send(VariableService.csv(user));
    });

    return router;
};
