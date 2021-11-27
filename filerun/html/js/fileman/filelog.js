FR = {
	clearLog: function() {
		window.parent.FR.UI.showLoading(FR.T('Clearing activity log...'));
		Ext.Ajax.request({
			url: URLRoot +'/?module=filelog&section=default&page=clear_log',
			method: 'post',
			params: {path: FR.path},
			callback: function(opts, succ, req) {
				window.parent.FR.UI.doneLoading();
				try {
					var rs = Ext.decode(req.responseText);
				} catch (er){return false;}
				if (rs.msg) {
					window.parent.FR.UI.feedback(rs.msg);
				}
				FR.store.load({params: {start: 0, limit: 100}});
			}
		});
	}
};

Ext.onReady(function() {
	Ext.override(Ext.grid.GridView, {
		emptyText: '<div style="text-align:center">'+FR.T('No activity records found for this file.')+'</div>',
		templates: {
			cell: new Ext.Template(
				'<td class="x-grid3-col x-grid3-cell x-grid3-td-{id} {css}" style="{style}" tabIndex="0" {cellAttr}>',
				'<div class="x-grid3-cell-inner x-grid3-col-{id}" {attr}>{value}</div>',
				"</td>"
			)
		}
	});
	var store = new Ext.data.Store({
		proxy: new Ext.data.HttpProxy({url: URLRoot+'/?module=filelog&section=ajax&page=list'}),
		reader: new Ext.data.JsonReader({
			root: 'records',
			totalProperty: 'totalCount',
			id: 'id',
			fields: ['id', {name: 'date', type:'date', dateFormat:'Y-m-d h:i:s'}, 'uid', 'fullName', 'action', 'details']
		})
    });
	store.on('load', function(store, records, opts) {
		if (store.reader.jsonData.msg) {
			window.parent.FR.UI.feedback(store.reader.jsonData.msg);
		}
	});
	store.baseParams = {path: FR.path};
    var cm = new Ext.grid.ColumnModel({
		defaults: {hideable: false, menuDisabled: true},
		defaultSortable: true,
		columns: [
		{
			header: FR.T('Date'), dataIndex: 'date',
			width: 110, renderer: function(value) {return Ext.util.Format.date(value, 'd M y, H:i');}
		},{
			header: FR.T('User'), dataIndex: 'fullName',
			width: 130
		},{
			header: FR.T('Action'), dataIndex: 'action',
			width: 130
		},{
			id: 'details', header: FR.T('Details'), dataIndex: 'details', sortable: false
		}]
	});
    FR.gridPanel = new Ext.grid.GridPanel({
		selModel: new Ext.grid.RowSelectionModel({singleSelect:true}),
		store: store, cm: cm,
		loadMask: true,
	    autoExpandColumn: 'details',
		bbar: new Ext.PagingToolbar({
			pageSize: 100,
			store: store,
			displayInfo: true,
			displayMsg: '<span style="color:gray">'+FR.T('Displaying records {0} - {1} of {2}')+'</span>',
			emptyMsg: '<span style="color:gray">'+FR.T('No records to display')+'</span>',
			beforePageText: FR.T('Page'),
			afterPageText: FR.T('of {0}'),
			firstText: FR.T('First Page'),
			lastText: FR.T('Last Page'),
			nextText: FR.T('Next Page'),
			prevText: FR.T('Previous Page'),
			refreshText: FR.T('Refresh'),
		    items: [
			    '-',
			    {
			        text: FR.T('Clear log'), hidden: (!window.parent.User.isAdmin && !window.parent.User.isIndep),
				    handler: function () {
					    new Ext.ux.prompt({
						    text: FR.T('Are you sure you want to clear the file\'s activity log?'),
						    confirmHandler: function() {FR.clearLog();}
					    });
				    }
		        }
		    ]
		})
	});
	new Ext.Viewport({
		layout: 'fit',
		items: FR.gridPanel
	});
	FR.store = store;
	FR.store.load({params: {start: 0, limit: 100}});
});