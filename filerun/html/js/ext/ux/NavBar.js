Ext.ux.NavBar = Ext.extend(Ext.Toolbar, {//todo: when changes happen to the tree, reload navbar
	enableOverflow: true, cls: 'FR-NavBar',
	listeners: {
		'render': function() {
			this.el.on('contextmenu', function(e) {
				FR.UI.gridPanel.showContextMenu();
				e.stopEvent();
			});
			this.el.on('mousedown', function(e) {
				FR.UI.gridPanel.selModel.clearSelections();
			});
		}
	},
	addItem: function(treeNode) {
		Ext.ux.NavBar.superclass.addItem.apply(this, [{
			text: treeNode.text,
			treeNode: treeNode,
			isBreadCrumb: treeNode.text.length,
			handler: function() {this.treeNode.select();this.treeNode.ensureVisible();},
			listeners: {
				'render': function() {
					this.el.on('contextmenu', function(e) {
						FR.UI.tree.showContextMenu(this.treeNode, e);
						e.stopEvent();
					}, this);
				}
			}
		}]);
	},
	build: function(treeNode) {
		this.removeAll();
		var items = [treeNode];
		while (treeNode.parentNode) {
			treeNode = treeNode.parentNode;
			if (treeNode.isRoot) {continue;}
			items.unshift(treeNode);
		}
		var count = items.length;
		Ext.each(items, function(treeNode, index) {
			this.addItem(treeNode);
			if (index < count-1) {
				this.add(new Ext.ux.NavBar.Separator({isBreadCrumb: true}));
			}
		}, this);
		this.doLayout(true);
	}
});
Ext.reg('navbar', Ext.ux.NavBar);

Ext.ux.NavBar.Separator = Ext.extend(Ext.Toolbar.Item, {
	onRender : function(ct, position){
		this.el = ct.createChild({tag:'span', html: '<i class="fa fa-angle-right"></i>'}, position);
	}
});