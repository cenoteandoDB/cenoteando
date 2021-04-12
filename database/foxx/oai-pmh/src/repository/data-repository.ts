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

import { DataRepository, METADATA_FORMAT_DC } from '../core/core-oai-provider';

import { query } from '@arangodb';

export enum METADATA_FORMAT_PANOSC {
  prefix = 'panosc',
  schema = 'https://github.com/panosc-eu/fair-data-api/blob/master/panosc.xsd',
  namespace = 'http://scicat.esss.se/panosc',
}

export enum METADATA_FORMAT_OAI_DATACITE {
  prefix = 'oai_datacite',
  schema = 'http://schema.datacite.org/meta/kernel-3/metadata.xsd',
  namespace = 'http://datacite.org/schema/kernel-3',
}

export enum SETS {
  setspec = 'openaire_data',
  setname = 'openaire_data',
}
//holaaaaaaaaaaaaaa
export interface Identifier {
  _id: string;
  creatorN: string;
  title: string;
  publisher: string;
  publicationYear: string;  
  subject: string;
  contributorName: string;
  date: string;
  dataDescription:string;
  rights: string;
  geoLocationPoint:Array<number>;
} 

/*
function initialize_variables(options: Identifier){
  options._id;
  //_id:'http://uniciencias.fciencias.unam.mx:8080/xmlui/handle/123456789/2020'
  options.creatorN;
  options.title;
  options.publisher;
  options.subject;
  options.contributorName;
  options.date;
  options.dataDescription;
  options.rights;
  option
}

initialize_variables({
  _id: 'oai:oai.datacite.org:32161',
  creatorN: 'Fernando Nuno Dias Marques Simoes', 
  title:'dede',
  publisher:'frr',
  subject:'fgtgt',
  contributorName:'tgtgt',
  date:'fvcfvf',
  dataDescription:'fvfvf',
  rights:'fcfcf'
});
*/

export type Record = Identifier;

/**
 * Factory function to create the oai provider
 * @param {Object} [options={}] - Implementation-specific configuration
 * @returns {DataRepository}
 */
// @ts-ignore We are not using these options at the moment
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
     * @returns {Promise<any>} Resolves with a {@link record}
     */
    // @ts-ignore TODO: Implement this (including each parameter)
    getRecord: (parameters: any, ): Record => {

      creatorN: 'Fernando Nuno Dias Marques Simoes';
      title: query 
      `for Document in v1_cenotes
      Filter Document.properties.code == '${parameters.identifier}'
      return Document.properties.name`.next();
      publisher: 'Cenoteando, Facultad de Ciencias, UNAM (cenoteando.mx)';
      publicationYear: '2021';  
      subject: 'BIODIVERSIDAD';
      contributorName: 'Ricardo Merlos Riestra';
      date: '2021-03-01';
      dataDescription:'Registro de informacion general multidisciplinaria de cenotes de la peninsula de yucatan, proveniente de la base de datos de cenoteando.mx';
      rights: 'Attribution-NonCommercial';
      geoLocationPoint: query 
      `for Document in v1_cenotes
      Filter Document.properties.code == '${parameters.identifier}'
      return Document.geometry.coordinates`;
      return [creatorN, title, publisher, publicationYear, subject, subject, contributorName, date, dataDescription,rights];
    },

    /**
     * Returns the metadata formats supported by this repository (DC only)
     * @param {string} identifier (not used)
     * @returns {Promise<METADATA_FORMAT_DC[]>}
     */
    // @ts-ignore Since only DC is supported, safe to ignore the identifier param.
    getMetadataFormats: (identifier: string = undefined) => {
      return Promise.resolve([
        METADATA_FORMAT_DC,
        METADATA_FORMAT_PANOSC,
        METADATA_FORMAT_OAI_DATACITE,
        
      ]);
    },

    /**
     * Used to retrieve the set structure of a repository. Not supported currently.
     * @param identifier
     * @returns {Promise<any[]>}
     */
    // @ts-ignore Since only DC is supported, safe to ignore the identifier param.
    getSets: (identifier: string | undefined = undefined) => {
      return Promise.resolve([SETS]);
    },

    /**
     * Gets list of identifiers.
     * @param parameters (metadataPrefix, from (optional), until (optional), set (not supported),
     *        resumptionToken (not supported))
     * @returns {Promise<any>} an array of {@link record}
     */
    // @ts-ignore TODO: Implement this (including each parameter)
    getIdentifiers: (parameters: any): Identifier[] => {
      return query`
        FOR cenote IN ${backend.collection('cenotes')}
          RETURN { _id: cenote._id }
      `.toArray();
    },

    /**
     * Gets list of records
     * @param parameters (metadataPrefix, from (optional), until (optional), set (not supported),
     *        resumptionToken (not supported))
     * @returns {Promise<any>} an array of {@link record}
     */
    // @ts-ignore TODO: Implement this (including each parameter)
    getRecords: (parameters: any): Record[] => {
      return query`
        FOR cenote IN ${backend.services.CenotesService.getCollection}
          RETURN cenote
      `.toArray();
    },
  });
}
