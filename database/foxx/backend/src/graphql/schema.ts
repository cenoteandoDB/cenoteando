import { makeExecutableSchema } from '@graphql-tools/schema';
import { gql } from 'graphql-tag';
import {
    typeDefs as ScalarTypeDefs,
    resolvers as scalarResolvers,
} from 'graphql-scalars';
import GeoJSON from 'graphql-geojson';

import { CenoteTypeDefs, CenoteResolvers } from './Cenote';

const rootTypeDefs = gql`
    scalar GeoJSON

    schema {
        query: Query
        mutation: Mutation
    }

    type Query {
        """
        Always returns true
        Required because empty types are not allowed
        """
        _test: Boolean
    }

    type Mutation {
        """
        Always returns true
        Required because empty types are not allowed
        """
        _test: Boolean
    }
`;

const rootResolvers = {
    Query: {
        _test: () => true,
    },
    Mutation: {
        _test: () => true,
    },
    GeoJSON,
};

export const schema = makeExecutableSchema({
    typeDefs: [rootTypeDefs, ...ScalarTypeDefs, CenoteTypeDefs],
    resolvers: [rootResolvers, scalarResolvers, CenoteResolvers],
});
