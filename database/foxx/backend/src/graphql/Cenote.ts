import { gql } from 'graphql-tag';

import { CenoteService } from '../services';

// TODO: Documentation
export const CenoteTypeDefs = gql`
    enum CenoteType {
        NO_TYPE
        CENOTE
        DRY_CAVE
        WATER_WELL
        WATERY
    }

    enum Issue {
        GEOTAG_NOT_VERIFIED
    }

    type Social {
        totalComments: Int
        rating: Float
        # TODO: Add comments: [Comment]
    }

    type Cenote {
        type: CenoteType
        name: String
        touristic: Boolean
        issues: [Issue]!
        alternativeNames: [String]!
        geojson: GeoJSON
        gadm: GeoJSON
        social: Social
        createdAt: Date
        updatedAt: Date
    }

    type CenotePage {
        data: [Cenote!]!
        hasMore: Boolean!
        continuatuionToken: String
    }

    extend type Query {
        listCenotes(limit: Int, continuationToken: String): CenotePage
        getCenote(_key: String): Cenote
    }
`;

export const CenoteResolvers = {
    Query: {
        listCenotes,
        getCenote,
    },
};

function listCenotes(obj, args, context, info) {
    return CenoteService.listCenotes(
        context.user,
        args.limit,
        args.continuationToken,
    );
}

function getCenote(obj, args, context, info) {
    return CenoteService.getCenote(context.user, args._key);
}

/*
TODO: Implement this
    function createCenote(data: ???) {}
    function updateCenote(_key: string, data: ???) {}
    function deleteCenote(_key: string) {}
*/
