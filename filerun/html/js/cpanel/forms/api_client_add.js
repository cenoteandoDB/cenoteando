FR.editClient = {};
FR.editClient.formPanel = new FR.components.editForm({
	title: FR.T('Add Oauth2 client'),
	layout: 'form', bodyStyle: 'padding:10px;',
	defaults: {labelWidth: 150, width: 500, defaults: {width: 300}}, autoScroll: true,
	items: [
		{
			xtype: 'fieldset',
			title: FR.T('Basic details'),
			items: [
				{
					xtype: 'checkbox',
					fieldLabel: FR.T('Enabled'),
					name: 'enabled',
					value: 1, checked: true
				},
				{
					xtype: 'textfield',
					fieldLabel: FR.T('Client/App name'),
					name: 'name',
					value: ''
				},
				{
					xtype: 'textfield',
					fieldLabel: FR.T('Logo URL'),
					name: 'logo_url',
					value: ''
				},
				{
					xtype: 'textfield',
					fieldLabel: FR.T('App website'),
					name: 'website',
					value: ''
				},
				{
					xtype: 'textfield',
					fieldLabel: FR.T('Publisher'),
					name: 'publisher',
					value: ''
				},
				{
					xtype: 'textfield',
					fieldLabel: FR.T('Website'),
					name: 'publisher_website',
					value: ''
				},
				{
					xtype: 'textarea',
					fieldLabel: FR.T('Description'),
					name: 'description',
					value: ''
				}
			]
		},
		{
			xtype: 'fieldset',
			title: FR.T('Security'),
			items: [
				{
					xtype: 'textfield',
					fieldLabel: FR.T('Client id'),
					name: 'cid',
					value: FR.clientID
				},
				{
					xtype: 'textfield',
					fieldLabel: FR.T('Client secret'),
					name: 'secret',
					value: FR.clientSecret
				},
				{
					xtype: 'textarea',
					fieldLabel: FR.T('Authorized redirect URIs'),
					name: 'redirect_uris',
					value: ''
				},
				{
					xtype: 'displayfield', style: 'color:gray', value:
				'<li>'+FR.T('One URI per line')+'</li>'+
				'<li>'+FR.T('Needs to start with "https://".')+'</li>'+
				'<li>'+FR.T('"http://" only allowed for "localhost".')+'</li>'+
				'<li>'+FR.T('No URL fragments, and no relative paths.')+'</li>'+
				'<li>'+FR.T('Can\'t be a non-private IP Address.')+'</li>'
				}
			]
		}
	],
	tbar: [
		{
			text: FR.T('Add client'),
			cls: 'fr-btn-primary',
			ref: 'saveBtn',
			handler: function() {
				var editForm = this.ownerCt.ownerCt;
				var opts = {
					url: FR.URLRoot+'/?module=oauth&section=cpanel&page=client_add&action=add',
					maskText: 'Saving changes...'
				};
				editForm.submitForm(opts);
			}
		}
	]
});
Ext.getCmp('gridTabPanel').add(FR.editClient.formPanel);
FR.editClient.formPanel.show();