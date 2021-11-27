FR.editSettings = {};
FR.editSettings.formPanel = new FR.components.editForm({
	title: FR.T('Password policy'), autoScroll: true,
	layout: 'form', bodyStyle: 'padding:10px;',
	defaults: {width: 600}, labelWidth: 150,
	items: [
		{
			xtype: 'fieldset',
			defaults: {width: 400},
			items: [
				{
					xtype: 'textfield', width: 60,
					fieldLabel: FR.T('Minimum password length'),
					name: 'settings[passwords_min_length]', value: FR.settings.passwords_min_length,
					helpText: FR.T('Recommended value:')+' 12'
				},
				{
					xtype: 'checkbox',
					boxLabel: FR.T('Passwords should contain both letters and digits'), value: 1,
					name: 'settings[passwords_letters_and_digits]', checked: parseInt(FR.settings.passwords_letters_and_digits)
				},
				{
					xtype: 'checkbox',
					boxLabel: FR.T('Passwords should contain at least one uppercase letter'), value: 1,
					name: 'settings[passwords_requires_uppercase]', checked: parseInt(FR.settings.passwords_requires_uppercase)
				},
				{
					xtype: 'checkbox',
					boxLabel: FR.T('Passwords should contain at least one special character'), value: 1,
					name: 'settings[passwords_requires_special]', checked: parseInt(FR.settings.passwords_requires_special),
					helpText: FR.T('Special characters:'+'`~!@#$%^&*()_=+{}[]\|;<>\'')
				},
				{
					xtype: 'checkbox',
					boxLabel: FR.T('Passwords should not contain keyboard row sequences'), value: 1,
					name: 'settings[passwords_prevent_seq]', checked: parseInt(FR.settings.passwords_prevent_seq),
					helpText: FR.T('Example sequences:')+'qwer, asdf, zxcv, 1234'
				},
				{
					xtype: 'checkbox',
					boxLabel: FR.T('Prevent user information to be used as part of the password'), value: 1,
					name: 'settings[passwords_prevent_common]', checked: parseInt(FR.settings.passwords_prevent_common)
				},
				{
					xtype: 'textfield', width: 60,
					fieldLabel: FR.T('Number of days users can use the same passwords'),
					name: 'settings[passwords_life_time]', value: FR.settings.passwords_life_time,
					helpText: FR.T('The users will be asked to change their passwords at this interval.')
				}
			]
		}
	],
	tbar: [
		{
			text: FR.T('Save changes'), cls: 'fr-btn-primary',
			ref: 'saveBtn',
			handler: function() {
				var editForm = this.ownerCt.ownerCt;
				var params = editForm.form.getFieldValues();
				var opts = {
					url: FR.URLRoot+'/?module=cpanel&section=settings&page=login_registration&action=save',
					maskText: 'Saving changes...',
					params: params
				};
				editForm.submitForm(opts);
			}
		}
	]
});
Ext.getCmp('appTab').add(FR.editSettings.formPanel);
Ext.getCmp('appTab').doLayout(false, true);