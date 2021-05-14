import { Collection, Entities, Route } from 'type-arango';
import { Cenote } from '../documents';

@Collection({
    of: Cenote,
})
export default class Cenotes extends Entities {
    @Route.GET(
        'get-coordinates',
        ['guest'],
        'Returns the coordinates of all touristic cenotes',
    )
    static GET_COORDINATES(): Array<{
        name: string;
        type: string;
        coordinates: {
            latitude: number;
            longitude: number;
        };
    }> {
        return Cenotes.find({ filter: { 'properties.touristic': true } }).map(
            (cenote) => {
                return {
                    name: cenote.properties.name,
                    type: cenote.properties.type,
                    coordinates: {
                        latitude: cenote.geometry.coordinates[1],
                        longitude: cenote.geometry.coordinates[0],
                    },
                };
            },
        );
    }
}
