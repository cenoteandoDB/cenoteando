Ext.onReady(function() {
	new Ext.Viewport({
		layout: 'fit',
		items: {
			xtype: 'grid',
			autoExpandColumn: 'homefolder',
			store: new Ext.data.ArrayStore({
				// store configs
				autoDestroy: true,
				storeId: 'myStore',
				// reader configs
				idIndex: 0,
				fields: ['id', 'avatar', 'name', 'homefolder'],
				data: FR.usersInfo
			}),
			colModel: new Ext.grid.ColumnModel({
				columns: [
					{header: '&nbsp;', dataIndex: 'avatar', 'width': 46, 'resizable': false, align: 'center'},
					{header: FR.T('Name'), width: 200, dataIndex: 'name'},
					{id: 'homefolder', header: FR.T('Home folder path'), dataIndex: 'homefolder'}
				]
			})
		}
	});
});