'use strict';
const db = require('@arangodb').db;
const allCollections = [
  "cenotes",
  "gadm"
];

for (const name of allCollections) {
  const prefixedName = module.context.collectionName(name);
  db._drop(prefixedName);
}
