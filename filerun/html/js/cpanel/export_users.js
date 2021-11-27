FR.exportUsers = {};
FR.exportUsers.formPanel = new FR.components.editForm({
	title: FR.T('Export Users'),
	layout: 'form', bodyStyle: 'padding:10px;',
	labelWidth: 250, autoScroll: true,
	tbar: [
		{
			text: FR.T('Export'), cls: 'fr-btn-primary', iconCls: 'fa fa-fw fa-download color-white',
			handler: function() {
				document.location.href = FR.URLRoot+'/?module=users&section=cpanel&page=export&action=export';
			}
		}
	]
});
Ext.getCmp('appTab').add(FR.exportUsers.formPanel);
Ext.getCmp('appTab').doLayout();