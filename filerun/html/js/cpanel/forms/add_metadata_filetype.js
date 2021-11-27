FR.addDT = {
	sets: [{xtype: 'hidden'}]
};
Ext.each(FR.allSets, function(set) {
	FR.addDT.sets.push({xtype: 'checkbox', name:'sets[]', inputValue: set.id, boxLabel: set.name, checked: false});
});
FR.addDT.formPanel = new FR.components.editForm({
	title: FR.T('Add File Type'),
	layout: 'form', bodyStyle: 'padding:10px;', autoScroll: true,
	items: [
		{
			xtype:'fieldset',
			width: 500,
			defaults: {width: 250},
			items: [
				{
					xtype: 'textfield',
					fieldLabel: FR.T('File type name'),
					name: 'name', value: ''
				},{
					xtype: 'textarea',
					fieldLabel: FR.T('Description'),
					name: 'description', value: ''
				},
				{
					xtype: 'compositefield',
					fieldLabel: FR.T('Filed sets'),
					items: [{
						height: 100, width: 250, autoScroll: true, bodyStyle: 'border:1px solid silver;padding:5px',
						items: FR.addDT.sets
					}]
				},
				{
					xtype: 'textarea',
					fieldLabel: FR.T('File extensions'),
					helpText: FR.T('Comma separated list of file extensions that should automatically use this file type.'),
					name: 'ext', height: 60,
					value: ''
				},
				{
					xtype: 'textfield',
					fieldLabel: FR.T('File types'),
					helpText: FR.T('Comma separated list of file types that should automatically use this file type.'),
					name: 'file_types',
					value: ''
				}
			]
		}
	],
	tbar: [
		{
			text: FR.T('Add File Type'),
			cls: 'fr-btn-primary',
			ref: 'saveBtn',
			handler: function() {
				var editForm = this.ownerCt.ownerCt;
				var opts = {
					url: FR.URLRoot+'/?module=metadata&section=cpanel&page=add_filetype&action=add',
					maskText: 'Saving changes...'
				};
				editForm.submitForm(opts);
			}
		}
	]
});
Ext.getCmp('gridTabPanel').add(FR.addDT.formPanel);
FR.addDT.formPanel.show();