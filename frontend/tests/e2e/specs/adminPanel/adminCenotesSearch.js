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
    it('Access Cenotes', () => {
        cy.get('div').contains('CENOTES').click();
    });

    it('Searching', () => {
        cy.get('[id = input-107]').type('121');
        cy.get('[id = input-107]').clear();
        cy.get('[id = input-107]').type('3');
    });
   
});

