import { context } from '@arangodb/locals';
import createRouter from '@arangodb/foxx/router';
import passport from 'passport';
import LocalStrategy from 'passport-local';

import createRESTRouter from './rest';
import { UserService } from './services/UserService';

// Configure type-arango model
import * as Model from './model';
Model.complete();

// Configure Passport authentication as middleware
passport.use(
    LocalStrategy(
        {
            usernameField: 'email',
        },
        UserService.passportVerifyLocal,
    ),
);

context.use(passport.initialize());
context.use(passport.session());

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
