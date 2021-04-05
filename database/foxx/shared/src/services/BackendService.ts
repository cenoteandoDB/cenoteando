export interface BackendService {
    collection(name : string) : ArangoDB.Collection | null;
    collectionName(name : string) : string;
}