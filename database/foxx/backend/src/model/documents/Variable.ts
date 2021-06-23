import { Attribute, Document, Entity } from 'type-arango';

// TODO: Set attribute schema and role permissions (schema, readers, writers)
// TODO: Implement getters, setters and helpers

enum Theme {
    LOCATION,
    GEOREFERENCE,
    CULTURAL,
    GEOMORPHOLOGY,
    BIODIVERSITY,
    DISTURBANCE,
    TOURISM,
    DIVING,
    ORGANIZATION,
    REGULATION,
    WATER,
    EVENT,
}

@Document()
export class Variable extends Entity {
    @Attribute()
    name: string;

    @Attribute()
    label: string;

    @Attribute()
    description: string;

    @Attribute()
    units?: string;

    @Attribute()
    constant: boolean;

    @Attribute()
    sensitive: boolean;

    @Attribute()
    public: boolean;

    @Attribute()
    theme: Theme;
}
