var FR = {UI: {translations:[]}};
Ext.onReady(function() {

	FR.win = new Ext.Window({
		title: FR.T('User Registration'),
		closable: false, draggable: false,
		maximized: Ext.isMobile,
		width: 450, autoScroll: true,
		bodyStyle:'padding:10px 40px 40px 40px', buttonAlign: 'left',
		items: [
			FR.registrationForm = new Ext.form.FormPanel({
				hideLabels: true,
				defaultType: 'textfield', autoHeight: true,
				defaults: {width: '100%', cls: 'loginFormField'},
				items: [
					{emptyText: FR.T('Username'), name: 'username'},
					{emptyText: FR.T('E-mail address'), name: 'email'},
					{
						xtype : 'compositefield', hidden: generatePass,
						items : [
							{
								flex : 1, emptyText: FR.T('Password'),
								name: 'password', cls: 'loginFormField',
								inputType: generatePass ? 'hidden' : 'password',
								xtype: generatePass ? 'hidden': 'textfield'
							},
							{
								flex : 1, emptyText: FR.T('Retype password'),
								name: 'repassword', cls: 'loginFormField',
								inputType: generatePass ? 'hidden' : 'password',
								xtype: generatePass ? 'hidden': 'textfield'
							}
						]
					},
					{
						xtype : 'compositefield',
						items : [
							{
								flex : 1, cls: 'loginFormField',
								xtype: 'textfield',
								name: 'first_name',
								emptyText: FR.T('First name')
							},
							{
								flex : 1, cls: 'loginFormField',
								xtype: 'textfield',
								name: 'last_name',
								emptyText: FR.T('Last name')
							}
						]
					},
					{emptyText: FR.T('Phone'), name: 'phone'},
					{emptyText: FR.T('Company'), name: 'company'},
					{emptyText: FR.T('Web site address'), name: 'website'},
					{
						emptyText: FR.T('Comment'),
						name: 'description',
						xtype: 'textarea'
					},
					{
						hidden: !Settings.enableCaptcha,
						hideLabel: true,
						xtype: 'field',
						height: 80,
						autoCreate: {tag: 'div', id: 'recaptcha', cls: 'g-recaptcha', style: 'margin-left:13px'}
					}
				]
			})
		],
		buttons: [
			{
				text: FR.T('Submit'),
				cls: 'fr-btn-primary',
				handler: function () {
					var button = this;
					button.disable();
					FR.win.el.mask(FR.T('Loading...'));
					FR.registrationForm.getForm().submit({
						url:signUpURL,
						failure: function(frm, act) {
							if (Settings.enableCaptcha) {grecaptcha.reset();}
							button.enable();
							FR.win.el.unmask();
							var msg = act.result ? act.result.error : FR.T('A problem was encountered while trying to submit the form: ')+act.response.statusText;
							new Ext.ux.prompt({text: msg});
						},
						success: function(frm, act) {
							button.enable();
							FR.win.el.unmask();
							new Ext.ux.prompt({text: act.result.message, callback: function() {document.location.href = URLRoot;}});
						}
					});
				}
			},
			'->',
			{
				text: FR.T('Sign in'), cls: 'fr-btn-link',
				handler: function(){document.location.href = URLRoot;}
			}
		]
	});
	FR.win.show();
	if (!Ext.isMobile) {
		FR.win.anchorTo(Ext.get('theBODY'), 'c-c');
	}
});

var onloadGRCCallback = function() {
	grecaptcha.render('recaptcha', {
		'sitekey': Settings.recaptcha_site_key
	});
};