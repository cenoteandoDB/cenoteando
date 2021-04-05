import { oai } from './controller';
import { context } from '@arangodb/locals';
import createRouter from '@arangodb/foxx/router';
import Joi from 'joi';

const router = createRouter();

// TODO: Query Parameters
// TODO: Convert Joi to set
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
        ' GetRecord',
      )
      .required(),
    'The OAI-PMH request verb',
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
        ' GetRecord',
      )
      .required(),
    'The OAI-PMH request verb',
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
