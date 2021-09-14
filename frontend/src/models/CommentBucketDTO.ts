export class CommentDto {
    rating!: number;
    text!: string;
    timestamp!: string;
}

export default class CommentBucketDTO {
    _key!: string;
    cenoteId!: string;
    source!: string;
    url!: string;
    count!: number;
    sumRating!: number;
    comments!: CommentDto[];

    constructor(jsonObj?: CommentBucketDTO) {
        if (jsonObj) {
            this._key = jsonObj._key;
            this.cenoteId = jsonObj.cenoteId;
            this.source = jsonObj.source;
            this.url = jsonObj.url;
            this.count = jsonObj.count;
            this.sumRating = jsonObj.sumRating;
            this.comments = jsonObj.comments;
        }
    }
}
