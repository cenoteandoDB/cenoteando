import { Collection, Entities } from 'type-arango';
import { MeasurementOrFactBucket } from '../documents';

@Collection({
    of: MeasurementOrFactBucket,
})
export class MeasurementsOrFacts extends Entities {}
