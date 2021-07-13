import { context } from '@arangodb/locals';
import createGraphQLRouter from '@arangodb/foxx/graphql';
import graphql from 'graphql-tools';
import { schema } from './graphql/schema';

// TODO: REMOVE THIS
console.log(
    `this is the supposed schema's constructor: ${schema.constructor.name}`,
);

// Import the entities before creating the routes
import * as Model from './model';

Model.complete();

// Create GraphQL Router
context.use(
    createGraphQLRouter({
        schema,
        graphiql: true,
        graphql,
    }),
);

export * from './services';
