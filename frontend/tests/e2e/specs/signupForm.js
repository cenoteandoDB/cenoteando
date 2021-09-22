describe('Sign Up Form', () => {
    
    it('Visits the app root url', () => {
        cy.visit('http://localhost:8080/login');
    });
	it('Sign up form', () => {
        cy.clickDataCy('register');
    });
   
});