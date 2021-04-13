import {
  CoreOaiProvider,
  EXCEPTION_CODES,
  ExceptionParams,
  ListParameters,
  MetadataFormatParameters,
  RecordParameters,
} from './core/core-oai-provider';
import { generateException } from './core/oai-response';
import { factory } from './repository/data-repository';
import { Configuration } from './repository/configuration';
import { OpenaireMapper } from './repository/openaire-mapper';

/**
 * This is a CoreOaiProvider instance configured for the sample repository module.
 * Module configuration is provided via constructor parameters.
 * @type {CoreOaiProvider}
 */
const provider = new CoreOaiProvider(
  factory,
  new Configuration(),
  new OpenaireMapper(),
);

/**
 * This controller handles all OAI requests to the sample module.
 *
 * OAI exceptions that result from successful request processing are returned in
 * the Response with status code 200. The Promises will reject when unexpected
 * processing errors occur. These rejections are handled by returning an OAI
 * exception with a 500 status code. That seems to be the best approach
 * to exception handling, but might need to be revised if we learn otherwise.
 * @param {Request} req
 * @param {Response} res
 */
export const oai = (req: Foxx.Request, res: Foxx.Response): void => {
  res.set('Content-Type', 'text/xml');

  const exception: ExceptionParams = {
    baseUrl: req.protocol + '://' + req.get('host') + req.path,
  };

  switch (req.queryParams.verb) {
    case 'Identify':
      provider
        .identify(req.queryParams)
        .then((response) => {
          res.status('ok');
          res.send(response);
        })
        .catch((oaiError) => {
          res.status('internal server error');
          res.send(oaiError);
        });

      break;

    case 'ListMetadataFormats':
      provider
        .listMetadataFormats(req.queryParams as MetadataFormatParameters)
        .then((response) => {
          res.status('ok');
          res.send(response);
        })
        .catch((oaiError) => {
          res.status('internal server error');
          res.send(oaiError);
        });

      break;

    case 'ListIdentifiers':
      provider
        .listIdentifiers(req.queryParams as ListParameters)
        .then((response) => {
          res.status('ok');
          res.send(response);
        })
        .catch((oaiError) => {
          res.status('internal server error');
          res.send(oaiError);
        });

      break;

    case 'ListRecords':
      provider
        .listRecords(req.queryParams as ListParameters)
        .then((response) => {
          res.status('ok');
          res.send(response);
        })
        .catch((oaiError) => {
          res.status('internal server error');
          res.send(oaiError);
        });

      break;

    case 'ListSets':
      provider
        .listSets(req.queryParams as ListParameters)
        .then((response) => {
          res.status('ok');
          res.send(response);
        })
        .catch((oaiError) => {
          res.status('internal server error');
          res.send(oaiError);
        });
      break;

    case 'GetRecord':
      provider
        .getRecord(req.queryParams as RecordParameters)
        .then((response) => {
          res.status('ok');
          res.send(response);
        })
        .catch((oaiError) => {
          res.status('internal server error');
          res.send(oaiError);
        });

      break;

    default:
      res.send(generateException(exception, EXCEPTION_CODES.BAD_VERB));
  }
};
