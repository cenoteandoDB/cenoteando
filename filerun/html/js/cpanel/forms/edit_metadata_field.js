Ext.getCmp('gridTabPanel').add(new FR.components.editForm({
	title: FR.T('Edit Field'),
	layout: 'form', bodyStyle: 'padding:10px;', autoScroll: true,
	labelWidth: 130,
	items: [
		{
			xtype: 'fieldset',
			width: 500,
			defaults: {width: 200},
			items: [
				{
					xtype: 'hidden',
					name: 'id',
					value: FR.fieldInfo.id
				},
				{
					xtype: 'textfield',
					fieldLabel: FR.T('Field name'),
					name: 'name',
					value: FR.fieldInfo.name
				},{
					xtype: 'textarea',
					fieldLabel: FR.T('Description'),
					name: 'description',
					value: FR.fieldInfo.description
				},{
					xtype: 'checkbox',
					boxLabel: FR.T('Show by default as column in file grid'),
					width: 400, value: 1,
					name: 'show_column_by_default', checked: parseInt(FR.fieldInfo.show_column_by_default)
				},{
					xtype: 'checkbox',
					boxLabel: FR.T('Hide fieldset name in column header'),
					width: 400, value: 1,
					name: 'hide_fieldset_name_in_column', checked: parseInt(FR.fieldInfo.hide_fieldset_name_in_column)
				},{
					xtype: 'checkbox',
					boxLabel: FR.T('Prevent field from being shared via web links'),
					width: 400, value: 1,
					name: 'hide_field_via_weblinks', checked: parseInt(FR.fieldInfo.hide_field_via_weblinks)
				},
				{
					xtype: 'combo',
					fieldLabel: FR.T('Field type'),
					hiddenName: 'type',
					mode: 'local', editable: false,
					emptyText: FR.T('Select...'), 
					displayField: 'label', valueField: 'val',
					triggerAction:'all', disableKeyFilter: true,
					value: FR.fieldInfo.type,
					store: new Ext.data.SimpleStore({fields: ['val', 'label'], data: [
						['small', FR.T('Small text')],
						['normal', FR.T('Normal text')],
						['large', FR.T('Large text')],
						['list', FR.T('Single value')],
						['multiple', FR.T('Multiple values')],
						['date', FR.T('Date/time')],
						['stars', FR.T('Star rating')]
					]}),
					listeners: {
						'beforeselect': function(f, record) {
							f.ownerCt.predefined_values.setVisible(['multiple', 'list'].indexOf(record.data.val) != -1);
							f.ownerCt.autocomp.setVisible(['small', 'normal', 'multiple'].indexOf(record.data.val) != -1);
						}
					}
				},
				{
					xtype: 'checkbox',
					boxLabel: FR.T('Enable autocomplete'), hidden: !(['small', 'normal', 'multiple'].indexOf(FR.fieldInfo.type) != -1),
					width: 400, value: 1, ref: 'autocomp',
					name: 'autocomplete', checked: parseInt(FR.fieldInfo.autocomplete),
					listeners: {
						'check': function (field, checked) {
							this.ownerCt.predefined_values.setVisible(!checked);
						}
					}
				},
				{
					xtype: 'textarea', width: 300,  ref: 'predefined_values',
					fieldLabel: FR.T('Predefined values'), hidden: (!(['list', 'multiple'].indexOf(FR.fieldInfo.type) != -1) || parseInt(FR.fieldInfo.autocomplete)),
					name: 'options', value: FR.fieldInfo.options,
					helpText: FR.T('Separate values by commas. Example: one, two, three')
				},{
					xtype: 'textfield', width: 300,
					fieldLabel: FR.T('Automatic source'),
					name: 'source', value: FR.fieldInfo.source,
					helpText: FR.T('This is the path to the "Media Info" field.')
				},
				{
					xtype: 'textfield', width: '50',
					fieldLabel: FR.T('Sort'),
					name: 'sort', value: FR.fieldInfo.sort,
					helpText: FR.T('Set a number to define the field\'s sorting position.')
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
					url: FR.URLRoot+'/?module=metadata&section=cpanel&page=edit_field&action=save',
					maskText: 'Saving changes...'
				};
				editForm.submitForm(opts);
			}
		}
	]
})).show();