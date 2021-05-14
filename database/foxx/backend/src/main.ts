import { createRoutes } from 'type-arango';
import { context } from '@arangodb/locals';
import jwtStorage from '@arangodb/foxx/sessions/storages/jwt';
import sessionsMiddleware from '@arangodb/foxx/sessions';

import createRouter from '@arangodb/foxx/router';

context.use(
    sessionsMiddleware({
        // TODO: Check how to handle this properly
        storage: jwtStorage('CENOTEANDO_SECRET'),
        transport: 'header',
    }),
);
// Import the entities before creating the routes
import * as Model from './model';
Model.complete();

// Derive the routes from your entities after they have been decorated and export the router to Foxx
context.use(createRoutes(createRouter()));

module.exports._Documents = Model._Documents;
module.exports._Collections = Model._Collections;
