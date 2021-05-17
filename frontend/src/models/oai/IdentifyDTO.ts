import { xml2js } from 'xml-js';
import { parseISOString } from '@/services/ConvertDateService';

export default class IdentifyDTO {
    responseDate: Date;
    repositoryName: string;
    baseURL: string;
    protocolVersion: number;
    adminEmail: string;
    earliestDatestamp: Date;
    deletedRecord: string;
    granularity: string;

    constructor(data: string) {
        const xml = xml2js(data, { compact: true });
        this.responseDate = parseISOString(
            xml['OAI-PMH']['responseDate']._text,
        );
        this.repositoryName =
            xml['OAI-PMH']['Identify']['repositoryName']._text;
        this.baseURL = xml['OAI-PMH']['Identify']['baseURL']._text;
        this.protocolVersion =
            xml['OAI-PMH']['Identify']['protocolVersion']._text;
        this.adminEmail = xml['OAI-PMH']['Identify']['adminEmail']._text;
        this.earliestDatestamp = parseISOString(
            xml['OAI-PMH']['Identify']['earliestDatestamp']._text,
        );
        this.deletedRecord = xml['OAI-PMH']['Identify']['deletedRecord']._text;
        this.granularity = xml['OAI-PMH']['Identify']['granularity']._text;
    }
}
