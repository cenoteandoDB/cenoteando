import createRouter from '@arangodb/foxx/router';

import { CenoteService } from '../services';
import { User } from '../model/documents';

export default (): Foxx.Router => {
    const router = createRouter();

    // TODO: Documentation
    // TODO: Test this
    router.get((req, res) => {
        let user: User | null = null;
        let limit: number | undefined = undefined;
        let continuationToken: string | undefined = undefined;
        if (req.session && req.session.data) user = req.session.data;
        if (req.queryParams.limit) limit = req.queryParams.limit;
        if (req.queryParams.continuationToken)
            continuationToken = req.queryParams.continuationToken;
        res.send(CenoteService.listCenotes(user, limit, continuationToken));
    });

    // TODO: Documentation
    // TODO: Test this
    router.get(':_key', (req, res) => {
        let user: User | null = null;
        if (req.session && req.session.data) user = req.session.data;
        // TODO: Implement limit & continuation token as query params
        res.send(CenoteService.getCenote(user, req.pathParams._key));
    });

    // TODO: Documentation
    // TODO: Test this
    router.get('bounds', (req, res) => {
        res.send(CenoteService.getBounds());
    });

    return router;
};
