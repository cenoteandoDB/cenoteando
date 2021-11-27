Ext.onReady(function() {
	new Ext.Viewport({
		layout: 'fit',
		autoScroll: true,
		items: {
			xtype: 'form',
			bodyStyle: 'padding-top:20px',
			labelWidth: 180,
			labelAlign: 'right',
			defaults: {
				xtype: 'textarea',
				width: 300
			},
			items: [
				{
					fieldLabel: FR.T('Relative path'), value: FR.itemInfo.relativePath
				},
				{
					fieldLabel: FR.T('Absolute path'), value: FR.itemInfo.fullPath
				},
				{
					fieldLabel: FR.T('Your direct URL'), value: FR.itemInfo.directURL,
					height: 80
				},
				{
					xtype: 'displayfield',
					fieldLabel: FR.T('System user owner'), value: FR.itemInfo.systemUserOwner,
					hidden: !FR.itemInfo.systemUserOwner
				},
				{
					xtype: 'displayfield',
					fieldLabel: FR.T('System group owner'), value: FR.itemInfo.systemGroupOwner,
					hidden: !FR.itemInfo.systemGroupOwner
				},
				{
					xtype: 'displayfield',
					fieldLabel: FR.T('File system permissions'), value: FR.itemInfo.chmod,
					hidden: !FR.itemInfo.chmod
				}
			]
		}
	});
});