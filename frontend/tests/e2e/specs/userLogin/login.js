describe('Login Form', () => {
    it('Visits the app root url', () => {
        cy.visit('http://localhost:8080/login');
    });
    it('Log user in', () => {
        cy.get('[name = email]').type('test@gmail.com');
        cy.get('[name = current-password]').type('testpassword');
        cy.clickDataCy('login-user');
    });
});
