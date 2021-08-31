import createRouter from '@arangodb/foxx/router';

import { SpeciesService } from '../services';
import { User } from '../model/documents';

export default (): Foxx.Router => {
    const router = createRouter();

    // TODO: Documentation
    // TODO: Test this
    // TODO: Error handling
    router.get((req, res) => {
        let user: User | null = null;
        if (req.session && req.session.data) user = new User(req.session.data);
        res.send(SpeciesService.getSpecies(user));
    });

    // TODO: Documentation
    // TODO: Test this
    // TODO: Error handling
    router.get(':_key', (req, res) => {
        let user: User | null = null;
        if (req.session && req.session.data) user = new User(req.session.data);
        res.send(SpeciesService.getSpeciesByKey(user, req.pathParams._key));
    });

    // TODO: Documentation
    // TODO: Test this
    // TODO: Error handling
    router.put(':_key', (req, res) => {
        let user: User | null = null;
        if (req.session && req.session.data) user = new User(req.session.data);
        SpeciesService.updateSpecies(
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
        SpeciesService.deleteSpecies(user, req.pathParams._key);
    });

    // TODO: Documentation
    // TODO: Test this
    // TODO: Error handling
    router.get('csv', (req, res) => {
        let user: User | null = null;
        if (req.session && req.session.data) user = new User(req.session.data);
        res.send(SpeciesService.toCsv(user));
    });

    // TODO: Documentation
    // TODO: Test this
    // TODO: Error handling
    router.put('csv', (req, res) => {
        let user: User | null = null;
        if (req.session && req.session.data) user = new User(req.session.data);
        res.send(SpeciesService.fromCsv(user, req.body.toString()));
    });

    return router;
};
