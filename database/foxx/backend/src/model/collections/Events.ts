import { Collection, Entities } from 'type-arango';
import { Event } from '../documents';

@Collection({
    of: Event,
    relations: ['data'],
})
export class Events extends Entities {}
