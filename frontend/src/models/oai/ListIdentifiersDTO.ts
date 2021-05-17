import { xml2json } from 'xml-js';

export class Identifier {
    id!: string;
    last_modified!: string;
}

export default class ListIdentifiersDTO {
    identifiers: Array<Identifier>;
    response_date: Date;

    constructor(data: string) {
        const xml = xml2json(data);
        console.log(xml);
        this.response_date = new Date();
        this.response_date.setTime(Date.parse('2021-05-14 04:13:07'));
        this.identifiers = [
            { id: 'id1', last_modified: '2021-05-14 03:58:07' },
            { id: 'id2', last_modified: '2021-05-14 03:58:41' },
        ];
    }
}
