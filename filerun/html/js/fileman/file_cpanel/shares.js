Ext.onReady(function() {
	FR.store = new Ext.data.ArrayStore({
		// store configs
		autoDestroy: true,
		storeId: 'myStore',
		// reader configs
		idIndex: 0,
		fields: [
			'id',
			'icon',
			'path',
			'avatar',
			'user',
			'avatarWith',
			'sharedWith',
			'created'
		],
		data: FR.sharesInfo
	});
	new Ext.Viewport({
		layout: 'fit',
		items: {
			xtype: 'grid',
			autoExpandColumn: 'path',
			store: FR.store,
			colModel: new Ext.grid.ColumnModel({
				columns: [
					{header: '&nbsp;', dataIndex: 'icon', 'width': 40, 'resizable': false, align: 'center'},
					{id: 'path', header: FR.T('Path'), dataIndex: 'path'},
					{header: '&nbsp;', dataIndex: 'avatar', 'width': 46, 'resizable': false, align: 'center'},
					{header: FR.T('Shared by'), dataIndex: 'user', width: 130},
					{header: '&nbsp;', dataIndex: 'avatarWith', 'width': 46, 'resizable': false, align: 'center'},
					{header: FR.T('Shared with'), dataIndex: 'sharedWith', width: 130},
					{header: FR.T('Date'), dataIndex: 'created', width: 150}
				]
			})
		}
	});
});