Ext.getCmp('gridTabPanel').add(new FR.components.editForm({
	title: FR.T('Add Group'),
	layout: 'form', bodyStyle: 'padding:10px;',
	defaults: {width: 250},
	autoScroll: true,
	items: [
		{
			xtype: 'textfield',
			fieldLabel: FR.T('Group name'),
			name: 'name',
			value: ''
		},{
			xtype: 'textarea',
			fieldLabel: FR.T('Description'),
			name: 'description',
			value: ''
		},
		{
			xtype: 'userslistfield',
			name: 'users', allItemsText: FR.T('[All users]'),
			value: '', showSelf: true, allowAll: true,
			fieldLabel: FR.T('Users'),
			tcfg: {height: 200, width: 250}
		}
	],
	tbar: [
		{
			text: FR.T('Add Group'),
			cls: 'fr-btn-primary',
			ref: 'saveBtn',
			handler: function() {
				var editForm = this.ownerCt.ownerCt;
				var opts = {
					url: FR.URLRoot+'/?module=user_groups&section=cpanel&page=add&action=add',
					maskText: 'Saving changes...'
				};
				editForm.submitForm(opts);
			}
		}
	]
})).show();