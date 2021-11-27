Ext.onReady(function() {
	Ext.getBody().on('contextmenu', function(e) {e.stopEvent();});

	FR.grid = new Ext.grid.GridPanel({
	    ds: new Ext.data.JsonStore({
		    fields: ['version', 'date', 'size', 'user'],
		    data: FR.gridData
	    }),
	    cm: new Ext.grid.ColumnModel([
		    {header: FR.T("Version"), width: 70, dataIndex: 'version', align:'center'},
		    {header: FR.T("Date"), width: 120, dataIndex: 'date'},
		    {header: FR.T("Size"), width: 70, dataIndex: 'size'},
		    {header: FR.T("Modified by"), width: 105, dataIndex: 'user', id: 'user'}
	    ]),
		enableHdMenu: false,
		autoExpandColumn: 'user',
	 	selModel: new Ext.grid.RowSelectionModel({
		    singleSelect: true,
		    listeners: {
			    'selectionchange': function () {
				    var count = this.getCount();
				    this.grid.getBottomToolbar().setDisabled((count != 1));
			    }
		    }
	 	}),
		listeners: {
	    	'rowdblclick': function (grid, rowIndex, e) {
				var item = grid.store.getAt(rowIndex);
				if (item) {FR.grid.previewVersion(item);}
				e.stopEvent();
				return false;
			}
		},
		bbar: {
			disabled: true,
			items: [
				{
					text: FR.T('Preview'),
					iconCls: 'fa fa-eye',
					handler: function() {
						FR.grid.previewVersion(FR.grid.getSelectionModel().getSelections()[0])
					},
					hidden: !window.parent.User.perms.download
				},
				{
					text: FR.T('Download'),
					iconCls: 'fa fa-download',
					handler: function() {
						var selection = FR.grid.getSelectionModel().getSelections();
						document.location.href = URLRoot+'/?module=fileman&section=do&page=download&paths[]='+encodeURIComponent(FR.currentPath)+'&version='+selection[0].data.version;
					},
					hidden: !window.parent.User.perms.download
				},
				'-',
				{
					text: FR.T('Restore'),
					iconCls: 'fa fa-undo',
					handler: function() {
						var selection = FR.grid.getSelectionModel().getSelections();
						var url = URLRoot+'/?module=versioning&section=ajax&page=actions&action=restore&version='+selection[0].data.version;
						Ext.Ajax.request({
							url: url,
							method: 'post',
							params: {path: FR.currentPath},
							success: function(req){
								try {
									var rs = Ext.util.JSON.decode(req.responseText);
								} catch (er){return false;}
								if (rs.success) {
									new window.parent.Ext.ux.prompt({text: rs.msg, callback: function() {
											window.parent.FR.utils.reloadGrid();
											window.parent.FR.UI.popups[FR.popupId].close();
										}});
								} else {
									new window.parent.Ext.ux.prompt({text: rs.msg});
								}
							}
						});
					},
					hidden: window.parent.User.perms.read_only
				},
				'->',
				{
					text: FR.T('Delete'),
					iconCls: 'fa fa-times icon-red',
					handler: function() {
						var selection = FR.grid.getSelectionModel().getSelections();
						var url = URLRoot+'/?module=versioning&section=ajax&page=actions&action=delete&version='+selection[0].data.version;
						Ext.Ajax.request({
							url: url,
							method: 'post',
							params: {path: FR.currentPath},
							success: function(req){
								try {
									var rs = Ext.util.JSON.decode(req.responseText);
								} catch (er){return false;}
								if (rs.success) {
									FR.grid.getStore().remove(FR.grid.getSelectionModel().getSelected());
								}
								new window.parent.Ext.ux.prompt({text: rs.msg});
							}
						});
					},
					hidden: window.parent.User.perms.read_only
				}
			]
		},
		previewVersion: function(selectedRow) {
	    	window.open(URLRoot+'/?module=fileman&section=utils&page=file_preview&path='+encodeURIComponent(FR.currentPath)+'&version='+selectedRow.data.version);
		}
	});

	new Ext.Viewport({
		layout: 'fit',
		items: FR.grid
	});
});