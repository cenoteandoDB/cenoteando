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

import { generateException, generateResponse } from './oai-response';
import { OaiService, ProviderConfiguration } from './oai-service';
import Console from 'console';

interface Formats {
    prefix: string;
    schema: string;
    namespace: string;
}

/**
 * The time formats that can be returned with OAI Identify requests.
 */
export enum HARVESTING_GRANULARITY {
    DATE = 'YYYY-MM-DD',
    DATETIME = 'YYYY-MM-DDThh:mm:ssZ',
}

/**
 * The standard OAI responses for deleted record support that can be
 * returned with OAI Identify requests.
 */
export enum DELETED_RECORDS_SUPPORT {
    NO = 'no',
    TRANSIENT = 'transient',
    PERSISTENT = 'persistent',
}

// Not actually returning these as error codes.
// Using the verb name.
export enum ERRORS {
    badArgument = 0,
    badResumptionToken = 1,
    badVerb = 2,
    cannotDisseminateFormat = 4,
    idDoesNotExist = 8,
    noRecordsMatch = 16,
    noMetadataFormats = 32,
    noSetHierarchy = 64,
}

/**
 * OAI definition for the Dublin Core metadata format.
 */
export enum METADATA_FORMAT_DC {
    prefix = 'oai_dc',
    schema = 'http://www.openarchives.org/OAI/2.0/oai_dc.xsd',
    namespace = 'http://www.openarchives.org/OAI/2.0/oai_dc/',
}

/**
 * Interface for the class that maps between DAO data and
 * formatted OAI xml.
 */
export interface ProviderDCMapper {
    mapOaiDcListRecords(records: any[]): any;

    mapOaiDcGetRecord(records: any): any;

    mapOaiDcListIdentifiers(records: any[]): any;
    mapOaiDcListSets(records: any[]): any;
}

/**
 * The list of possible query parameters that may need to be
 * returned in OAI exceptions.
 */
export interface ExceptionParams {
    baseUrl: string;
    verb?: VERBS;
    identifier?: string;
    metadataPrefix?: string;
}

/**
 * OAI verbs.
 */
export enum VERBS {
    IDENTIFY = 'Identify',
    LIST_METADATA_FORMATS = 'ListMetadataFormats',
    LIST_SETS = 'ListSets',
    GET_RECORD = 'GetRecord',
    LIST_IDENTIFIERS = 'ListIdentifiers',
    LIST_RECORDS = 'ListRecords',
}

/**
 * The OAI codes returned in exceptions.
 */
export enum EXCEPTION_CODES {
    BAD_ARGUMENT = 'badArgument',
    BAD_RESUMPTION_TOKEN = 'badResumptionToken',
    BAD_VERB = 'badVerb',
    CANNOT_DISSEMINATE_FORMAT = 'cannotDisseminateFormat',
    ID_DOES_NOT_EXIST = 'idDoesNotExist',
    NO_RECORDS_MATCH = 'noRecordsMatch',
    NO_METADATA_FORMATS = 'noMetadataFormats',
    NO_SET_HIERARCHY = 'noSetHierarchy',
}

/**
 * Implemented by OAI repository modules.
 */
export interface DataRepository {
    setSupport: boolean;
    resumptionSupport: boolean;
    getSets: any;
    getRecords: any;
    getMetadataFormats: any;
    getIdentifiers: any;
    getRecord: any;
}

/**
 * Parameters for OAI list requests (ListRecords and ListIdentifiers).
 */
export interface ListParameters {
    metadataPrefix: string;
    from?: string;
    until?: string;
    set?: string;
    resumptionToken?: string;
}

/**
 * The parameters required by OAI GetRecord requests.
 */
export interface RecordParameters {
    identifier: string;
    metadataPrefix: string;
}

/**
 * The optional parameter for OAI GetMetadataFormats requests.
 */
export interface MetadataFormatParameters {
    identifier?: string;
}

/**
 * The core OAI provider class instantiates an `OaiService` that has been configured with
 * a single data repository module.
 */
export class CoreOaiProvider {
    oaiService: OaiService;
    parameters: ProviderConfiguration;
    mapper: ProviderDCMapper;
    possibleParams = [
        'verb',
        'from',
        'until',
        'metadataPrefix',
        'set',
        'resumptionToken',
    ];

    /**
     * The constructor initializes the core provider with a single provider module.
     * @param factory the provider module's factory method
     * @param configuration {ProviderConfiguration} the provider module configuration
     * @param mapper {ProviderDCMapper} the provider module mapper (typically maps to Dublin Core)
     */
    constructor(
        factory: any,
        configuration: ProviderConfiguration,
        mapper: ProviderDCMapper,
    ) {
        this.oaiService = new OaiService(factory, configuration);
        this.parameters = this.oaiService.getParameters();
        this.mapper = mapper;
    }

    /**
     * Handle OAI requests. These methods return OAI provider configuration,
     * data, or error responses from the repository provider module that has been
     * configured in `OaiService`.
     */

    /**
     * Handles `ListMetadataFormats` requests using the current repository module.
     * @param {MetadataFormatParameters} query
     * @returns {string}
     */
    listMetadataFormats(query: MetadataFormatParameters): string {
        Console.debug('ListMetadataFormats');

        const queryParameters = this.getQueryParameters(query);

        const exception: ExceptionParams = {
            baseUrl: this.parameters.baseURL,
            verb: VERBS.LIST_METADATA_FORMATS,
            metadataPrefix: METADATA_FORMAT_DC.prefix,
        };
        if (
            queryParameters.length > 2 ||
            (queryParameters.length === 2 &&
                !CoreOaiProvider.hasKey(query, 'identifier'))
        ) {
            return generateException(exception, EXCEPTION_CODES.BAD_ARGUMENT);
        } else {
            const args = CoreOaiProvider.hasKey(query, 'identifier')
                ? query.identifier
                : undefined;
            const formats = this.oaiService
                .getProvider()
                .getMetadataFormats(args);
            try {
                const responseContent = {
                    ListMetadataFormats: formats.map((format: Formats) => {
                        return {
                            metadataFormat: [
                                { metadataPrefix: format.prefix },
                                { schema: format.schema },
                                { metadataNamespace: format.namespace },
                            ],
                        };
                    }),
                };
                return generateResponse(
                    <any>query,
                    this.parameters.baseURL,
                    responseContent,
                );
            } catch (err) {
                // TODO: Throw error instead of returning
                Console.error(err);
                return generateException(
                    exception,
                    EXCEPTION_CODES.NO_METADATA_FORMATS,
                );
            }
        }
    }

    /**
     * Handles `GetRecord` requests using the current repository module.
     * @param {RecordParameters} query
     * @returns {string}
     */
    getRecord(query: RecordParameters): string {
        Console.debug('GetRecord');

        const queryParameters = this.getQueryParameters(query);
        const exception: ExceptionParams = {
            baseUrl: this.parameters.baseURL,
            verb: VERBS.GET_RECORD,
            identifier: query.identifier,
            metadataPrefix: METADATA_FORMAT_DC.prefix,
        };
        if (
            queryParameters.length !== 3 ||
            !CoreOaiProvider.hasKey(query, 'identifier') ||
            !CoreOaiProvider.hasKey(query, 'metadataPrefix')
        ) {
            return generateException(exception, EXCEPTION_CODES.BAD_ARGUMENT);
        } else {
            try {
                const record = this.oaiService.getProvider().getRecord(query);
                if (record) {
                    const mapped = this.mapper.mapOaiDcGetRecord(record);
                    return generateResponse(
                        <any>query,
                        this.parameters.baseURL,
                        mapped,
                    );
                } else {
                    // There should be one matching record.
                    return generateException(
                        exception,
                        EXCEPTION_CODES.ID_DOES_NOT_EXIST,
                    );
                }
            } catch (err) {
                // TODO: Throw error instead of returning
                Console.error(err);
                return generateException(
                    exception,
                    EXCEPTION_CODES.ID_DOES_NOT_EXIST,
                );
            }
        }
    }

    /**
     * Handles `ListIdentifiers` requests using the current repository module.
     * @param {ListParameters} query
     * @returns {string}
     */
    listIdentifiers(query: ListParameters): string {
        Console.debug('ListIdentifiers');

        const queryParameters = this.getQueryParameters(query);
        const exception: ExceptionParams = {
            baseUrl: this.parameters.baseURL,
            verb: VERBS.LIST_IDENTIFIERS,
            metadataPrefix: CoreOaiProvider.hasKey(query, 'metadataPrefix')
                ? query.metadataPrefix
                : METADATA_FORMAT_DC.prefix,
        };

        // Valid parameter count.
        if (queryParameters.length > 6 || queryParameters.length < 2) {
            return generateException(exception, EXCEPTION_CODES.BAD_ARGUMENT);
        }
        // Verify that query parameters are valid for this repository.
        if (this.hasInvalidListParameter(query)) {
            return generateException(exception, EXCEPTION_CODES.BAD_ARGUMENT);
        }

        // If set is requested, verify that it is supported by this repository.
        if (CoreOaiProvider.hasKey(query, 'set')) {
            if (!this.hasSetSupport()) {
                return generateException(
                    exception,
                    EXCEPTION_CODES.NO_SET_HIERARCHY,
                );
            }
        }

        // Execute the request.
        const identifiers = this.oaiService.getProvider().getIdentifiers(query);

        if (identifiers.length === 0) {
            return generateException(
                exception,
                EXCEPTION_CODES.NO_RECORDS_MATCH,
            );
        }
        try {
            const mapped = this.mapper.mapOaiDcListIdentifiers(identifiers);
            return generateResponse(
                <any>query,
                this.parameters.baseURL,
                mapped,
            );
        } catch (err) {
            // TODO: Throw error instead of returning
            // Log the error and return OAI error message.
            Console.error(err);
            return generateException(
                exception,
                EXCEPTION_CODES.NO_RECORDS_MATCH,
            );
        }
    }

    /**
     * Handles `ListRecords` requests using the current repository module.
     * @param {ListParameters} query
     * @returns {any}
     */
    listRecords(query: ListParameters): any {
        Console.debug('ListRecords', query);

        const queryParameters = this.getQueryParameters(query);
        const exception: ExceptionParams = {
            baseUrl: this.parameters.baseURL,
            verb: VERBS.LIST_RECORDS,
            metadataPrefix: CoreOaiProvider.hasKey(query, 'metadataPrefix')
                ? query.metadataPrefix
                : METADATA_FORMAT_DC.prefix,
        };

        // Valid parameter count.
        if (queryParameters.length > 6 || queryParameters.length < 2) {
            return generateException(exception, EXCEPTION_CODES.BAD_ARGUMENT);
        }
        // Verify that query parameters are valid for this repository.
        if (this.hasInvalidListParameter(query)) {
            return generateException(exception, EXCEPTION_CODES.BAD_ARGUMENT);
        }

        // If set is requested, verify that it is supported by this repository.
        if (CoreOaiProvider.hasKey(query, 'set')) {
            if (!this.hasSetSupport()) {
                return generateException(
                    exception,
                    EXCEPTION_CODES.NO_SET_HIERARCHY,
                );
            }
        }
        // Execute the request.
        const records = this.oaiService.getProvider().getRecords(query);

        if (records.length === 0) {
            // TODO: Throw error instead of returning
            return generateException(
                exception,
                EXCEPTION_CODES.NO_RECORDS_MATCH,
            );
        }
        try {
            const mapped = this.mapper.mapOaiDcListRecords(records);
            return generateResponse(
                <any>query,
                this.parameters.baseURL,
                mapped,
            );
        } catch (err) {
            // TODO: Throw error instead of returning
            // Log the error and return OAI error message.
            Console.error(err);
            return generateException(
                exception,
                EXCEPTION_CODES.NO_RECORDS_MATCH,
            );
        }
    }

    /**
     * Handles `Identify` requests using the current repository module.
     * @param {any} query
     * @returns {any}
     */
    identify(query: any): any {
        Console.debug('Identify');

        const queryParameters = this.getQueryParameters(query);
        const exception: ExceptionParams = {
            baseUrl: this.parameters.baseURL,
            verb: VERBS.IDENTIFY,
        };
        try {
            if (queryParameters.length > 1) {
                return generateException(
                    exception,
                    EXCEPTION_CODES.BAD_ARGUMENT,
                );
            } else {
                const responseContent = {
                    Identify: [
                        { repositoryName: this.parameters.repositoryName },
                        { baseURL: this.parameters.baseURL },
                        { protocolVersion: this.parameters.protocolVersion },
                        { adminEmail: this.parameters.adminEmail },
                        {
                            earliestDatestamp:
                                this.parameters.earliestDatestamp,
                        },
                        { deletedRecord: this.parameters.deletedRecord },
                        { granularity: this.parameters.granularity },
                    ],
                };
                return generateResponse(
                    query,
                    this.parameters.baseURL,
                    responseContent,
                );
            }
        } catch (err) {
            // TODO: Throw error instead of returning
            Console.log(err);
            return generateException(exception, EXCEPTION_CODES.BAD_ARGUMENT);
        }
    }

    /**
     * Handles `ListSets` requests using the current repository module.
     * @param {any} query
     * @returns {any}
     */
    listSets(query: any): any {
        /**
         * Parameters: resumptionToken (exclusive)
         * exceptions: badArgument, badResumptionToken, noSetHierarchy
         */
        const queryParameters = this.getQueryParameters(query);
        const exception: ExceptionParams = {
            baseUrl: this.parameters.baseURL,
            verb: VERBS.LIST_SETS,
        };
        if (
            queryParameters.length > 2 ||
            (queryParameters.length === 2 &&
                !CoreOaiProvider.hasKey(query, 'resumptionToken'))
        ) {
            // TODO: Throw error instead of returning
            return generateException(exception, EXCEPTION_CODES.BAD_ARGUMENT);
        } else {
            const mapped = this.mapper.mapOaiDcListSets([]);
            return generateResponse(
                <any>query,
                this.parameters.baseURL,
                mapped,
            );
        }
    }

    /**
     * Checks for key on the queryParameters object.
     * @param queryParameters {object}
     * @param key {string}
     * @returns {boolean}
     */
    private static hasKey(queryParameters: any, key: string): boolean {
        return Object.prototype.hasOwnProperty.call(queryParameters, key);
    }

    /**
     * Gets the query parameters provided by the http Request.
     * @param query
     * @returns {any[]}
     */
    private getQueryParameters(query: any) {
        return Object.keys(query)
            .map((key) => query[key])
            .filter(function (value) {
                return value !== undefined;
            });
    }

    /**
     * Validates that we have valid from and until value.
     * @param parameters
     * @returns {boolean}
     */
    private static hasValidSelectiveParams(parameters: any): boolean {
        if (parameters.until) {
            if (!parameters.from) {
                return false;
            }
            return parseInt(parameters.from) <= parseInt(parameters.until);
        }
        return true;
    }

    private hasSetSupport(): boolean {
        return this.oaiService.getProvider().setSupport;
    }

    private hasResumptionTokenSupport(): boolean {
        return this.oaiService.getProvider().resumptionSupport;
    }

    private isNotRecognizedParameter(query: any): boolean {
        return !Object.keys(query).every(
            (key) => this.possibleParams.indexOf(key) >= 0,
        );
    }

    private hasExclusiveParameterViolation(query: any) {
        return (
            CoreOaiProvider.hasKey(query, 'metadataPrefix') &&
            CoreOaiProvider.hasKey(query, 'resumptionToken')
        );
    }

    private hasInvalidListParameter(query: any): boolean {
        if (this.isNotRecognizedParameter(query)) {
            return true;
        } else if (
            CoreOaiProvider.hasKey(query, 'resumptionToken') &&
            !this.hasResumptionTokenSupport()
        ) {
            return true;
        } else if (this.hasExclusiveParameterViolation(query)) {
            return true;
        } else if (!CoreOaiProvider.hasValidSelectiveParams(query)) {
            return true;
        }
        return false;
    }
}
