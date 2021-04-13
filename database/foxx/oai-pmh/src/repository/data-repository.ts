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
}

export interface Record extends Identifier {
  creatorName: string;
  title: string;
  publisher: string;
  publicationYear: string;
  subject: string;
  contributorName: string;
  date: string;
  dataDescription: string;
  rights: string;
  geoLocationPoint: Array<number>;
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
  const backend = module.context.dependencies.backend;

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
      return query`
        LET cenote = DOCUMENT(${cenote_id})
        RETURN {
          _id: CONCAT('oai:cenoteando.org:', cenote._id),
          creatorName: 'Fernando Nuno Dias Marques Simoes',
          title: cenote.properties.name,
          publisher: 'Cenoteando, Facultad de Ciencias, UNAM (cenoteando.mx)',
          publicationYear: '2021',
          subject: 'BIODIVERSIDAD',
          contributorName: 'Ricardo Merlos Riestra',
          date: '2021-03-01',
          dataDescription:
            'Registro de informacion general multidisciplinaria de cenotes de la peninsula de yucatan, proveniente de la base de datos de cenoteando.mx',
          rights: 'Attribution-NonCommercial',
          geoLocationPoint: cenote.geometry.coordinates
        }`.next();
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
    getIdentifiers: (parameters: ListParameters): Identifier[] => {
      return query`
        FOR cenote IN ${backend.collection('cenotes')}
          RETURN { _id: CONCAT('oai:cenoteando.org:', cenote._id) }
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
      return query`
        FOR cenote IN ${backend.collection('cenotes')}
          RETURN cenote
      `.toArray();
    },
  });
}
