/*
 *  Original work Copyright 2018 Willamette University
 *  Modified work Copyright 2019 SciCat Organisations
 *  Modified work Copyright 2021 Cenoteando.org
 *
 *  This file is part of OAI-PHM Service.
 *
 *  @author Michael Spalti
 *
 *  OAI-PHM Service is based on the Modular OAI-PMH Server, University of Helsinki,
 *  The National Library of Finland.
 *
 *  OAI-PHM Service is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  OAI-PHM Service is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with OAI-PHM Service.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * @typedef {Object} record
 * @property {number}id
 * @property {string} title
 * @property {string} image
 * @property {string} url
 * @property {string} browseType
 * @property {string} description
 * @property {string} dates
 * @property {string} items
 * @property {string} ctype
 * @property {string} repoType
 * @property {string} restricted
 * @property {boolean} published
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {string} searchUrl
 */

import {
    DataRepository,
    METADATA_FORMAT_DC,
    RecordParameters,
    ListParameters,
} from '../core/core-oai-provider';

import { query } from '@arangodb';

export enum METADATA_FORMAT_OAI_DATACITE {
    prefix = 'oai_datacite',
    schema = 'http://schema.datacite.org/meta/kernel-3/metadata.xsd',
    namespace = 'http://datacite.org/schema/kernel-3',
}

export enum SETS {
    setspec = 'openaire_data',
    setname = 'openaire_data',
}

export interface Identifier {
    _id: string;
    updatedAt: string;
}

export interface Contributor {
    type: string;
    name: string;
    nameIdScheme: string;
    schemeURI: string;
    id: string;
}

export interface Record extends Identifier {
    creatorName: string;
    creatorIdentifier: string;
    title: string;
    publisher: string;
    publicationYear: string;
    contributors: Array<Contributor>;
    date: string;
    description: string;
    geoLocationPoint: Array<number>;
}

type CenoteData = {
    _id: string;
    updatedAt: string;
    title: string;
    geoLocationPoint: [number, number]; // [long, lat]
};

function createRecord(cenote_data: CenoteData): Record {
    // TODO: Ideally store this in the database and retrieve here
    // FIXME: Error in name field of all contributors
    function get_contributors() {
        return [
            {
                type: 'DataCollector',
                name: 'Luis Arturo Liévano-Beltrán',
                nameIdScheme: 'RNCTIMX',
                schemeURI: 'http://repositorionacionalcti.mx/',
                id: 'info:eu-repo/dai/mx/orcid/0000-0003-0073-9203',
            },
            {
                type: 'DataCollector',
                name: 'Efrain Miguel Chavez Solis',
                nameIdScheme: 'RNCTIMX',
                schemeURI: 'http://repositorionacionalcti.mx/',
                id: 'info:eu-repo/dai/mx/orcid/0000-0001-9423-9335',
            },
            {
                type: 'DataCollector',
                name: 'Dorottya Angyal',
                nameIdScheme: 'RNCTIMX',
                schemeURI: 'http://repositorionacionalcti.mx/',
                id: 'info:eu-repo/dai/mx/orcid/0000-0002-2380-2482',
            },
            {
                type: 'DataCollector',
                name: 'Nori Velazquez Juarez',
                nameIdScheme: 'RNCTIMX',
                schemeURI: 'http://repositorionacionalcti.mx/',
                id: 'info:eu-repo/dai/mx/curp/VEJN950421MDFLRR05',
            },
            {
                // FIXME: Error in type
                type: 'DataCurator',
                name: 'Ricardo Merlos Riestra',
                nameIdScheme: 'RNCTIMX',
                schemeURI: 'http://repositorionacionalcti.mx/',
                id: 'info:eu-repo/dai/mx/curp/MERR880417HDFRSC06',
            },
            {
                type: 'DataManager',
                name: 'Isaac Chacon Gomez',
                nameIdScheme: 'RNCTIMX',
                schemeURI: 'http://repositorionacionalcti.mx/',
                id: 'info:eu-repo/dai/mx/curp/CAGI831107HDFHMS04',
            },
            {
                type: 'ProjectMember',
                name: 'Diogo Seca Repas Gonçalves',
                nameIdScheme: 'RNCTIMX',
                schemeURI: 'http://repositorionacionalcti.mx/',
                id: 'info:eu-repo/dai/mx/orcid/0000-0003-4983-0032',
            },
            {
                type: 'ProjectMember',
                name: 'Luis Angel Yerbes Rodriguez',
                nameIdScheme: 'RNCTIMX',
                schemeURI: 'http://repositorionacionalcti.mx/',
                id: 'info:eu-repo/dai/mx/curp/YERL961125HYNRDS09',
            },
            {
                type: 'ProjectMember',
                name: 'Charly Joan Llanes Euan',
                nameIdScheme: 'RNCTIMX',
                schemeURI: 'http://repositorionacionalcti.mx/',
                id: 'info:eu-repo/dai/mx/curp/LAEC930819HYNLNH07',
            },
            {
                type: 'Researcher',
                name: 'Maite Mascaro',
                nameIdScheme: 'RNCTIMX',
                schemeURI: 'http://repositorionacionalcti.mx/',
                id: 'info:eu-repo/dai/mx/orcid/0000-0003-3614-4383',
            },
        ];
    }

    return Object.assign(cenote_data, {
        publisher: 'Cenoteando, Facultad de Ciencias, UNAM (cenoteando.mx)',
        publicationYear: '2021',
        date: '2021-03-01',
        description:
            'Registro de informacion general multidisciplinaria de cenotes de la peninsula de yucatan, proveniente de la base de datos de cenoteando.mx',
        creatorName: 'Fernando Nuno Dias Marques Simoes',
        creatorIdentifier: 'info:eu-repo/dai/mx/cvu/208814',
        contributors: get_contributors(),
    });
}

/**
 * Factory function to create the oai provider
 * @param {Object} [options={}] - Implementation-specific configuration
 * @returns {DataRepository}
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore We are not using these options at the moment
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function factory(options = {}): DataRepository {
    const backend = new module.context.dependencies.backend.service();

    return Object.freeze({
        /**
         * Defines whether this repository supports sets.
         */
        setSupport: true,

        /**
         * Defines whether this repository supports resumption tokens.
         */
        resumptionSupport: false,

        /**
         * Get individual record.
         * @param parameters (identifier, metadataPrefix)
         * @returns {any} Resolves with a {@link record}
         */
        getRecord: (parameters: RecordParameters): Record | undefined => {
            // TODO: Throw error if parameters are invalid (check if corresponding entity exists in database)
            const identifier_parts = parameters.identifier.split(':');
            if (identifier_parts.length != 3) return undefined;
            const cenote_id = identifier_parts[2];

            const cenote_data = query`
                LET cenote = DOCUMENT(${cenote_id})
                RETURN {
                  _id: CONCAT('oai:cenoteando.org:', cenote._id),
                  title: cenote.properties.name,
                  geoLocationPoint: cenote.geometry.coordinates
                }`.next();

            return createRecord(cenote_data);
        },

        /**
         * Returns the metadata formats supported by this repository (DC only)
         * @param {string} identifier (not used)
         * @returns METADATA_FORMAT_DC[]}
         */
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore Since only DC is supported, safe to ignore the identifier param.
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        getMetadataFormats: (identifier: string = undefined) => {
            return [METADATA_FORMAT_DC, METADATA_FORMAT_OAI_DATACITE];
        },

        /**
         * Used to retrieve the set structure of a repository. Not supported currently.
         * @param identifier
         * @returns {any[]}
         */
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore Since only DC is supported, safe to ignore the identifier param.
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        getSets: (identifier: string | undefined = undefined) => {
            return [SETS];
        },

        /**
         * Gets list of identifiers.
         * @param parameters (metadataPrefix, from (optional), until (optional), set (not supported),
         *        resumptionToken (not supported))
         * @returns {any} an array of {@link record}
         */
        // @ts-ignore TODO: Implement parameters
        getIdentifiers: (parameters: ListParameters): Array<Identifier> => {
            // TODO: Remove limit of 100 results
            return query`
                FOR cenote IN ${backend.collection('cenotes')}
                    FILTER cenote.properties.touristic == true
                    RETURN { 
                        _id: CONCAT('oai:cenoteando.org:', cenote._id),
                        updatedAt: cenote.properties.date
                    }
              `.toArray();
        },

        /**
         * Gets list of records
         * @param parameters (metadataPrefix, from (optional), until (optional), set (not supported),
         *        resumptionToken (not supported))
         * @returns {any} an array of {@link record}
         */
        // @ts-ignore TODO: Implement this (including each parameter)
        getRecords: (parameters: ListParameters): Record[] => {
            // TODO: Remove limit of 100 results
            const cenotes_data: Array<CenoteData> = query`
            FOR cenote IN ${backend.collection('cenotes')}
                FILTER cenote.properties.touristic == true
                RETURN { 
                    _id: CONCAT('oai:cenoteando.org:', cenote._id),
                    title: cenote.properties.name,
                    geoLocationPoint: cenote.geometry.coordinates
                }
            `.toArray();

            return cenotes_data.map(createRecord);
        },
    });
}
