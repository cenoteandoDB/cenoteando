import { Attribute, Document, Entity, Index } from 'type-arango';
import { Feature, Geometry } from 'geojson';

// TODO: Set attribute schema and role permissions (schema, readers, writers)
// TODO: Implement getters, setters and helpers?

export type GADMProperties = {
  // TODO: discriminate each property
};

@Document()
export class GADM extends Entity implements Feature {
  @Index({
    type: 'geo',
  })
  @Attribute()
  geometry!: Geometry;

  @Attribute()
  properties!: GADMProperties;

  @Attribute()
  type!: 'Feature';
}
