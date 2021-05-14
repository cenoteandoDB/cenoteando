import { Collection, Entities, Route, RouteArg } from 'type-arango';
import { GadmDocument } from '../documents';

@Collection({
    of: GadmDocument,
})
@Route.LIST(['guest'])
export default class Gadm extends Entities {
    @Route.GET(
        (path) => ':id',
        (roles) => ['guest'],
        ($) => ({ id: $(String) }),
        'Returns a Gadm Document by GID level 2',
    )
    static GET({ param }: RouteArg) {
        return Gadm.findOne({ filter: { 'properties.GID_2': param.id } });
    }
}
