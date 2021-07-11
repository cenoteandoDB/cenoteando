export default class CommentDTO {
    _key!: string;
    cenote_id!: string;
    rating!: number;
    source!: string;
    text!: string;
    timestamp!: string;
    url!: string;

    constructor(jsonObj?: CommentDTO) {
        if (jsonObj) {
            this._key = jsonObj._key;
            this.cenote_id = jsonObj.cenote_id;
            this.rating = jsonObj.rating;
            this.source = jsonObj.source;
            this.text = jsonObj.text;
            this.timestamp = jsonObj.timestamp;
            this.url = jsonObj.url;
        }
    }
}
