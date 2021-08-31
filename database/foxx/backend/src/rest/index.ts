import createRouter from '@arangodb/foxx/router';
import createAuthRouter from './auth';
import createCenotesRouter from './cenotes';
import createUsersRouter from './users';
import createGADMRouter from './gadm';
import createVariablesRouter from './variables';
import createSpeciesRouter from './species';
import createReferencesRouter from './references';

export default function (): Foxx.Router {
    const router = createRouter();

    router.use('/auth', createAuthRouter());
    router.use('/cenotes', createCenotesRouter());
    router.use('/users', createUsersRouter());
    router.use('/gadm', createGADMRouter());
    router.use('/variables', createVariablesRouter());
    router.use('/species', createSpeciesRouter());
    router.use('/references', createReferencesRouter());

    return router;
}
