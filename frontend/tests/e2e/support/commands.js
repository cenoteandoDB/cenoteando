// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add('clickDataCy', (label) => {
    cy.get(`[data-cy='${label}']`).click();
});

Cypress.Commands.add('clickDataCy', (label) => {
    cy.get(`[data-cy='${label}']`).click({ force: true });
});

Cypress.Commands.add('clickDataFirst', (label) => {
    cy.get(`[data-cy='${label}']`).first().click({ force: true });
});

Cypress.Commands.add('clickLink', (label) => {
    cy.get('span').contains(label).click();
});
