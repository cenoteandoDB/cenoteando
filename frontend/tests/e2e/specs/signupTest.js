describe('Sign-Up Test', () => {
   
    it('Visits the app root url', () => {
        cy.visit('http://localhost:8080/');
    });
	it('Login / Sign up form', () => {
        cy.clickLink(' LOGIN / SIGN UP ');
    });

    it('Sign up form', () => {
        cy.clickLink(' REGISTER ');
        cy.get('input[name=name]').type("Test");
        cy.get('input[name=email]').type("test@email.com");
        cy.get('input[name=current-password]').type("testpass");
        cy.clickButton(' SIGN UP ');
    })

   
   
});

