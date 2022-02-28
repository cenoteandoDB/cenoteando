describe('Map', () => {
    it('Visits the app root url', () => {
        cy.visit('http://localhost:8080/');
    });
    it('Shows Map', () => {
        cy.clickDataCy('map');
    });
});
