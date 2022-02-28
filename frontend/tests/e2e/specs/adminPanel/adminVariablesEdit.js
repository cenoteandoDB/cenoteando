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
    it('Access Variables', () => {
        cy.get('div').contains('VARIABLES').click();
    });

    it('Edit Variables button', () => {
        cy.clickDataCy('editVariable_accessPlatform');
    });

    it('Description', () => {
        cy.clickDataCy('description')
            .clear()
            .type(
                'Flat horizontal surface at the entrance or exit of the cenote.',
            );
    });

    it('Select Variable Theme', () => {
        cy.clickDataCy('theme')
            .get('.v-list-item__title')
            .contains('ORGANIZATION')
            .click({ force: true });
        cy.clickDataCy('theme')
            .get('.v-list-item__title')
            .contains('DIVING')
            .click({ force: true });
    });

    it('Select Variable Theme', () => {
        cy.clickDataCy('access-level')
            .get('.v-list-item__title')
            .contains('PUBLIC')
            .click({ force: true });
        cy.clickDataCy('access-level')
            .get('.v-list-item__title')
            .contains('PRIVATE')
            .click({ force: true });
    });

    it('Select Data Type', () => {
        cy.clickDataCy('data-type')
            .get('.v-list-item__title')
            .contains('NO_TYPE')
            .click({ force: true });
    });

    it('Timeseries Box Checking', () => {
        cy.clickDataCy('timeseries').check({ force: true });
        cy.clickDataCy('timeseries').uncheck({ force: true });
        cy.clickDataCy('timeseries').uncheck({ force: true });
    });
});
