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
    it('Access Species', () => {
        cy.get('div').contains('SPECIES').click();
    });
});

