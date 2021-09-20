describe('Sign-Up Test', () => {
	Cypress.Commands.add('clickLink', (label) => {
		cy.get('span').contains(label).click()
	  })
      Cypress.Commands.add('clickDiv', (label) => {
		cy.get('div').contains(label).click()
	  })
   
    it('Visits the app root url', () => {
        cy.visit('http://localhost:8080/');
    });
	it('Login / Sign up form', () => {
        cy.clickLink(' LOGIN / SIGN UP ');
    });

    it('Sign up form', () => {
        cy.clickLink(' REGISTER ');
    })
   
});

