FR.app = {
	init: function() {
		this.store = new Ext.data.Store({
			url: URLRoot+'/?module=weblinks&section=cpanel&page=list', remoteSort: true,
			baseParams: {path: FR.path},
			reader: new Ext.data.JsonReader()
		});
		this.store.on('metachange', function (store, meta) {
			var columns = [];
			for (var i = 0; i < meta.fields.length; i++ ) {
				if (meta.fields[i].header) {
					meta.fields[i].dataIndex = meta.fields[i].name;
					meta.fields[i].renderer = eval(meta.fields[i].renderer);
					columns.push(meta.fields[i]);
				}
			}
			this.gridPanel.reconfigure(store, new Ext.grid.ColumnModel(columns));
        }, this);
		this.store.on('exception', function() {
			new Ext.ux.prompt({text: FR.T('An error was encountered while trying to load the data from the server.')});
		});
		this.bbar = new Ext.PagingToolbar({
			store: this.store,
			displayInfo: true,
			beforePageText: FR.T('Page'),
			afterPageText: FR.T('of {0}'),
			firstText: FR.T('First Page'),
			lastText: FR.T('Last Page'),
			nextText: FR.T('Next Page'),
			prevText: FR.T('Previous Page'),
			refreshText: FR.T('Refresh'),
			displayMsg: FR.T('Displaying records {0} - {1} of {2}'),
			emptyMsg: FR.T('No records to display')
        });
		this.gridPanel = new Ext.grid.GridPanel({
			loadMask: true,
			enableHdMenu: false, enableColumnMove: false,
			ds: this.store,
	        cm: new Ext.grid.ColumnModel([]),
			selModel: new Ext.grid.RowSelectionModel({singleSelect:false}),
			bbar: this.bbar
		});
		new Ext.Viewport({
			layout: 'fit',
			items: [this.gridPanel],
			listeners: {
				'afterrender': function() {
					FR.app.store.load();
				}
			}
		});
	}
};

Ext.onReady(function() {FR.app.init();});