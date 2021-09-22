describe('Login Form', () => {
    
    it('Visits the app root url', () => {
        cy.visit('http://localhost:8080/');
    });
	it('Login', () => {
        cy.clickDataCy('login');
    });
   
});

