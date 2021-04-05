'use strict';
const db = require('@arangodb').db;
const documentCollections = [
  "cenotes",
  "gadm"
];
const edgeCollections = [
];

for (const name of documentCollections) {
  if (!module.context.collection(name)) {
    const prefixedName = module.context.collectionName(name);
    db._createDocumentCollection(prefixedName);
  }
}

for (const name of edgeCollections) {
  if (!module.context.collection(name)) {
    const prefixedName = module.context.collectionName(name);
    db._createEdgeCollection(prefixedName);
  }
}
