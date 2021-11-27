FR.components.Grid = Ext.extend(Ext.grid.GridPanel, {
	title: '&nbsp;', loadMask: true,
	enableHdMenu: false, enableColumnMove: false,

    initComponent: function() {
		this.store = new Ext.data.Store({
			url: '/', remoteSort: true,
			baseParams: {limit: FR.system.gridItemsPerPage},
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
			this.reconfigure(store, new Ext.grid.ColumnModel(columns));
        }, this);
		this.bbar = new Ext.PagingToolbar({
			pageSize: FR.system.gridItemsPerPage,
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
        Ext.apply(this, {
			ds: this.store,
	        cm: new Ext.grid.ColumnModel([]),
			selModel: new Ext.grid.RowSelectionModel({singleSelect:false}),
			listeners: {
				'containercontextmenu': function(grid, e) {
					e.stopEvent();
					return false;
				},
				'rowcontextmenu': function(grid, rowIndex, e) {
					e.stopEvent();
					return false;
				}
			}
		});
		FR.components.Grid.superclass.initComponent.apply(this, arguments);
		this.selModel.on('selectionchange', function(selModel) {
			this.currentCount = selModel.getCount();
			this.currentSelection = selModel.getSelected();
			FR.grid.updateToolbar();
		}, this);
		this.on('rowdblclick', function () {
			if (FR.grid.currentModule.view) {
				FR.grid.actions.view.execute();
			} else {
				if (FR.grid.currentModule.dblClickEdit) {
					FR.grid.actions.edit.execute();
				}
			}
		}, this);
		this.store.on('exception', function(misc) {
			FR.feedback(FR.T('An error was encountered while trying to load the data from the server.'));
		});
		this.delayedLoad = new Ext.util.DelayedTask(function(){
			this.getStore().load();
		}, this);
    },
	countSel: function() {return this.getSelectionModel().getCount();}
});

FR.initGrid = function() {
	this.grid = {
		init: function() {
			this.actions = {
				add: new Ext.Action({
					text: FR.T('Add new'), hidden: true, cls: 'fr-btn-default',
					iconCls: 'fa fa-fw fa-plus-circle',
					handler: function() {
						if (this.currentModule.url.add) {
							if (this.currentModule.addCondition) {
								var rs = this.currentModule.addCondition();
								if (!rs) {
									return false;
								}
							}
							var params = {};
							if (FR.grid.pid) {
								params.pid = FR.grid.pid;
							}
							Ext.getCmp('gridTabPanel').el.mask('Loading...');
							FR.tempPanel.load({
								url: FR.URLRoot+this.currentModule.url.add,
								params: params,
								scripts: true,
								callback: function() {
									Ext.getCmp('gridTabPanel').el.unmask();
								}
							});
						}
					}, scope: this
				}),
				view: new Ext.Action({
					text: FR.T('View'), cls: 'fr-btn-default',
					iconCls: 'fa fa-fw fa-eye', hidden: true,
					handler: function() {
						if (this.currentModule.url.view) {
							var params = {id: FR.grid.panel.currentSelection.data.id};
							Ext.getCmp('gridTabPanel').el.mask('Loading...');
							FR.tempPanel.load({
								url: FR.URLRoot+this.currentModule.url.view,
								params: params,
								scripts: true,
								callback: function() {
									Ext.getCmp('gridTabPanel').el.unmask();
								}
							});
						} else {
							if (this.currentModule.viewAction) {
								this.currentModule.viewAction();
							}
						}
					}, scope: this
				}),
				openWebLink: new Ext.Action({
					text: FR.T('Open Web Link'), cls: 'fr-btn-default',
					iconCls: 'fa fa-fw fa-external-link', hidden: true,
					handler: function() {
						window.open(FR.grid.panel.currentSelection.data.url);
					}, scope: this
				}),
				edit: new Ext.Action({
					text: FR.T('Edit'), hidden: true, cls: 'fr-btn-default', style: 'margin-left:5px',
					iconCls: 'fa fa-fw fa-edit',
					handler: function() {
						if (this.currentModule.url.edit) {
							var params = {id: FR.grid.panel.currentSelection.data.id};
							if (FR.grid.panel.currentSelection.data.type) {
								params.type = FR.grid.panel.currentSelection.data.type;
							}
							Ext.getCmp('gridTabPanel').el.mask('Loading...');
							FR.tempPanel.load({
								url: FR.URLRoot+this.currentModule.url.edit,
								params: params,
								scripts: true,
								callback: function() {
									Ext.getCmp('gridTabPanel').el.unmask();
								}
							});
						}
					}, scope: this
				}),

				del: new Ext.Action({
					text: FR.T('Delete'), style: 'margin-right:5px',
					iconCls: 'fa fa-fw fa-remove icon-red', hidden: true,
					handler: function() {
						if (this.currentModule.deleteAction) {
							this.currentModule.deleteAction(FR.grid.panel.getSelectionModel().getSelections());
						}
					}, scope: this
				}),
				deActivate: new Ext.Action({
					text: FR.T('Deactivate'), style: 'margin-right:5px', hidden: true,
					iconCls: 'fa fa-fw fa-ban',
					handler: function() {
						if (this.currentModule.deActivateAction) {
							this.currentModule.deActivateAction(FR.grid.panel.getSelectionModel().getSelections());
						}
					}, scope: this
				}),
				search: new Ext.Action({
					text: FR.T('Search'),
					iconCls: 'fa fa-fw fa-search',
					hidden: true,
					handler: function() {
						if (this.currentModule.url.search) {
							Ext.getCmp('gridTabPanel').el.mask('Loading...');
							FR.tempPanel.load({
								url: FR.URLRoot+this.currentModule.url.search,
								params: '',
								scripts: true,
								callback: function() {
									Ext.getCmp('gridTabPanel').el.unmask();
								}
							});
						}
					}, scope: this
				}),
				archiveLogs: new Ext.Action({
					text: FR.T('Archive logs'), style: 'margin-right:5px',
					iconCls: 'fa fa-fw fa-file-archive-o icon-red',
					hidden: true,
					handler: function() {
						if (this.currentModule.archiveLogsAction) {
							this.currentModule.archiveLogsAction();
						}
					}, scope: this
				}),
				loginAs: new Ext.Action({
					text: FR.T('Login as'), style: 'margin-left:5px',
					iconCls: 'fa fa-fw fa-sign-in', hidden: true,
					handler: function() {
						window.parent.location.href = FR.URLRoot+'/?module=cpanel&section=tools&page=relogin&uid='+FR.grid.panel.currentSelection.data.id;
					}
				}),
				viewLog: new Ext.Action({
					text: FR.T('View activity log'),
					iconCls: 'fa fa-fw fa-archive', hidden: true,
					handler: function() {
						FR.tree.panel.getSelectionModel().suspendEvents();
						FR.tree.panel.selectPath('/root/tools/alogs');
						FR.tree.panel.getSelectionModel().resumeEvents();
						FR.grid.loadModule(FR.modules.logs, {users: 'user:'+FR.grid.panel.currentSelection.data.id});
					}
				}),
				listUsersByRole: new Ext.Action({
					text: FR.T('List users'),
					iconCls: 'fa fa-fw fa-search', hidden: true,
					handler: function() {
						FR.tree.panel.getSelectionModel().suspendEvents();
						FR.tree.panel.selectPath('/root/admin/users');
						FR.tree.panel.getSelectionModel().resumeEvents();
						FR.grid.loadModule(FR.modules.users, {rid: FR.grid.panel.currentSelection.data.id});
					}
				})
			};
			
			this.gridQuickSearchField = new Ext.form.TriggerField({
				width: 130, emptyText: FR.T('Quick search'), enableKeyEvents: true,
				triggerClass: 'fa fa-close', hideTrigger: true,
				listeners: {
					'keyup': function(field) {
						var val = field.getValue();
						field.setHideTrigger((val.length == 0));
						var store = FR.grid.panel.getStore();
						store.baseParams.search = val;
						FR.grid.panel.delayedLoad.delay(1000);
					}
				},
				onTriggerClick: function() {
					this.reset();
					this.fireEvent('keyup', this);
				}
			});
			this.spacer = {text:'', disabled: true, style:'height:27px;width:1px;padding-left:0;padding-right:0;margin-left:0;margin-right:0;'};

			this.panel = new FR.components.Grid({
				id: 'gridTab',
				tbar: {
					items: [this.actions.add, this.actions.edit, this.actions.view, this.actions.openWebLink, this.actions.search, this.actions.loginAs, this.actions.viewLog, this.actions.listUsersByRole, '->', this.actions.deActivate, this.actions.del, this.actions.archiveLogs, this.spacer, this.gridQuickSearchField, ''],
					enableOverflow: true
				}
			});
		},
		loadModule: function(mod, params) {
			this.currentModule = mod;
			if (mod.title) {
				Ext.getCmp('gridTab').setTitle(FR.T(mod.title));
			}
			Ext.getCmp('gridTab').show();
			FR.grid.panel.store.proxy.setUrl(FR.URLRoot+mod.url.list, true);
			if (params) {
				FR.grid.panel.store.baseParams = Ext.apply({limit: FR.system.gridItemsPerPage}, params);
			} else {
				FR.grid.panel.store.baseParams = {limit: FR.system.gridItemsPerPage};
			}
			FR.grid.panel.store.sortInfo = false;
			FR.grid.gridQuickSearchField.reset('');
			FR.grid.panel.store.load();

			this.updateToolbar();
		},
		updateToolbar: function() {
			var g = FR.grid;
			var a = g.actions;
			var m = g.currentModule;
			if (!m) {return false;}
			var c = g.panel.currentCount;
			Ext.iterate(a, function (k, action) {action.setHidden(1);});

			a.add.setHidden(!m.url.add);
			a.search.setHidden(!m.url.search);
			a.archiveLogs.setHidden(!m.archiveLogsAction);

			if (c == 1) {
				a.edit.setHidden(!m.url.edit);
				a.view.setHidden(!m.url.view);
				a.loginAs.setHidden(!m.loginAs);
				a.viewLog.setHidden(!m.viewLog);
				a.listUsersByRole.setHidden(!m.listUsersByRole);
				a.openWebLink.setHidden(!m.openWebLink);
			}
			if (c >= 1) {
				a.deActivate.setHidden(!m.deActivate);
				a.del.setHidden(!m.deleteAction);
			}
		}
	};
	this.grid.init();
};