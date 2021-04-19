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
                        record._id,
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

        const contributors: XmlObject = {
            contributors: [
                {
                    contributor: [
                        {
                            _attr: { contributorType: 'DataCurator' },
                            
                        },
                        {contributorName: record.contributorName},
                        {nameIdentifier: [
                                { _attr: { nameIdentifierScheme: 'RNCTIMX' } },
                                record.Contribuidor_identifier,
                            ]},
                    ]},
                    {
                    contributor:[
                        {
                            _attr: { contributorType: 'DataManager' },
                            
                        },
                        {contributorName: 'Isaac Chacon Gomez'},
                        {nameIdentifier: [
                                { _attr: { nameIdentifierScheme: 'CURP' } },
                                'CAGI831107HDFHMS04',
                            ]},
                    ]},
                {
                    contributor:[
                        {
                            _attr: { contributorType: 'DataCollector' },
                            
                        },
                        {contributorName: 'Nori Velázquez Juárez '},
                        {nameIdentifier: [
                                { _attr: { nameIdentifierScheme: 'CURP' } },
                                'VEJN950421MDFLRR05',
                            ]},
                    ]},
                    {
                        contributor:[
                            {
                                _attr: { contributorType: 'Researcher' },
                                
                            },
                            {contributorName: 'Maite Mascaro Miquelajauregui'},
                            {nameIdentifier: [
                                    { _attr: { nameIdentifierScheme: 'ORCID' } },
                                    '0000-0003-3614-4383',
                                ]},
                        ]},
                        {
                            contributor:[
                                {
                                    _attr: { contributorType: 'DataCollector' },
                                    
                                },
                                {contributorName: 'Luis Arturo Liévano Beltrán'},
                                {nameIdentifier: [
                                        { _attr: { nameIdentifierScheme: 'ORCID' } },
                                        '0000-0003-0073-9203',
                                    ]},
                            ]},
                            {
                                contributor:[
                                    {
                                        _attr: { contributorType: 'DataCollector' },
                                        
                                    },
                                    {contributorName: 'Efrain Chavez Solis'},
                                    {nameIdentifier: [
                                            { _attr: { nameIdentifierScheme: 'ORCID' } },
                                            '0000-0001-9423-9335',
                                        ]},
                                ]},
                                {
                                    contributor:[
                                        {
                                            _attr: { contributorType: 'DataCollector' },
                                            
                                        },
                                        {contributorName: 'Dorottya Flora Angyal'},
                                        {nameIdentifier: [
                                                { _attr: { nameIdentifierScheme: 'ORCID ' } },
                                                '0000-0002-2380-2482',
                                            ]},
                                    ]},
                                    {contributor :[
                                        {
                                            _attr: { contributorType: 'ProjectMember' },
                                            
                                        },
                                        {contributorName: 'Diogo Secca Repas'},
                                        {nameIdentifier: [
                                                { _attr: { nameIdentifierScheme: 'DNI' } },
                                                '15996476',
                                            ]}
                                    ]
                                },
                                {contributor :[
                                    {
                                        _attr: { contributorType: 'ProjectMember' },
                                        
                                    },
                                    {contributorName: 'Luis Angel Yerbes Rodriguez'},
                                    {nameIdentifier: [
                                            { _attr: { nameIdentifierScheme: 'CURP' } },
                                            'YERL961125HYNRDS09',
                                        ]}
                                ]
                            },
                            {contributor :[
                                {
                                    _attr: { contributorType: 'ProjectMember' },
                                    
                                },
                                {contributorName: 'Charly Joan Llanes Euan'},
                                {nameIdentifier: [
                                        { _attr: { nameIdentifierScheme: 'RNCTIMX' } },
                                        'LAEC930819HYNLNH07',
                                    ]},
                            ]
                        }

            ]
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
                        record.dataDescription,
                    ],
                },
            ],
        };

        const format: XmlObject = { format: 'csv' };

        const size: XmlObject = { size: '2mb'};

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
                            geoLocationPoint: record.geoLocationPoint 
                        },
                        {
                            geoLocationPlace:'Peninsula de Yucatán, Mexico'

                        }
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
                                                        xmlns:
                                                            'http://namespace.openaire.eu/schema/oaire/',
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
                            { identifier: record._id },
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
