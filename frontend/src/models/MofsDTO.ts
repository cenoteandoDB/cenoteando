export default class MofsDTO {
    id!: string;
    timestamp!: string;
    value!: string;

    constructor(jsonObj?: MofsDTO) {
        if (jsonObj) {
            this.id = jsonObj.timestamp;
            this.timestamp = jsonObj.timestamp;
            this.value = jsonObj.value;
        }
    }
}
