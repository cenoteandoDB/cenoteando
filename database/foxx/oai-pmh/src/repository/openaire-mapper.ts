import Console from 'console';
import { ProviderDCMapper } from '../core/core-oai-provider';

export class OpenaireMapper implements ProviderDCMapper {
  /**
   * The Universal Coordinated Time (UTC) date needs to be modified
   * to match the local timezone.
   * @param record the raw data returned by the mongo dao query
   * @returns {string}
   */
  private static setTimeZoneOffset(record: any): string {
    const date = new Date(record.updatedAt);
    const timeZoneCorrection = new Date(
      date.getTime() + date.getTimezoneOffset() * -60000,
    );
    return timeZoneCorrection.toISOString().split('.')[0] + 'Z';
  }

  // TODO: Implement this
  private static createItemRecord(record: any): any {
    //const updatedAt: string = this.setTimeZoneOffset(record);
    return {
      record: [
        {
          header: [
            {
              identifier: [
                { _attr: { identifierType: 'doi' } },
                record._id.toString(),
              ],
            },
            { setSpec: 'openaire_data' },
            { datestamp: '2020-01-01' },
          ],
        },
        {
          metadata: [
            {
              'datacite:resource': [
                {
                  _attr: {
                    'xmlns:rdf': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
                    'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
                    'xmlns:dcterms': 'http://purl.org/dc/terms/',
                    'xmlns:datacite': 'http://datacite.org/schema/kernel-4',
                    xmlns: 'http://namespace.openaire.eu/schema/oaire/',
                    'xsi:schemaLocation':
                      'http://www.openarchives.org/OAI/2.0/oai_dc/ ' +
                      'https://www.openaire.eu/schema/repo-lit/4.0/openaire.xsd',
                  },
                },
                // ......does it matter what these fields are called?
                {
                  'datacite:titles': [{ title: record.title }],
                },
                {
                  'datacite:identifier': [
                    { _attr: { identifierType: 'URL' } },
                    'https://doi.org/' + record._id.toString(),
                  ],
                },
                {
                  'datacite:descriptions': [
                    {
                      description: [
                        { _attr: { descriptionType: 'Abstract' } },
                        record.dataDescription,
                      ],
                    },
                  ],
                },
                {
                  'datacite:dates': [
                    {
                      'datacite:date': [
                        { _attr: { dateType: 'Issued' } },
                        '2020-01-01',
                      ],
                    },
                    {
                      'datacite:date': [
                        { _attr: { dateType: 'Available' } },
                        '2020-01-01',
                      ],
                    },
                  ],
                },
                { 'datacite:publicationYear': record.publicationYear },
                {
                  'datacite:creators': [
                    {
                      creator: [
                        {
                          creatorName: record.creator,
                        },
                        {
                          affiliation: record.affiliation,
                        },
                      ],
                    },
                  ],
                },
                { 'datacite:publisher': record.publisher }, //category?/ source?
                { 'datacite:version': 1 }, //category?/ source?
                {
                  'datacite:rightsList': [
                    {
                      'datacite:rights': [
                        {
                          _attr: {
                            rightsURI: 'info:eu-repo/semantics/openAccess',
                          },
                        },
                        'OpenAccess',
                      ],
                    },
                  ],
                },
              ], //rights?
              // .....add more fields here
            },
          ],
        },
      ],
    };
  }

  public mapOaiDcListRecords(records: any[]): any {
    const list = [];
    const response = {
      ListRecords: <any>[],
    };

    for (const record of records) {
      const item = OpenaireMapper.createItemRecord(record);
      list.push(item);
    }

    Console.debug('Parsed ' + list.length + ' records into OAI xml format.');

    response.ListRecords = list;

    return response;
  }

  public mapOaiDcGetRecord(record: any): any {
    if (!record) {
      throw new Error('Record not found');
    }

    const item = OpenaireMapper.createItemRecord(record);
    Console.debug(
      'Got item with id ' + record._id + ', title: ' + record.title,
    );
    return item;
  }

  public mapOaiDcListIdentifiers(records: any[]): any {
    const list = [];
    const response = {
      ListIdentifiers: <any>[],
    };

    for (const record of records) {
      const updatedAt: string = OpenaireMapper.setTimeZoneOffset(record);
      const item = {
        record: [
          {
            header: [
              { identifier: record.id.toString() },
              { datestamp: updatedAt },
            ],
          },
        ],
      };

      list.push(item);
    }

    response.ListIdentifiers = list;

    return response;
  }

  // TODO: Implement this ?
  // @ts-ignore because it is not fully implemented (records are not used)
  public mapOaiDcListSets(records: any[]): any {
    const response = {
      ListSets: <any>[],
    };
    const list = [];
    const item = {
      set: [{ setName: 'openaire_data' }, { setSpec: 'openaire_data' }],
    };
    list.push(item);

    response.ListSets = list;
    return response;
  }
}
