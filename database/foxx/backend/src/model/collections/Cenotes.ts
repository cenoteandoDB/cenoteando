import { Collection, Entities } from 'type-arango';
import { Cenote } from '../documents/Cenote';

@Collection({
  of: Cenote,
})
export default class Cenotes implements Entities {}
