FR.editClient = {};
FR.editClient.formPanel = new FR.components.editForm({
	title: FR.T('Edit Oauth2 client'),
	layout: 'form', bodyStyle: 'padding:10px;',
	defaults: {labelWidth: 150, width: 500, defaults: {width: 300}}, autoScroll: true,
	items: [
		{
			xtype: 'hidden',
			name: 'id',
			value: FR.clientInfo.id
		},
		{
			xtype: 'fieldset',
			title: FR.T('Basic details'),
			items: [
				{
					xtype: 'checkbox',
					fieldLabel: FR.T('Enabled'),
					name: 'enabled',
					value: 1, checked: parseInt(FR.clientInfo.enabled)
				},
				{
					xtype: 'textfield',
					fieldLabel: FR.T('Client/App name'),
					name: 'name',
					value: FR.clientInfo.name
				},
				{
					xtype: 'textfield',
					fieldLabel: FR.T('Logo URL'),
					name: 'logo_url',
					value: FR.clientInfo.logo_url
				},
				{
					xtype: 'textfield',
					fieldLabel: FR.T('App website'),
					name: 'website',
					value: FR.clientInfo.website
				},
				{
					xtype: 'textfield',
					fieldLabel: FR.T('Publisher'),
					name: 'publisher',
					value: FR.clientInfo.publisher
				},
				{
					xtype: 'textfield',
					fieldLabel: FR.T('Website'),
					name: 'publisher_website',
					value: FR.clientInfo.publisher_website
				},
				{
					xtype: 'textarea',
					fieldLabel: FR.T('Description'),
					name: 'description',
					value: FR.clientInfo.description
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
					value: FR.clientInfo.cid, readOnly: true
				},
				{
					xtype: 'textfield',
					fieldLabel: FR.T('Client secret'),
					name: 'secret',
					value: FR.clientInfo.secret, readOnly: true
				},
				{
					xtype: 'textarea',
					fieldLabel: FR.T('Authorized redirect URIs'),
					name: 'redirect_uris',
					value: FR.clientInfo.URIs
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
			text: FR.T('Save changes'),
			cls: 'fr-btn-primary',
			ref: 'saveBtn',
			handler: function() {
				var editForm = this.ownerCt.ownerCt;
				var opts = {
					url: FR.URLRoot+'/?module=oauth&section=cpanel&page=client_edit&action=save',
					maskText: 'Saving changes...',
					params: editForm.form.getFieldValues()
				};
				editForm.submitForm(opts);
			}
		},
		'->',
		{
			text: FR.T('Delete client'),
			iconCls: 'fa fa-fw fa-remove colorRed',
			handler: function(){FR.editClient.deleteHandler();}
		}
	]
});
FR.editClient.deleteHandler = function() {
	new Ext.ux.prompt({
		text: FR.T('Please confirm client deletion.'),
		confirmHandler: function() {
			var opts = {
				url: FR.URLRoot+'/?module=oauth&section=cpanel&page=client_delete&id='+FR.clientInfo.id,
				maskText: 'Please wait...'
			};
			FR.editClient.formPanel.deleteAction(opts);
		}
	});
};
Ext.getCmp('gridTabPanel').add(FR.editClient.formPanel);
FR.editClient.formPanel.show();