FR.addFieldSet = {};
FR.addFieldSet.formPanel = new FR.components.editForm({
	title: FR.T('Add Field Set'),
	layout: 'form', bodyStyle: 'padding:10px;', autoScroll: true,
	items: [
		{
			xtype: 'fieldset',
			title: FR.T('Basic Info'),
			width: 500,
			defaults: {width: 250},
			items: [
				{
					xtype: 'textfield',
					fieldLabel: FR.T('Field set name'),
					name: 'name',
					value: ''
				},{
					xtype: 'textarea',
					fieldLabel: FR.T('Description'),
					name: 'description',
					value: ''
				},
				{
					xtype: 'checkbox',
					boxLabel: FR.T('Generic field set'),
					width: 400, value: 1,
					helpText: FR.T('A generic field set is one that is available for every file by default.'),
					name: 'generic', checked: false
				}
			]
		},
		{
			xtype: 'fieldset',
			title: FR.T('Fields'),
			width: 500,
			defaults: {width: 250},
			items: [
				{
					xtype: 'panel', border: false,
					html: FR.T('Fields can be added after creating the set.')
				}
			]
		}
	],
	tbar: [
		{
			text: FR.T('Add Field Set'),
			cls: 'fr-btn-primary',
			ref: 'saveBtn',
			handler: function() {
				var editForm = this.ownerCt.ownerCt;
				var opts = {
					url: FR.URLRoot+'/?module=metadata&section=cpanel&page=add_fieldset&action=add',
					maskText: 'Saving changes...'
				};
				editForm.submitForm(opts);
			}
		}
	]
});
Ext.getCmp('gridTabPanel').add(FR.addFieldSet.formPanel);
FR.addFieldSet.formPanel.show();