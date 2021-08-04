import createRouter from '@arangodb/foxx/router';
import createAuthRouter from './auth';
import createCenotesRouter from './cenotes';
import createUsersRouter from './users';
import createGADMRouter from './gadm';

export default function (): Foxx.Router {
    const router = createRouter();

    router.use('/auth', createAuthRouter());
    router.use('/cenotes', createCenotesRouter());
    router.use('/users', createUsersRouter());
    router.use('/gadm', createGADMRouter());
    // TODO: Create /variables route

    return router;
}
