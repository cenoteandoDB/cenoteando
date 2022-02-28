describe('Oai-Pmh', () => {
    it('Visits the app root url', () => {
        cy.visit('http://localhost:8080/');
    });
    it('OAI hovering', () => {
        //there's no hover function in cypress
        cy.clickDataCy('oai-pmh');
    });
});
