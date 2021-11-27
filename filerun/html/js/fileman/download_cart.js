FR.components.cartPanel = Ext.extend(Ext.ux.ListPanel, {
	width: 300, height: 300,
	style: 'padding:10px;',
	locateOnSel: true,

	initComponent: function() {
		this.store = new Ext.data.ArrayStore({idIndex: 0});
		this.listViewCfg = {
			emptyText: '<div class="fr-cart-empty">'+FR.T('Add files to the download cart by dragging them onto the cart icon (%1)').replace('%1', '<i class="fa fa-cart-arrow-down"></i>')+'</div>',
			columns:[{
				tpl: new Ext.XTemplate(
					'<div class="fr-cart-item">{[this.getIconHTML(values)]} {filename}{[this.getDetails(values)]}</div>',
					{getIconHTML: this.getIconHTML},
					{getDetails: function(v) {
						var d = '';
						if (v.isFolder) {
							d = v.type;
						} else {
							d = v.nice_filesize;
						}
						return '<br><span class="colorGray">'+d+'</span>';
					}}
				)
			}],
			listeners: {
				'afterrender': function() {
					if (this.store.getCount() == 0){this.store.removeAll();}
				},
				'contextmenu': function(list, index) {
					this.store.removeAt(index);
					this.updateUI();
				},
				scope: this
			}
		};
		this.total = new Ext.Toolbar.TextItem({style:'color:gray;margin-left:10px;'});
		Ext.apply(this, {
			tbar: [
				{
					iconCls: 'fa fa-download fa-fw gray', cls: 'fr-btn-default',
					text: FR.T('Download all'), style: 'margin-left:5px', handler: function() {this.download();}, scope: this
				},
				{
					iconCls: 'fa fa-envelope-o fa-fw gray', cls: 'fr-btn-default', hidden: !User.perms.email,
					text: FR.T('E-mail'), handler: function() {this.email();}, scope: this
				}
			],
			bbar: [
				this.total,
				'->',
				{
					text: FR.T('Clear list'), cls: 'fr-btn-default fr-btn-smaller', style: 'margin-right:10px',
					handler: function() {this.clear();}, scope: this
				}
			]
		});
		FR.components.cartPanel.superclass.initComponent.apply(this, arguments);
		this.updateUI();
	},
	addItem: function(item) {
		if (this.store.getById(item.data.path)) {return false;}
		this.store.add(new Ext.data.Record(item.data, item.data.path));
		this.updateUI();
		return true;
	},
	clear: function() {
		this.store.suspendEvents();
		this.store.removeAll();
		this.listView.refresh();
		this.store.resumeEvents();
		this.updateUI();
	},
	updateUI: function() {
		var c = this.store.getCount();
		this.getTopToolbar().setVisible((c > 0));
		this.getBottomToolbar().setVisible((c > 0));
		if (this.attachedTo) {
			if (!this.countTip) {
				this.countTip = new Ext.ToolTip({
					target: this.attachedTo.el,
					anchor: 'left',
					html: '',
					showDelay: 0, dismissDelay: 0,
					autoHide: false
				});
				this.countTip.show();this.countTip.hide();
			}
			this.countTip.update(c || FR.T('Empty'));
			this.countTip.setVisible((c > 0));
		}
		this.updateTotal();
	},
	download: function() {
		var paths = [];
		this.store.each(function(item) {
			paths.push(item.data.path);
		});
		FR.actions.download(paths, FR.T('Download cart'));
	},
	email: function() {
		var items = [];
		this.store.each(function(item) {
			items.push(item.data);
		});
		FR.actions.emailFiles(items, true);
	},
	updateTotal: function () {
		var t = 0; var hasFolder = false;
		this.store.each(function(item) {
			if (item.data.filesize) {t += parseInt(item.data.filesize);} else {hasFolder = true;}
		});
		if (t > 0) {
			t = Ext.util.Format.fileSize(t);
			if (hasFolder) {
				t = '&gt; ' + t;
			}
		}
		this.total.setText(t);
	},
	attachToComponent: function(cmp) {
		this.attachedTo = cmp;
		var el = cmp.el;
		new Ext.dd.DropTarget(el, {
			ddGroup: 'TreeDD',
			notifyDrop: Ext.createDelegate(function(dragsource, event, data) {
				if (!data.node) {
					if (FR.currentFolderPerms && !FR.currentFolderPerms.download) {return false;}
					Ext.each(data.selections, function(item) {this.addItem(item);}, this);
				}
			}, this),
			notifyEnter: function(source, e, data) {}
		});
	}
});