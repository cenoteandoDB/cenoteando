FR.usersOnline = {
	store: new Ext.data.JsonStore({
		root: 'items',
        fields: ['id', 'avatar', 'name']
    }),
	sb: new Ext.ux.StatusBar({id: 'my-status', defaultText:'&nbsp;'})
};

//Pusher.log = function(message) {console.log(message);}
var pusher = new Pusher(FR.pusherAppKey, {
	authEndpoint: '?module=fileman&section=utils&page=pusher_auth',
	cluster: FR.pusherCluster,
	encrypted: true
});
var presence = pusher.subscribe('presence-channel');
FR.usersOnline.sb.showBusy(FR.T('Getting real-time information...'));
presence.bind('pusher:subscription_succeeded', function (rs) {
	FR.usersOnline.showStatus(rs.count);
	var data = {items:[]};
	Ext.iterate(rs.members, function (k, v) {
		if (presence.members.myID != k) {
			data.items.push(v);
		}
	});
	FR.usersOnline.store.loadData(data);
});
presence.bind('pusher:member_added', function (member) {
	FR.usersOnline.showStatus(presence.members.count);
	FR.usersOnline.store.loadData({items:[member.info]}, true);
});
presence.bind('pusher:member_removed', function (data) {
	var r = FR.usersOnline.store.getById(data.id);
	if (r) {
		FR.usersOnline.store.remove(r);
		FR.usersOnline.showStatus(presence.members.count);
	} else {
		console.log(data.id+' record not found');
	}
});
FR.usersOnline.showStatus = function(count) {
	var m;
	if (count > 2) {
		m = 'There are %1 users currently online';
	} else if (count == 2) {
		m = 'There is only one user online at this moment';
	} else {
		m = 'There are no other users currently online';
	}
	FR.usersOnline.sb.setStatus(FR.T(m).replace('%1', count));
}
FR.usersOnline.grid = new Ext.grid.GridPanel({
	cls: 'FREditForm',
	title: FR.T('Users currently online'),
	store: FR.usersOnline.store,
	hideHeaders: true, viewConfig: {emptyText: FR.T('There are no other users currently online')},
	cm: new Ext.grid.ColumnModel({
		defaults: {sortable: true},
		columns: [
			{header: FR.T("Id"), width: 30,  dataIndex: 'id', hidden: true},
			{header: FR.T("&nbsp;"), width: 44, dataIndex: 'id',
				renderer: function(id) {
					return '<img src="a/?uid='+id+'" width="16" height="16" class="avatar-s" />';
				}
			},
			{header: FR.T("Name"), width: 400, dataIndex: 'name'}
		]
	}),
	bbar: FR.usersOnline.sb,
	listeners: {
		'rowclick': function (p, rowIndex) {
			FR.tree.panel.getSelectionModel().suspendEvents();
			FR.tree.panel.selectPath('/root/users/tools/alogs');
			FR.tree.panel.getSelectionModel().resumeEvents();
			Ext.getCmp('cardDisplayArea').getLayout().setActiveItem(0);
			FR.grid.loadModule(FR.modules.logs, {users: 'user:'+p.getStore().getAt(rowIndex).data.id});
		}
	}
});
Ext.getCmp('appTab').add(FR.usersOnline.grid);
Ext.getCmp('appTab').doLayout();