import Console from 'console';
import { ProviderDCMapper } from '../core/core-oai-provider';
import { Record } from './data-repository';
import { XmlObject } from 'xml';

export class OpenaireMapper implements ProviderDCMapper {
    /**
     * The Universal Coordinated Time (UTC) date needs to be modified
     * to match the local timezone.
     * @param date_str the string representation of a date to convert
     * @returns {string}
     */
    private static setTimeZoneOffset(date_str: string): string {
        const date = new Date(date_str);
        const timeZoneCorrection = new Date(
            date.getTime() + date.getTimezoneOffset() * -60000,
        );
        return timeZoneCorrection.toISOString().split('.')[0] + 'Z';
    }

    private static contributor_template(
        type: string,
        name: string,
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
                        {
                            _attr: {
                                nameIdentifierScheme: 'RNCTIMX',
                                schemeURI: 'http://repositorionacionalcti.mx/',
                            },
                        },
                        id,
                    ],
                },
            ],
        };
    }

    private static createItemRecord(record: Record): XmlObject {
        const date: string = this.setTimeZoneOffset(record.date);
        const header: XmlObject = {
            header: [
                {
                    identifier: record.id,
                },
                { datestamp: date },
                { setSpec: 'openaire_data' },
            ],
        };

        const identifier: XmlObject = {
            identifier: [
                {
                    _attr: {
                        identifierType: 'URN',
                    },
                },
                record.id,
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
                                record.creatorIdentifier,
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
                                subjectScheme: 'CTI',
                            },
                        },
                        1, // CIENCIAS FÍSICO MATEMÁTICAS Y CIENCIAS DE LA TIERRA
                    ],
                },
                {
                    subject: [
                        {
                            _attr: {
                                subjectScheme: 'CTI',
                            },
                        },
                        2, // BIOLOGÍA Y QUÍMICA
                    ],
                },
                {
                    subject: [
                        {
                            _attr: {
                                subjectScheme: 'CTI',
                            },
                        },
                        5, // CIENCIAS SOCIALES
                    ],
                },
            ],
        };

        const contributors = {
            contributors: record.contributors.map(function (contributor) {
                return OpenaireMapper.contributor_template(
                    contributor.type,
                    contributor.name,
                    contributor.id,
                );
            }),
        };

        const dates: XmlObject = {
            dates: [
                {
                    date: [
                        { _attr: { dateType: 'Created' } },
                        record.createdAt.split('T')[0],
                    ],
                },
                {
                    date: [
                        { _attr: { dateType: 'Updated' } },
                        record.updatedAt.split('T')[0],
                    ],
                },
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

        const formats: XmlObject = { formats: [{ format: 'JSON' }] };

        // TODO: Get size from database
        const size: XmlObject = { sizes: [{ size: '2 MB' }] };

        const version: XmlObject = { version: 1.0 };

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
                        'Attribution-NonCommercial',
                    ],
                },
                {
                    rights: {
                        _attr: {
                            rightsURI: 'info:eu-repo/semantics/openAccess',
                        },
                    },
                },
            ],
        };

        const geoLocations: XmlObject = {
            geoLocations: [
                {
                    geoLocation: [
                        {
                            geoLocationPoint: record.geoLocationPoint,
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
                                        xmlns: 'http://schema.datacite.org/oai/oai-1.1/',
                                        'xmlns:xsi':
                                            'http://www.w3.org/2001/XMLSchema-instance',
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
                                                        xmlns: 'http://namespace.openaire.eu/schema/oaire/',
                                                        'xsi:schemaLocation':
                                                            'http://www.openarchives.org/OAI/2.0/oai_dc/ ' +
                                                            '\nhttps://www.openaire.eu/schema/repo-lit/4.0/openaire.xsd',
                                                    },
                                                },
                                                identifier,
                                                creators,
                                                titles,
                                                publisher,
                                                publicationYear,
                                                subjects,
                                                contributors,
                                                dates,
                                                resourceType,
                                                size,
                                                formats,
                                                version,
                                                rightsList,
                                                descriptions,
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
            'Got item with id ' + record.id + ', title: ' + record.title,
        );

        return item;
    }

    public mapOaiDcListIdentifiers(records: any[]): any {
        const list = [];
        const response = {
            ListIdentifiers: <any>[],
        };

        for (const record of records) {
            const date: string = OpenaireMapper.setTimeZoneOffset(record.date);
            const item = {
                header: [{ identifier: record.id }, { datestamp: date }],
            };

            list.push(item);
        }

        response.ListIdentifiers = list;

        return response;
    }

    // TODO: Implement sets ?
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
