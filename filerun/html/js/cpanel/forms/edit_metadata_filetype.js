FR.editDT = {
	sets: [{xtype: 'hidden'}]
};
Ext.each(FR.allSets, function(set) {
	var o = {
		xtype: 'checkbox',
		name:'sets[]',
		inputValue: set.id,
		boxLabel: set.name,
		checked: (FR.dtInfo.sets.indexOf(set.id) !== -1)
	};
	if (set.system == '1') {
		o.disabled = true;
		o.disabledClass = 'x-item-enabled';
	}
	FR.editDT.sets.push(o);
});
FR.editDT.formPanel = new FR.components.editForm({
	title: FR.T('Edit File Type')+' "'+FR.dtInfo.name+'"',
	layout: 'form', bodyStyle: 'padding:10px;', autoScroll: true,
	defaults: {width: 250},
	items: [
		{
			xtype:'fieldset',
			width: 500,
			defaults: {width: 250},
			items: [
				{
					xtype: 'hidden',
					name: 'id',
					value: FR.dtInfo.id
				},
				{
					xtype: 'textfield',
					fieldLabel: FR.T('File type name'),
					name: 'name',
					value: FR.dtInfo.name
				},
				{
					xtype: 'textarea',
					fieldLabel: FR.T('Description'),
					name: 'description',
					value: FR.dtInfo.description
				},
				{
					xtype: 'compositefield',
					fieldLabel: FR.T('Field sets'),
					items: [{
						height: 100, width: 250, autoScroll: true, bodyStyle: 'border:1px solid silver;padding:5px',
						items: FR.editDT.sets
					}]
				},
				{
					xtype: 'textarea',
					fieldLabel: FR.T('File extensions'),
					helpText: FR.T('Comma separated list of file extensions that should automatically use this file type.'),
					name: 'ext', height: 60,
					value: FR.dtInfo.ext
				},
				{
					xtype: 'textfield',
					fieldLabel: FR.T('File types'),
					name: 'file_types',
					value: FR.dtInfo.file_types,
					helpText: FR.T('Comma separated list of file types that should automatically use this file type.')
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
					url: FR.URLRoot+'/?module=metadata&section=cpanel&page=edit_filetype&action=save',
					maskText: 'Saving changes...'
				};
				editForm.submitForm(opts);
			}
		},
		'->',
		{
			text: FR.T('Delete File Type'),
			iconCls: 'fa fa-fw fa-remove colorRed',
			handler: function(){FR.editDT.deleteHandler();}
		}
	]
});
FR.editDT.deleteHandler = function() {
	new Ext.ux.prompt({
		text: FR.T('Please confirm file type deletion.'),
		confirmHandler: function() {
			var opts = {
				url: FR.URLRoot+'/?module=metadata&section=cpanel&page=delete_filetype&id='+FR.dtInfo.id,
				maskText: 'Please wait...'
			};
			FR.editDT.formPanel.deleteAction(opts);
		}
	});
};
Ext.getCmp('gridTabPanel').add(FR.editDT.formPanel);
FR.editDT.formPanel.show();