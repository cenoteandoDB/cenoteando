describe('Admin Panel Access', () => {
    it('Visits the app root url', () => {
        cy.visit('http://localhost:8080/login');
    });
    it('Log user in', () => {
        cy.get('[name = email]').type('test@gmail.com');
        cy.get('[name = current-password]').type('testpassword');
        cy.clickDataCy('login-user');
    });

    it('Access Admin Panel', () => {
        cy.get('div').contains(' ADMIN ').click();
    });
    it('Access Cenotes', () => {
        cy.get('div').contains('CENOTES').click();
    });

    it('Edit Cenote button', () => {
        cy.clickDataCy('editCenote121');
    });

    it('Select cenote type', () => {
        cy.clickDataCy('cenote-type')
            .get('.v-list-item__title')
            .contains('CENOTE')
            .click({ force: true });
        cy.clickDataCy('cenote-type')
            .get('.v-list-item__title')
            .contains('DRY_CAVE')
            .click({ force: true });
    });

    it('Tourism checkbox', () => {
        cy.clickDataCy('touristic').uncheck({ force: true });
        cy.clickDataCy('touristic').check({ force: true });
    });

    it('Coordinates', () => {
        cy.clickDataCy('coordinates').type('89 70');
    });

    it('Choose Cenote Issues', () => {
        cy.clickDataCy('cenote-issues')
            .get('.v-list-item__title')
            .contains('GEOTAG_NOT_VERIFIED')
            .click({ force: true });
    });
});
