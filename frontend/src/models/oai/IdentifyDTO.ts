import { xml2js } from 'xml-js';
import { parseISOString } from '@/services/ConvertDateService';

export default class IdentifyDTO {
    response_date: Date;
    repository_name: string;
    base_URL: string;
    protocol_version: number;
    admin_email: string;
    earliest_datestamp: Date;
    deleted_record: string;
    granularity: string;

    constructor(data: string) {
        const xml = xml2js(data, { compact: true });

        this.response_date = parseISOString(
            xml['OAI-PMH']['responseDate']._text,
        );
        this.repository_name =
            xml['OAI-PMH']['Identify']['repositoryName']._text;
        this.base_URL = xml['OAI-PMH']['Identify']['baseURL']._text;
        this.protocol_version =
            xml['OAI-PMH']['Identify']['protocolVersion']._text;
        this.admin_email = xml['OAI-PMH']['Identify']['adminEmail']._text;
        this.earliest_datestamp = parseISOString(
            xml['OAI-PMH']['Identify']['earliestDatestamp']._text,
        );
        this.deleted_record = xml['OAI-PMH']['Identify']['deletedRecord']._text;
        this.granularity = xml['OAI-PMH']['Identify']['granularity']._text;
    }
}
