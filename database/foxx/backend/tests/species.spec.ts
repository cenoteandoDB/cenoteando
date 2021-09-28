import { expect } from 'chai';
import request from '@arangodb/request';

const { baseUrl } = module.context;

const speciesUrl = `${baseUrl}/species`;

exports['/species suite'] = {
    'should work': () => {
        const response = request.get(speciesUrl);
        expect(response.status).to.equal(200);
    },
    'should be an array of species': () => {
        const response = request.get(speciesUrl);
        expect(response.status).to.equal(200);
        const species = JSON.parse(response.body.toString());
        expect(species).to.be.an('array');
        species.forEach((elem) => {
            expect(elem).to.have.all.keys('_key', 'iNaturalistId', 'aphiaId');
            expect(elem['_key']).to.be.a('string');
            expect(elem['iNaturalistId']).to.be.a('string');
            expect(elem['aphiaId']).to.be.a('string');
        });
    },
};
