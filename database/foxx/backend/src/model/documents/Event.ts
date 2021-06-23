import {
    Attribute,
    Document,
    Entity,
    OneToMany,
    OneToOne,
    Related,
} from 'type-arango';
import { MeasurementOrFact } from './MeasurementOrFact';
import { Cenote } from './Cenote';

// TODO: Set attribute schema and role permissions (schema, readers, writers)
// TODO: Implement getters, setters and helpers

export enum EventType {}

@Document()
export class Event extends Entity {
    @Attribute()
    type: EventType;

    @Attribute()
    date: Date;

    @Attribute()
    @OneToOne((type) => Cenote)
    cenote: Related<Cenote>;

    @Attribute()
    @OneToMany(
        (type) => MeasurementOrFact,
        (MeasurementOrFact) => MeasurementOrFact.event,
    )
    data: Related<MeasurementOrFact[]>;

    // TODO: Implement sources
    @Attribute()
    source: string;
}
