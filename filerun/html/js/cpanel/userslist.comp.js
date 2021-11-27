FR.components.userslist = Ext.extend(Ext.form.Field, {
    initComponent: function() {
		this.tree = {};
		var addLabel = (this.initialConfig.only == 'groups') ? 'Add Groups' : 'Add Users';
		var tcfg = {
			cls: 'userslist',
			bodyStyle: 'border:1px solid silver',
			animate: true, containerScroll: true, rootVisible:false, autoScroll: true, lines: false,
			bbar: [
				{
					text: FR.T(addLabel),
					iconCls: 'fa fa-fw fa-user-plus',
					ref: '../addBtn',
					handler: function() {
						if (!this.chooser) {this.chooser = new UserChooser({
							URLRoot: FR.URLRoot,
							only: this.initialConfig.only,
							allowAll: this.initialConfig.allowAll,
							showSelf: this.initialConfig.showSelf
						});}
						this.chooser.show(this.tree.panel.addBtn.getEl(), this.userChooserCallback, this);
					}, scope: this
				},
				{
					text: FR.T('Remove Selected'), ref: '../removeBtn',
					iconCls: 'fa fa-fw fa-remove colorRed', disabled: true,
					handler: function() {
						var selected = this.tree.panel.getSelectionModel().getSelectedNode();
						if (this.initialConfig.removeHandler) {
							Ext.createDelegate(this.initialConfig.removeHandler, this.initialConfig.removeHandler.scope || this, [this, selected ])();
							return;
						}
						this.tree.root.removeChild(selected);
						if (this.tree.root.firstChild) {this.tree.root.firstChild.select();}
						this.setRawValue(this.getValue());
					}, scope: this
				}
			]
		};
		Ext.apply(tcfg, this.tcfg);
		this.tree.panel = new Ext.tree.TreePanel(tcfg);
		
		Ext.apply(this, {items: this.tree.panel});
		
		FR.components.userslist.superclass.initComponent.apply(this, arguments);
		
		this.tree.root = new Ext.tree.TreeNode({text: 'Root'});
		this.tree.panel.setRootNode(this.tree.root);
		this.tree.panel.getSelectionModel().on('selectionchange', function (selectionModel, treeNode) {
			this.tree.panel.removeBtn.setDisabled(!treeNode);
		}, this);
	},
	onRender : function(ct, position){
        this.autoCreate = {
			id: this.id,
			name: this.name,
			type: 'hidden',
			tag: 'input' 
        };
		FR.components.userslist.superclass.onRender.call(this, ct, position);
		this.wrap = this.el.wrap({'style':'float:left;'});
		this.wrap.setWidth(this.tree.panel.width);
		this.tree.panel.render(this.wrap);
    },
	userChooserCallback: function (data) {
    	if (this.initialConfig.addHandler) {
			Ext.createDelegate(this.initialConfig.addHandler, this, [data])();
			return;
		}
		if (this.initialConfig.only != 'groups' && data.users) {
			Ext.each(data.users, function(user) {
				this.addItemToList({id: user.uid, name: user.name, type: 'user'});
			}, this);
		}
		if (this.initialConfig.only != 'users' && data.groups) {
			Ext.each(data.groups, function(group) {
				this.addItemToList({id: group.gid, name: group.name, type: 'group'});
			}, this);
		}
		this.setRawValue(this.getValue());
	},
	addItemToList: function(item) {
		var add = true;
		if (item.id == '-') {
			this.tree.root.removeAll(true);
			item = {id: '-', name: this.initialConfig.allItemsText, type: 'group'};
		} else {
			this.tree.root.eachChild(function(n) {
				if (n.attributes.extra.id == item.id && n.attributes.extra.type == item.type) {
					add = false;
					return false;
				}
			}, this);
		}
		if (add) {
			var cfg = {leaf: true, text: item.name, extra: {id: item.id, type: item.type}};
			if (item.type == 'user') {
				cfg.cls = 'user';
				cfg.icon = 'a/?uid='+item.id;
			} else {
				cfg.cls = 'group';
				cfg.iconCls = 'fa-group';
			}
			this.tree.root.appendChild(new Ext.tree.TreeNode(cfg));
		}
	},
	getValue: function() {
    	var rs = '';
		if (this.tree.root.childNodes.length != 0) {
			this.tree.root.eachChild(function(item) {
				if (item.attributes.extra.id == '-') {
					rs = '-ALL-';
					return false;
				}
				rs += '|' + item.attributes.extra.type + ':' + item.attributes.extra.id;
			}, this);
		}
		return rs;
	},
	setValue: function(v){
		if (v == '-ALL-') {
			v = [{id: '-', name: this.initialConfig.allItemsText, type: 'group'}];
		}
		if (v != '') {
			Ext.each(v, function(item) {
				this.addItemToList(item);
			}, this);
		}
		v = this.getValue();
        return FR.components.userslist.superclass.setValue.call(this, v);
    }
});
Ext.reg('userslistfield', FR.components.userslist);