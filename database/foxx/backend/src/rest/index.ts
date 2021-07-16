import createRouter from '@arangodb/foxx/router';
import createAuthRouter from './auth'

export default function (passport): Foxx.Router {
    const router = createRouter();

    router.use('/auth', createAuthRouter(passport));
    // router.use('/cenotes', cenotesRouter);
    // router.use('/users', usersRouter);

    return router;
}
