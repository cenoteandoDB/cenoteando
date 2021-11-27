FR.addDefaultViewer = {
	typeStore: new Ext.data.SimpleStore({idIndex: 0, fields: ['type', 'name', 'extList'], data: FR.types})
};
FR.addDefaultViewer.formPanel = new FR.components.editForm({
	title: FR.T('Add default viewer'),
	layout: 'form', bodyStyle: 'padding:10px;', autoScroll: true,
	defaults: {width: 220}, labelWidth:150,
	items: [
		{
			xtype: 'combo',
			fieldLabel: FR.T('File type'),
			name: 'type',
			autoCreate: true, mode: 'local', editable: false,
			displayField: 'name', valueField: 'type',
			value: '-', triggerAction:'all',
			store: FR.addDefaultViewer.typeStore,
			listeners: {
				'beforeselect': function(f, record) {
					if (record.data.type == '-') {
						f.ownerCt.extList.setVisible(false);
						f.ownerCt.ext.setVisible(true);
					} else {
						f.ownerCt.extList.setValue(record.data.extList);
						f.ownerCt.extList.setVisible(true);
						f.ownerCt.ext.setValue('');
						f.ownerCt.ext.setVisible(false);
					}
				}
			}
		},
		{
			xtype: 'textfield',
			fieldLabel: FR.T('File extension'), width: 60,
			name: 'ext', ref: 'ext',
			value: ''
		},
		{
			xtype: 'displayfield', ref: 'extList',
			fieldLabel: FR.T('File extensions'), hidden: true,
			value: ''
		},
		{
			xtype: 'combo',
			fieldLabel: FR.T('Preview with'),
			name: 'handler',
			autoCreate: true, mode: 'local', editable: false,
			displayField: 'name', valueField: 'handler',
			triggerAction:'all',
			value: 'open_in_browser',
			store: new Ext.data.SimpleStore({fields: ['handler', 'name'], data: FR.viewers})
		},
		{
			xtype: 'combo',
			fieldLabel: FR.T('Edit with'),
			name: 'handler_edit',
			autoCreate: true, mode: 'local', editable: false,
			displayField: 'name', valueField: 'handler',
			triggerAction:'all',
			value: '-',
			store: new Ext.data.SimpleStore({fields: ['handler', 'name'], data: FR.viewers})
		},
		{
			xtype: 'combo',
			fieldLabel: FR.T('Web links preview with'),
			name: 'weblink_handler',
			autoCreate: true, mode: 'local', editable: false,
			displayField: 'name', valueField: 'handler',
			triggerAction:'all',
			value: '-',
			store: new Ext.data.SimpleStore({fields: ['handler', 'name'], data: FR.weblink_handlers})
		},
		{
			xtype: 'combo',
			fieldLabel: FR.T('Web links edit with'),
			name: 'weblink_edit_handler',
			autoCreate: true, mode: 'local', editable: false,
			displayField: 'name', valueField: 'handler',
			triggerAction:'all',
			value: '-',
			store: new Ext.data.SimpleStore({fields: ['handler', 'name'], data: FR.weblink_handlers})
		}
	],
	tbar: [
		{
			text: FR.T('Add'),
			cls: 'fr-btn-primary',
			ref: 'saveBtn',
			handler: function() {
				var editForm = this.ownerCt.ownerCt;
				var params = editForm.form.getFieldValues();
				var opts = {
					url: FR.URLRoot+'/?module=custom_actions&section=cpanel&page=defaults_add&action=add',
					maskText: 'Saving changes...',
					params: params
				};
				editForm.submitForm(opts);
			}
		}
	]
});
Ext.getCmp('gridTabPanel').add(FR.addDefaultViewer.formPanel);
FR.addDefaultViewer.formPanel.show();