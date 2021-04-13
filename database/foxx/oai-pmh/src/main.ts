import { oai } from './controller';
import { context } from '@arangodb/locals';
import createRouter from '@arangodb/foxx/router';
import Joi from 'joi';

const router = createRouter();

// TODO: Query Parameters
router
    .get('/request', oai, 'OAI-PMH Request')
    .queryParam(
        'verb',
        Joi.string()
            .valid(
                'Identify',
                'ListMetadataFormats',
                'ListIdentifiers',
                'ListRecords',
                'ListSets',
                'GetRecord',
            )
            .required(),
        'The OAI-PMH request verb',
    )
    .queryParam(
        'identifier',
        Joi.string().optional(),
        'The OAI-PMH record unique identifier',
    )
    .queryParam(
        'metadataPrefix',
        Joi.string().optional(),
        'The metadata format prefix',
    )
    .queryParam(
        'from',
        Joi.string().optional(),
        'A UTCdatetime value, which specifies a lower bound for datestamp-based selective harvesting.',
    )
    .queryParam(
        'until',
        Joi.string().optional(),
        'a UTCdatetime value, which specifies a upper bound for datestamp-based selective harvesting.',
    )
    // TODO: Implement sets
    .queryParam(
        'set',
        Joi.string().optional(),
        ' A setSpec value , which specifies set criteria for selective harvesting.',
    )
    // TODO: Implement resumption tokens
    .queryParam(
        'resumptionToken',
        Joi.string().optional(),
        'A value that is the flow control token returned by a previous request that issued an incomplete list.',
    )
    .response(
        'ok',
        ['text/xml'],
        'The response to the request specified in the "verb" param',
    )
    .summary('Endpoint for OAI_PMH requests')
    .description(
        'Responds to Identify, ListMetadataFormats, ListIdentifiers, ListRecords, ListSets and GetRecord requests',
    );

router
    .post('/request', oai, 'OAI-PMH Request')
    .queryParam(
        'verb',
        Joi.string()
            .valid(
                'Identify',
                'ListMetadataFormats',
                'ListIdentifiers',
                'ListRecords',
                'ListSets',
                'GetRecord',
            )
            .required(),
        'The OAI-PMH request verb',
    )
    .queryParam(
        'identifier',
        Joi.string().optional(),
        'The OAI-PMH record unique identifier',
    )
    .queryParam(
        'metadataPrefix',
        Joi.string().optional(),
        'The metadata format prefix',
    )
    .queryParam(
        'from',
        Joi.string().optional(),
        'A UTCdatetime value, which specifies a lower bound for datestamp-based selective harvesting.',
    )
    .queryParam(
        'until',
        Joi.string().optional(),
        'a UTCdatetime value, which specifies a upper bound for datestamp-based selective harvesting.',
    )
    // TODO: Implement sets
    .queryParam(
        'set',
        Joi.string().optional(),
        ' A setSpec value , which specifies set criteria for selective harvesting.',
    )
    // TODO: Implement resumption tokens
    .queryParam(
        'resumptionToken',
        Joi.string().optional(),
        'A value that is the flow control token returned by a previous request that issued an incomplete list.',
    )
    .response(
        'ok',
        ['text/xml'],
        'The response to the request specified in the "verb" param',
    )
    .summary('Endpoint for OAI_PMH requests')
    .description(
        'Responds to Identify, ListMetadataFormats, ListIdentifiers, ListRecords, ListSets and GetRecord requests',
    );

context.use(router);
