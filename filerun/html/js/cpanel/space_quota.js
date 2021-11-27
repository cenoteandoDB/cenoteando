FR.spaceQuota = {
	store: new Ext.data.SimpleStore({
        fields: [
           {name: 'id', type: 'integer'}, {name: 'username'}, {name: 'name'}, {name: 'max'},
		   {name: 'maxNice'}, {name: 'used'}, {name: 'usedNice'}, {name: 'percent'}
        ]
    }),
	sb: new Ext.ux.StatusBar({id: 'my-status', defaultText:'&nbsp;'}),
	calculateAll: false
};
FR.spaceQuota.store.loadData(FR.users);
FR.spaceQuota.grid = new Ext.grid.GridPanel({
	title: FR.T('Storage usage'), border: false,
	store: FR.spaceQuota.store, cls: 'FREditForm',
	selModel: new Ext.grid.RowSelectionModel({
		singleSelect:true,
		listeners: {
			'selectionchange': function(sm) {
				var r = sm.getSelected();
				if (!r) {return;}
				FR.spaceQuota.getQuota(r);
			}
		}
	}),
	cm: new Ext.grid.ColumnModel({
		defaults: {sortable: true},
		columns: [
			{header: FR.T("Id"), width: 30, dataIndex: 'id', hidden: true},
			{header: '&nbsp;', width: 42, resizable: false, sortable: false, renderer: function(v, m, r) {return '<img src="a/?uid='+r.data.id+'" class="avatar-s" loading="lazy" />';}},
			{id:'uname', header: FR.T("Name"), width: 150, dataIndex: 'name'},
			{id:'usrname', header: FR.T("Username"), width: 150, dataIndex: 'username'},
			{header: FR.T("Quota"), width: 75, renderer: function(v, m, r) {return r.data.maxNice;}, dataIndex: 'max'},
			{header: FR.T("Used"), width: 75, renderer: function(v, m, r) {
				if (r.data.max > 0 && (v >= r.data.max)) {
					return '<span style="color:red;">' +r.data.usedNice+ '</span>';
				} else {
					return r.data.usedNice;
				}
			}, dataIndex: 'used'},
			{header: FR.T("Usage"), width: 85, renderer: function(v, m, r) {
				if (v > FR.highlightLimit) {
					return '<span style="color:red;">' +v+ '%</span>';
				} else {
					if (v) {return v+'%';} else {return '';}
				}
			}, dataIndex: 'percent'}
		]
	}),
	bbar: FR.spaceQuota.sb,
	listeners: {
		'destroy': function() {
			Ext.Ajax.abort(FR.spaceQuota.ajaxReq);
			FR.spaceQuota = false;
		}
	},
	tbar: [
		{
			text: FR.T('Calculate all'),
			iconCls: 'fa fa-fw fa-refresh',
			enableToggle: true,
			toggleHandler: function(btn, pressed) {
				FR.spaceQuota.calculateAll = pressed;
				if (pressed) {
					var data = FR.spaceQuota.store.data;
					if (data.length > 0) {
						FR.currentUID = 0;
						FR.spaceQuota.getQuota(data.items[FR.currentUID]);
					}
				}
			}
		}
	]
});

FR.spaceQuota.getQuota = function(r) {
	if (!FR.spaceQuota.sb) {return false;}
	FR.spaceQuota.sb.showBusy(FR.T('Calculating quota usage for "%1"...').replace('%1', r.data.name));
	this.ajaxReq = Ext.Ajax.request({
		url: FR.URLRoot+'/?module=cpanel&section=tools&page=space_quota&action=get&uid='+r.data.id,
		method: 'GET',
		success: function(res) {
			try {
				var rs = Ext.util.JSON.decode(res.responseText);
			} catch(er) {
				FR.spaceQuota.sb.setStatus(FR.T('Server error'));
			}
			if (rs && FR.spaceQuota) {
				r.set('max', rs.max);
				r.set('maxNice', rs.maxNice);
				r.set('used', rs.used);
				r.set('usedNice', rs.usedNice);
				r.set('percent', rs.percent);
				r.commit();
				FR.spaceQuota.sb.clearStatus();
			}
			if (FR.spaceQuota.calculateAll) {
				FR.currentUID++;
				var data = FR.spaceQuota.store.data;
				if (data.items[FR.currentUID] && FR.spaceQuota) {
					FR.spaceQuota.getQuota(data.items[FR.currentUID]);
				} else {
					FR.spaceQuota.sb.clearStatus();
				}
			}
		}
	});

};
Ext.getCmp('appTab').add(FR.spaceQuota.grid);
Ext.getCmp('appTab').doLayout();