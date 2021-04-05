import Console from 'console';

import { ProviderDCMapper } from '../core/core-oai-provider';

export class CenoteandoDcMapper implements ProviderDCMapper {
  /**
   * The Universal Coordinated Time (UTC) date needs to be modified
   * to match the local timezone.
   * @param record the raw data returned by the mongo dao query
   * @returns {string}
   */
  private static setTimeZoneOffset(record: any): string {
    const date = new Date(record.registeredTime ? record.registeredTime : null);
    const timeZoneCorrection = new Date(
      date.getTime() + date.getTimezoneOffset() * -60000,
    );
    timeZoneCorrection.setMilliseconds(0);
    return timeZoneCorrection.toISOString().split('.')[0] + 'Z';
  }

  // TODO: Implement this ?
  private static getRightsMessage(restricted: boolean): string {
    if (restricted) {
      return 'Restricted to University users.';
    }
    return 'Available to the public.';
  }

  // TODO: Implement this
  private static createItemRecord(record: any): any {
    const updatedAt: string = CenoteandoDcMapper.setTimeZoneOffset(record);
    return {
      record: [
        {
          header: [{ identifier: record.doi }, { datestamp: updatedAt }],
        },
        {
          metadata: [
            {
              'oai_dc:dc': [
                {
                  _attr: {
                    'xmlns:oai_dc':
                      'http://www.openarchives.org/OAI/2.0/oai_dc/',
                    'xmlns:dc': 'http://purl.org/dc/elements/1.1/',
                    'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
                    'xsi:schemaLocation':
                      'http://www.openarchives.org/OAI/2.0/oai_dc/ ' +
                      'http://www.openarchives.org/OAI/2.0/oai_dc.xsd',
                  },
                },
                { 'dc:title': record.title },
                { 'dc:description': record.dataDescription },
                { 'dc:identifier': record.doi },
                {
                  'dc:identifier':
                    'https://cenoteando.org/api/cenote/' +
                    encodeURIComponent(record.doi),
                },
                { 'dc:date': record.publicationYear },
                { 'dc:creator': record.creator },
                { 'dc:type': 'dataset' },
                { 'dc:publisher': record.publisher },
                { 'dc:rights': CenoteandoDcMapper.getRightsMessage(false) },
              ],
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
      const item = CenoteandoDcMapper.createItemRecord(record);
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

    const item = CenoteandoDcMapper.createItemRecord(record);
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
      const updatedAt: string = CenoteandoDcMapper.setTimeZoneOffset(record);
      const item = {
        record: [
          {
            header: [
              { identifier: record._id.toString() },
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
