FR.editSettings = {
	confirmAuthPluginChange: false,
	saveChanges: function() {
		var editForm = this.formPanel;
		var params = editForm.form.getFieldValues();
		var extra = {};
		extra['settings[guest_users]'] = Ext.get('settings[guest_users]').dom.checked ? 1:0;
		Ext.apply(params, extra);
		var opts = {
			url: FR.URLRoot+'/?module=cpanel&section=settings&action=save',
			maskText: 'Saving changes...',
			params: params
		};
		editForm.submitForm(opts);
	}
};
FR.editSettings.formPanel = new FR.components.editForm({
	title: FR.T('User login and registration'), autoScroll: true,
	layout: 'form', bodyStyle: 'padding:10px;',
	defaults: {width: 600}, labelWidth: 160,
	items: [
		{
			xtype: 'fieldset',
			checkboxToggle: {tag: 'input', type: 'checkbox', id: 'settings[guest_users]'},
			checkboxName: 'settings[guest_users]',
			title: FR.T('Enable guest user accounts'), animCollapse: true,
			collapsed: !parseInt(FR.settings.guest_users),
			listeners: {'expand': function() {this.doLayout();}},
			items: [
				{
					xtype: 'combo',
					fieldLabel: FR.T('Inactive accounts'),
					name: 'settings[guest_users_delete]', hiddenName: 'settings[guest_users_delete]',
					autoCreate: true, mode: 'local', editable: false,
					emptyText: FR.T('Select...'), width: 250,
					displayField: 'name', valueField: 'id',
					triggerAction:'all', disableKeyFilter: true,
					value: (FR.settings.guest_users_delete || 'never'),
					store: new Ext.data.SimpleStore({fields: ['id', 'name'], data: [
						['1w', FR.T('Delete after one week')],
						['1m', FR.T('Delete after one month')],
						['6m', FR.T('Delete after six months')],
						['never', FR.T('Do not delete')]
					]})
				}
			]
		}
	],
	tbar: [
		{
			text: FR.T('Save changes'), cls: 'fr-btn-primary',
			ref: 'saveBtn',
			handler: FR.editSettings.saveChanges, scope: FR.editSettings
		}
	]
});
Ext.getCmp('appTab').add(FR.editSettings.formPanel);
Ext.getCmp('appTab').doLayout(false, true);