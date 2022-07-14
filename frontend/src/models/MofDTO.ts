export default class MofDTO {
    cenoteId!: string;
    variableId!: string;
    timestamp!: string;
    value!: string;

    constructor(jsonObj?: MofDTO) {
        if (jsonObj) {
            this.cenoteId = jsonObj.cenoteId;
            this.variableId = jsonObj.variableId;
            this.timestamp = jsonObj.timestamp;
            this.value = jsonObj.value;
        }
    }
}