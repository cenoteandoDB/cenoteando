import createRouter from '@arangodb/foxx/router';

import { ReferenceService } from '../services';
import { User } from '../model/documents';

export default (): Foxx.Router => {
    const router = createRouter();

    // TODO: Documentation
    // TODO: Test this
    // TODO: Error handling
    router.get((req, res) => {
        let user: User | null = null;
        if (req.session && req.session.data) user = new User(req.session.data);
        res.send(ReferenceService.getReferences(user));
    });

    // TODO: Documentation
    // TODO: Test this
    // TODO: Error handling
    router.get(':_key', (req, res) => {
        let user: User | null = null;
        if (req.session && req.session.data) user = new User(req.session.data);
        res.send(ReferenceService.getReferenceByKey(user, req.pathParams._key));
    });

    // TODO: Documentation
    // TODO: Test this
    // TODO: Error handling
    router.put(':_key', (req, res) => {
        let user: User | null = null;
        if (req.session && req.session.data) user = new User(req.session.data);
        ReferenceService.updateReference(
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
        ReferenceService.deleteReference(user, req.pathParams._key);
    });

    // TODO: Documentation
    // TODO: Test this
    // TODO: Error handling
    router.get('csv', (req, res) => {
        let user: User | null = null;
        if (req.session && req.session.data) user = new User(req.session.data);
        res.send(ReferenceService.toCsv(user));
    });

    // TODO: Documentation
    // TODO: Test this
    // TODO: Error handling
    router.put('csv', (req, res) => {
        let user: User | null = null;
        if (req.session && req.session.data) user = new User(req.session.data);
        res.send(ReferenceService.fromCsv(user, req.body.toString()));
    });

    return router;
};
