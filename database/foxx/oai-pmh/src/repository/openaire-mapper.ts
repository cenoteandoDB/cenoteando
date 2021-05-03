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

    private static contributor_template(
        type: string,
        name: string,
        id_scheme: string,
        id: string,
    ) {
        return {
            contributor: [
                {
                    _attr: { contributorType: type },
                },
                { contributorName: name },
                {
                    nameIdentifier: [
                        { _attr: { nameIdentifierScheme: id_scheme } },
                        id,
                    ],
                },
            ],
        };
    }

    // TODO: Implement this
    private static createItemRecord(record: Record): XmlObject {
        //const updatedAt: string = this.setTimeZoneOffset(record);
        const header: XmlObject = {
            header: [
                {
                    identifier: record._id,
                },
                { datestamp: '2020-01-01' },
                { setSpec: 'openaire_data' },
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
                                        schemeURI:
                                            'http://repositorionacionalcti.mx/',
                                    },
                                },
                                record.creator_identifier,
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

        const contributors = {
            contributors: record.contributors.map(function (contributor) {
                return OpenaireMapper.contributor_template(
                    contributor.type,
                    contributor.name,
                    contributor.id_scheme,
                    contributor.id,
                );
            }),
        };

        const dates: XmlObject = {
            dates: [
                { date: [{ _attr: { dateType: 'Created' } }, record.date] },
            ],
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
                        record.description,
                    ],
                },
            ],
        };

        // TODO: Check this
        const format: XmlObject = { format: 'CSV' };

        // TODO: Check this
        const size: XmlObject = { size: '2 MB' };

        const version: XmlObject = { version: 1 };

        const rightsList: XmlObject = {
            rightsList: [
                {
                    rights: [
                        {
                            _attr: {
                                rightsURI:
                                    'http://creativecommons.org/licenses/by-nc/4.0/',
                            },
                        },
                        record.rights,
                    ],
                },
            ],
        };

        const geoLocations: XmlObject = {
            geoLocations: [
                {
                    geoLocation: [
                        {
                            // We use reverse because GeoJSON stores [long, lat] and we need "lat long"
                            geoLocationPoint: record.geoLocationPoint
                                .reverse()
                                .join(' '),
                        },
                        {
                            geoLocationPlace: 'Peninsula de Yucatán, Mexico',
                        },
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
                                        xmlns:
                                            'http://www.openarchives.org/OAI/2.0/oai_dc/',
                                        'xsi:schemaLocation':
                                            'http://schema.datacite.org/oai/oai-1.1 ' +
                                            '\nhttp://schema.datacite.org/oai/oai-1.1/oai.xsd',
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
                                                        xmlns:
                                                            'http://namespace.openaire.eu/schema/oaire/',
                                                        'xsi:schemaLocation':
                                                            'http://www.openarchives.org/OAI/2.0/oai_dc/ ' +
                                                            '\nhttps://www.openaire.eu/schema/repo-lit/4.0/openaire.xsd',
                                                    },
                                                },
                                                {
                                                    identifier: [
                                                        {
                                                            _attr: {
                                                                identifierType:
                                                                    'URN',
                                                            },
                                                        },
                                                        record._id,
                                                    ],
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
                                                format,
                                                size,
                                                version,
                                                rightsList,
                                                geoLocations,
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

        Console.debug(
            'Parsed ' + list.length + ' records into OAI xml format.',
        );

        response.ListRecords = list;

        return response;
    }

    public mapOaiDcGetRecord(record: Record): any {
        if (!record) {
            throw new Error('Record not found');
        }

        const item = {
            GetRecord: [OpenaireMapper.createItemRecord(record)],
        };

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
                header: [{ identifier: record._id }, { datestamp: updatedAt }],
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
            set: [{ setSpec: 'openaire_data' }, { setName: 'openaire_data' }],
        };
        list.push(item);

        response.ListSets = list;
        return response;
    }
}
