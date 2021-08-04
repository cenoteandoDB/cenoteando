import { context } from '@arangodb/locals';
import sessionsMiddleware from '@arangodb/foxx/sessions';
import jwtStorage from '@arangodb/foxx/sessions/storages/jwt';

import createRESTRouter from './rest';

// Configure type-arango model
import * as Model from './model';
Model.complete();

context.use(
    sessionsMiddleware({
        // TODO: Get secret fromm config file
        storage: jwtStorage('SUPER SECRET!'),
        transport: 'header',
    }),
);

// Create REST Router
context.use(createRESTRouter());

/*
TODO: Try to implement GraphQL
    Error: "Schema must be an instance of GraphQLSchema. Also ensure that there are not multiple versions of GraphQL installed in your node_modules directory."
    But schema is an instance of GraphQLSchema and no alternative versions of GraphQL seem to be installed by any dependency.

import createGraphQLRouter from '@arangodb/foxx/graphql';
import graphql from 'graphql';

import { schema } from './graphql/schema';

// Create GraphQL Router
context.use(
    createGraphQLRouter({
        schema,
        graphiql: true,
        graphql,
    }),
);

*/

export * from './services';
