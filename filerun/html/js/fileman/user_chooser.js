var UserChooser = function(config){
	this.config = Ext.apply({}, config, {only: false, URLRoot: false});
	if (this.config.URLRoot) {
		URLRoot = this.config.URLRoot;
	}
	this.config.url = URLRoot+'/?module=fileman&section=utils&page=user_chooser_tree';
	this.initTree();
	this.triggerField = new Ext.form.TriggerField({
		triggerClass: 'fa fa-close',
		emptyText: window.parent.FR.T('Search'),
		onTriggerClick: this.cancelSearch.createDelegate(this),
		enableKeyEvents: true,
		listeners:{
			keyup: {
				buffer: 500,
				fn: function(field, e) {
					if(Ext.EventObject.ESC == e.getKey()) {
						field.onTriggerClick();
					} else {
						this.reload();
					}
				}
			},
			scope: this
		}
	});
	this.dlg = new Ext.Window({
		closeAction: 'hide', resizable: true,
		width: 320, height: 280, maximized: Ext.isMobile,
		title: (this.config.only == 'groups') ? FR.T('Select Groups') : FR.T('Select Users'), modal: true, layout: 'fit',
		tools: [
			{
				id: 'search',
				handler: function() {
					Ext.getCmp('user-chooser-north-region').show();
					Ext.getCmp('user-chooser-north-region').ownerCt.doLayout();
					this.triggerField.focus();
				}, scope: this
			},
			{
				id: 'refresh',
				handler: function() {this.reload();}, scope: this
			}
		],
        items: [
	        {
	        	layout: 'border',
		        items: [
		        	{
						region: 'north',
						layout: 'fit',
						height: 25,
						id: 'user-chooser-north-region',
						items: this.triggerField
					},
					{
						region: 'center',
						layout: 'fit', bodyStyle: 'padding-bottom:20px;',
						items: this.tree
					}
		        ]
	        }
		],
		buttonAlign: 'left',
		buttons: [
			{
				cls: 'fr-btn-primary fr-btn-smaller', style: 'margin-right:10px',
				text: FR.T('Ok'),
				handler: this.doCallback,
				scope: this
			},
			{
				cls: 'fr-btn-smaller',
				text: FR.T('Cancel'),
				handler: function () {
					this.dlg.hide()
				},
				scope: this
			}
		]
	});
};
UserChooser.prototype = {
	initTree : function() {
		this.tree = new Ext.tree.TreePanel({
		    animate: true,
		    containerScroll: true,
			rootVisible: false,
			autoScroll: true,
			bodyStyle: 'padding-bottom:20px',
			selModel: new Ext.tree.MultiSelectionModel(),
			listeners: {
				beforeclick: function(node) {
					if (node.id == 'add-guest-user') {
						this.dlg.hide();
						this.config.addGuest();
					}
					if (node.attributes.noSelect) {return false;}
				}, scope: this
			}
		});
		this.rootNode = new Ext.tree.AsyncTreeNode({
			text: 'Root', gid:'',
			loader: new Ext.tree.TreeLoader({
				dataUrl: this.config.url,
				requestMethod: 'GET'
			})
		});
		this.tree.setRootNode(this.rootNode);
		this.rootNode.attributes.loader.on({
			load: function() {this.tree.el.unmask();},
			loadexception: function() {this.tree.el.unmask();},
			scope: this
		});
		this.rootNode.attributes.loader.on('beforeload', function(loader, node){
			this.tree.el.mask(window.parent.FR.T('Loading...'));
			loader.baseParams.gid = node.attributes.gid;
			if (this.config.only) {
				loader.baseParams.only = this.config.only;
			}
			loader.baseParams.allow_all = (this.config.allowAll ? 1 : 0);
			loader.baseParams.showSelf = (this.config.showSelf ? 1 : 0);
			loader.baseParams.addGuest = (this.config.addGuest ? 1 : 0);
			loader.baseParams.search = this.triggerField.getRawValue();
		}, this);
	},
	cancelSearch: function() {
		if (this.triggerField.getRawValue() != '') {
			this.triggerField.setValue('');
			this.reload();
		}
		Ext.getCmp('user-chooser-north-region').hide();
		Ext.getCmp('user-chooser-north-region').ownerCt.doLayout();
	},
	show : function(el, callback, scope){
	    this.dlg.show(el);
		Ext.getCmp('user-chooser-north-region').hide();
		var task = new Ext.util.DelayedTask(function(){
			Ext.getCmp('user-chooser-north-region').ownerCt.doLayout();
		}, this);
		task.delay(500);
		this.callback = callback;
		this.scope = scope;
	},
	clearChecked: function() {
		this.tree.getSelectionModel().clearSelections();
	},
	doCallback : function() {
		var data = {users:[], groups:[]};
		Ext.each(this.tree.getSelectionModel().getSelectedNodes(), function(node) {
			var type = node.attributes.uid ? 'users' : 'groups';
			var id = node.attributes.uid ? node.attributes.uid : node.attributes.gid;
			if (type == 'groups' && id == '-' && ! this.config.allowAll) {
				//skip "unsorted users" item
			} else {
				data[type].push(node.attributes);
			}
		}, this);
		if (this.scope) {
			this.callback.createDelegate(this.scope, [data]).call();
		} else {
			this.callback(data);
		}
		this.cancelSearch();
		this.dlg.hide();
	},
	reload: function() {
		this.rootNode.loaded = false;
		this.rootNode.collapse();
		this.rootNode.expand();
	}
};