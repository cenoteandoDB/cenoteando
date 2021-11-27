Ext.ux.FileRunFileCPanelApp = Ext.extend(Ext.Panel, {
	initComponent: function() {
		var cfg = this.initialConfig;
		Ext.apply(this, {
			bodyStyle: 'padding: 10px',
			tbar: {
				style: 'border-bottom: 1px solid #E1E1E1;padding-left:10px;',
				items: cfg.tbarItems
			}
		});
		Ext.ux.FileRunFileCPanelApp.superclass.initComponent.apply(this, arguments);
	}
});
Ext.reg('filerun-cpanel-app', Ext.ux.FileRunFileCPanelApp);