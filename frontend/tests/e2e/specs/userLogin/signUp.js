describe('Login Form', () => {
    
    it('Visits the app root url', () => {
        cy.visit('http://localhost:8080/login');
    });
	it('User Registration', () => {
        cy.clickDataCy('register');
        cy.get('[name = name]').type('Test');
        cy.get('[name = email]').type('test@gmail.com');
        cy.get('[name = current-password]').type('testpassword');
        cy.clickDataCy('submit');
    });
   
});

