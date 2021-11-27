Ext.ux.ListPanel = Ext.extend(Ext.Panel, {
	titleNumber: 0, layout: 'fit',
	initComponent: function() {
		this.baseTitle = this.title;

		this.listView = new Ext.list.ListView(Ext.apply({
			store: this.store,
			loadingText: FR.T('Loading...'),
			hideHeaders: true,
			singleSelect: true
		}, this.listViewCfg));

		if (this.locateOnSel) {
			this.listView.on('selectionchange', function (list, sel) {
				if (!sel[0]) {return false;}
				var r = list.getRecord(sel[0]);
				FR.utils.locateItem(FR.utils.pathInfo(r.data.path).dirname, r.data.filename);
			}, this);
		}
		this.items = [this.listView];
		if (this.extraItem) {
			this.items.push(this.extraItem);
		}
		if (this.paginated) {
			this.pagingbar = new Ext.PagingToolbar({
				store: this.store,
				pageSize: 20,
				beforePageText: FR.T('Page'),
				afterPageText: FR.T('of {0}'),
				firstText: FR.T('First Page'),
				lastText: FR.T('Last Page'),
				nextText: FR.T('Next Page'),
				prevText: FR.T('Previous Page'),
				refreshText: FR.T('Refresh')
			});
			this.bbar = this.pagingbar;
		}

		this.store.on('exception', function() {
			this.listView.getTemplateTarget().update('<div class="x-list-message">'+FR.T('Failed to load data!')+'</div>');
		}, this);

		Ext.ux.ListPanel.superclass.initComponent.apply(this, arguments);
	},
	getIconHTML: function(v) {
		var html, url;
		if (v.isFolder) {
			html = '<i class="fa fa-fw fa-2x fa-folder"></i>';
		} else {
			if (v.thumb) {
				url = FR.UI.getThumbURL({path: v.path});
			} else {
				url = FR.UI.getFileIconURL(v.icon);
			}
			html = '<img class="fr-thumbnail" src="'+url+'" loading="lazy" />';
		}
		return '<div class="ico">'+html+'</div>';
	},
	setTitleNumber: function(n, alert) {
		this.titleNumber = n;
		var t = this.baseTitle;
		if (n > 0) {
			if (n > 99) {n = '99+';}
			t += '<div style="position:relative"><div class="bubbleCount '+(alert?'alert':'')+'"><div>'+n+'</div></div></div>';
		}
		this.setTitle(t);
	}
});