export class Identifier {
    id!: string;
    last_modified!: string;
}

export default class ListIdentifiersDTO {
    identifiers: Array<Identifier>;

    constructor(data: string) {
        console.log(data);
        this.identifiers = [
            { id: 'id1', last_modified: '2021-05-14 03:58:07' },
            { id: 'id2', last_modified: '2021-05-14 03:58:41' },
        ];
    }
}
