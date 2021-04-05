import { BackendService } from '../../../shared/src';
export default class CenoteandoBackendService implements BackendService {
  collection(name: string): ArangoDB.Collection | null {
    return module.context.collection(name);
  }

  collectionName(name: string): string {
    return module.context.collectionName(name);
  }
}
