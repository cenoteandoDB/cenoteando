import { Collection, Entities } from 'type-arango';
import { MeasurementOrFact } from '../documents';

@Collection({
    of: MeasurementOrFact,
})
export class MeasurementsOrFacts extends Entities {}
