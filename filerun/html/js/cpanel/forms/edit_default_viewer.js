FR.editDefaultViewer = {
	typeStore: new Ext.data.SimpleStore({idIndex: 0, fields: ['type', 'name', 'extList'], data: FR.types})
};
FR.editDefaultViewer.extList = '';
if (FR.entry.type) {
	var selectedType = FR.editDefaultViewer.typeStore.getById(FR.entry.type);
	if (selectedType) {
		FR.editDefaultViewer.extList = selectedType.data.extList;
	}
}
FR.editDefaultViewer.formPanel = new FR.components.editForm({
	title: FR.T('Edit default viewer'),
	layout: 'form', bodyStyle: 'padding:10px;', autoScroll: true,
	defaults: {width: 220}, labelWidth:150,
	items: [

		{
			xtype: 'hidden',
			name: 'id',
			value: FR.entry.id
		},
		{
			xtype: 'displayfield',
			fieldLabel: FR.T('File type'),
			value: FR.entry.typeName || '-', hidden: (FR.entry.ext != '')
		},
		{
			xtype: 'textfield',
			fieldLabel: FR.T('File extension'), width: 60,
			name: 'ext', ref: 'ext', hidden: (FR.entry.type != '-'),
			value: FR.entry.ext
		},
		{
			xtype: 'displayfield', ref: 'extList',
			fieldLabel: FR.T('File extensions'), hidden: (FR.entry.type == '-'),
			value: FR.editDefaultViewer.extList
		},
		{
			xtype: 'combo',
			fieldLabel: FR.T('Preview with'),
			name: 'handler',
			autoCreate: true, mode: 'local', editable: false,
			displayField: 'name', valueField: 'handler',
			triggerAction:'all',
			value: FR.entry.handler,
			store: new Ext.data.SimpleStore({fields: ['handler', 'name'], data: FR.viewers})
		},
		{
			xtype: 'combo',
			fieldLabel: FR.T('Edit with'),
			name: 'handler_edit',
			autoCreate: true, mode: 'local', editable: false,
			displayField: 'name', valueField: 'handler',
			triggerAction:'all',
			value: FR.entry.handler_edit,
			store: new Ext.data.SimpleStore({fields: ['handler', 'name'], data: FR.viewers})
		},
		{
			xtype: 'combo',
			fieldLabel: FR.T('Web links preview with'),
			name: 'weblink_handler',
			autoCreate: true, mode: 'local', editable: false,
			displayField: 'name', valueField: 'handler',
			triggerAction:'all',
			value: FR.entry.weblink_handler,
			store: new Ext.data.SimpleStore({fields: ['handler', 'name'], data: FR.weblink_handlers})
		},
		{
			xtype: 'combo',
			fieldLabel: FR.T('Web links edit with'),
			name: 'weblink_edit_handler',
			autoCreate: true, mode: 'local', editable: false,
			displayField: 'name', valueField: 'handler',
			triggerAction:'all',
			value: FR.entry.weblink_edit_handler,
			store: new Ext.data.SimpleStore({fields: ['handler', 'name'], data: FR.weblink_handlers})
		}
	],
	tbar: [
		{
			text: FR.T('Save changes'),
			cls: 'fr-btn-primary',
			ref: 'saveBtn',
			handler: function() {
				var editForm = this.ownerCt.ownerCt;
				var params = editForm.form.getFieldValues();
				var opts = {
					url: FR.URLRoot+'/?module=custom_actions&section=cpanel&page=defaults_edit&action=save',
					maskText: 'Saving changes...',
					params: params
				};
				editForm.submitForm(opts);
			}
		},
		'->',
		{
			text: FR.T('Delete'), iconCls: 'fa fa-fw fa-remove colorRed',
			handler: function() {
				FR.editDefaultViewer.formPanel.deleteAction({
					url: FR.URLRoot+'/?module=custom_actions&section=cpanel&page=defaults_delete&id='+FR.entry.id,
					maskText: 'Please wait...'
				});
			}
		}
	]
});
Ext.getCmp('gridTabPanel').add(FR.editDefaultViewer.formPanel);
FR.editDefaultViewer.formPanel.show();