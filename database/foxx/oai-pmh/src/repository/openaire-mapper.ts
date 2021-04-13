import Console from 'console';
import { ProviderDCMapper } from '../core/core-oai-provider';
import { Record } from './data-repository';
import { XmlObject } from 'xml';

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
  private static createItemRecord(record: Record): XmlObject {
    //const updatedAt: string = this.setTimeZoneOffset(record);
    const header: XmlObject = {
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
    };

    const creators: XmlObject = {
      creators: [
        {
          creator: [
            { creatorName: record.creatorName },
            {
              nameIdentifier: [
                {
                  _attr: {
                    nameIdentifierScheme: 'RNCTIMX',
                    schemeURI: 'http://repositorionacionalcti.mx/',
                  },
                },
                'info:eu-repo/dai/mx/cvu/208814',
              ],
            },
          ],
        },
      ],
    };

    const titles: XmlObject = { titles: [{ title: record.title }] };

    const publisher: XmlObject = { publisher: record.publisher };

    const publicationYear: XmlObject = {
      publicationYear: record.publicationYear,
    };

    const subjects: XmlObject = {
      subjects: [
        {
          subject: [
            {
              _attr: {
                subjectScheme: 'CONABIO',
                schemeURI: 'http://enciclovida.mx/',
              },
            },
            record.subject,
          ],
        },
      ],
    };

    const contributors: XmlObject = {
      contributors: [
        {
          contributor: [
            {
              _attr: { contributorType: 'DataCurator' },
              contributorName: record.contributorName,
              nameIdentifier: [
                { _attr: { nameIdentifierScheme: 'RNCTIMX' } },
                'info:eu-repo/dai/mx/cvu/42278',
              ],
            },
          ],
        },
      ],
    };

    const dates: XmlObject = {
      dates: [{ date: [{ _attr: { dateType: 'Created' } }, record.date] }],
    };

    const resourceType: XmlObject = {
      resourceType: [
        { _attr: { resourceTypeGeneral: 'Dataset' } },
        'Ficha informativa',
      ],
    };

    const descriptions: XmlObject = {
      descriptions: [
        {
          description: [
            { _attr: { descriptionType: 'Abstract' } },
            record.dataDescription,
          ],
        },
      ],
    };

    const version: XmlObject = { version: 1 };

    const rightsList: XmlObject = {
      rightsList: [
        {
          rights: [
            {
              _attr: {
                rightsURI: 'http://creativecommons.org/licenses/by-nc/4.0/',
              },
            },
            record.rights,
          ],
        },
      ],
    };

    return {
      record: [
        header,
        {
          metadata: [
            {
              oai_datacite: [
                {
                  _attr: {
                    xmlns: 'http://www.openarchives.org/OAI/2.0/oai_dc/',
                    'xsi:schemaLocation':
                      'http://schema.datacite.org/oai/oai-1.1 http://schema.datacite.org/oai/oai-1.1/oai.xsd',
                  },
                },
                { schemaVersion: '2.1' },
                { datacentreSymbol: 'TIB.WDCC' },
                {
                  payload: [
                    {
                      resource: [
                        {
                          _attr: {
                            xmlns: 'http://namespace.openaire.eu/schema/oaire/',
                            'xsi:schemaLocation':
                              'http://www.openarchives.org/OAI/2.0/oai_dc/ ' +
                              'https://www.openaire.eu/schema/repo-lit/4.0/openaire.xsd',
                          },
                        },
                        creators,
                        titles,
                        publisher,
                        publicationYear,
                        subjects,
                        contributors,
                        dates,
                        resourceType,
                        descriptions,
                        descriptions,
                        version,
                        rightsList,
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };
  }

  public mapOaiDcListRecords(records: Record[]): any {
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

  public mapOaiDcGetRecord(record: Record): any {
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
            header: [{ identifier: record._id }, { datestamp: updatedAt }],
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
  public mapOaiDcListSets(records: Record[]): any {
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
