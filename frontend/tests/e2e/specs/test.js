// https://docs.cypress.io/api/introduction/api.html

describe('My First Test', () => {
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
    // it('Maps', () => {
    //     cy.clickLink(' MAP ');
    // });
    // it('Test opening cenoteando.mx', () => {
    //     cy.clickLink(' CENOTEANDO.MX ');
    // });
    it('OAI-PMH', () => {
        cy.clickLink(' OAI-PMH ');
        cy.clickDiv('IDENTIFY');
        cy.clickLink(' OAI-PMH ');
        cy.clickDiv('GET RECORD');
        cy.clickLink(' OAI-PMH ');
        cy.clickDiv('LIST RECORDS');
    });

    it('Opens Map', () => {
        cy.clickLink(' MAP ');
    });
});

