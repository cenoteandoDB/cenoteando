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
              'oai_datacite':[ {
                _attr: {
                  xmlns: 'http://www.openarchives.org/OAI/2.0/oai_dc/',
                  'xsi:schemaLocation':
                    'http://schema.datacite.org/oai/oai-1.1 ' +
                    'http://schema.datacite.org/oai/oai-1.1/oai.xsd',
                },
              },
                {'schemaVersion':'2.1'},
                {'datacentreSymbol':'TIB.WDCC'},
                {'payload':[{
                  'resource': [
                    {
                      _attr: {
                        xmlns: 'http://namespace.openaire.eu/schema/oaire/',
                        'xsi:schemaLocation':
                          'http://www.openarchives.org/OAI/2.0/oai_dc/ ' +
                          'https://www.openaire.eu/schema/repo-lit/4.0/openaire.xsd',
                      },
                    },
                    // ......does it matter what these fields are called?
                    {
                      'creators': [
                        {
                          'creator': [
                            {
                              creatorName: record.creatorN,
                            },
                            {
                              'nameIdentifier':[ {
                                _attr: {
                                  
                                  'nameIdentifierScheme': 'RNCTIMX',
                                  'schemeURI':'http://repositorionacionalcti.mx/'
                                },
                                'info:eu-repo/dai/mx/cvu/208814',
                              }
                            ]
                            }
                          ]
                        },
                      ],
                    },
                    {
                      'titles': [{ title: record.title }],
                    },
                    { 'publisher':record.publisher },
                    { 'publicationYear': record.publicationYear },
                    {
                      'subjects': [{subject: {_attr: {
                        'subjectScheme':'CONABIO',
                        'schemeURI':'http://enciclovida.mx/'
                      },
                      record.subject}],
                    },
                    {
                      'contributors': [{contributor: {_attr: {
                        'contributorType':'DataCurator'
                      },
                      'contributorName':record.contributorName,
                      'nameIdentifier':[{_attr: {
                        'nameIdentifierScheme':'RNCTIMX',
                      },'info:eu-repo/dai/mx/cvu/42278'

                      }]
                    },
                    }]
                  },
                  {
                    dates: [
                      {
                        'date': [
                          { _attr: { dateType: 'Created' },
                        record.date }
                        ],
                      }
                    ],
                  },
                    {
                      'resourceType' :[{_attr: { resourceTypeGeneral: 'Dataset' },
                      'Ficha informativa'
                      }]

                    },
                    //{
                      //'datacite:relatedIdentifier': [
                        //{ _attr: { 'relationType': 'URL',
                        //'relatedIdentifierType' } ,
                        //'https://doi.org/' + record._id.toString(),
                      //}
                     // ],
                    //},

                    {
                      'descriptions': [
                        {
                          description: [
                            { _attr: { descriptionType: 'Abstract' } },
                            record.dataDescription,
                          ],
                        },
                      ],
                    },
                    
                    
                    
                     //category?/ source?
                    { 'version': 1 }, //category?/ source?
                    {
                      'rightsList': [
                        {
                          'rights': [
                            {
                              _attr: {
                                rightsURI: 'http://creativecommons.org/licenses/by-nc/4.0/',
                              },
                            },
                            record.rights,
                          ],
                        },
                      ],
                    },
                  ], //rights?
                }]
              ]// .....add more fields here
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
