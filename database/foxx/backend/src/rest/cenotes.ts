import createRouter from '@arangodb/foxx/router';

import { CenoteService, SocialService } from '../services';
import { User } from '../model/documents';
import { MoFService } from '../services/MoFService';

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
        res.send(CenoteService.listCenotes(user, limit, continuationToken));
    });

    // TODO: Documentation
    // TODO: Test this
    // TODO: Error handling
    router.get(':_key', (req, res) => {
        let user: User | null = null;
        if (req.session && req.session.data) user = new User(req.session.data);
        res.send(CenoteService.getCenote(user, req.pathParams._key));
    });

    // TODO: Documentation
    // TODO: Test this
    // TODO: Error handling
    router.put(':_key', (req, res) => {
        let user: User | null = null;
        if (req.session && req.session.data) user = new User(req.session.data);
        CenoteService.updateCenote(
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
        CenoteService.deleteCenote(user, req.pathParams._key);
    });

    // TODO: Documentation
    // TODO: Test this
    // TODO: Error handling
    router.get('csv', (req, res) => {
        let user: User | null = null;
        if (req.session && req.session.data) user = new User(req.session.data);
        res.send(CenoteService.toCsv(user));
    });

    // TODO: Documentation
    // TODO: Test this
    // TODO: Error handling
    router.put('csv', (req, res) => {
        let user: User | null = null;
        if (req.session && req.session.data) user = new User(req.session.data);
        CenoteService.fromCsv(user, req.body);
    });

    // TODO: Documentation
    // TODO: Test this
    // TODO: Error handling
    router.get(':_key/data/:theme', (req, res) => {
        let user: User | null = null;
        if (req.session && req.session.data) user = new User(req.session.data);
        res.send(
            MoFService.getData(user, req.pathParams._key, req.pathParams.theme),
        );
    });

    // TODO: Documentation
    // TODO: Test this
    // TODO: Error handling
    router.get(':_key/comments', (req, res) => {
        let user: User | null = null;
        let limit: number | undefined = undefined;
        let continuationToken: string | undefined = undefined;
        if (req.session && req.session.data) user = new User(req.session.data);
        if (req.queryParams.limit) limit = req.queryParams.limit;
        if (req.queryParams.continuationToken)
            continuationToken = req.queryParams.continuationToken;
        res.send(
            SocialService.listComments(
                user,
                req.pathParams._key,
                limit,
                continuationToken,
            ),
        );
    });

    // TODO: Documentation
    // TODO: Test this
    // TODO: Error handling
    router.get('bounds', (req, res) => {
        res.send(CenoteService.getBounds());
    });

    return router;
};
