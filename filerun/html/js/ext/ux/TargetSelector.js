Ext.ux.TargetSelector = Ext.extend(Ext.Window, {
	cls: 'targetSelector', modal: true, width: 300, height: 320, closable: false, closeAction: 'hide', resizable: false,
	dataUrl: false, noBrowse: false, addRequiresTarget: false, currentPath: false, selectedRecord: false, scope: false, params: {},
	emptyText: 'There are no folders in here',

	initComponent: function() {
		this.initBrowser();
		this.backButton = new Ext.Button({
			cls: 'backButton', iconCls: 'fa fa-arrow-left',
			handler: this.goUp, scope: this, hidden: this.noBrowse
		});
		this.folderName = new Ext.Toolbar.TextItem({cls: 'folderName'});
		if (this.defaultFolderName) {this.folderName.setText(this.defaultFolderName);}
		Ext.each(this.buttons, function(btn) {btn.scope = this;}, this);
		Ext.apply(this, {
			layout: 'fit',
			tbar: new Ext.Toolbar({
				cls: 'topToolbar',
				items: [
					this.backButton,
					this.folderName,
					'->',
					{
						iconCls: 'fa fa-close', cls: 'closeButton',
						handler: function() {this.hide();}, scope: this
					}
				]
			}),
			items: [this.listPanel],
			buttonAlign: 'left',
			buttons: this.buttons,
			listeners: {
				'show': function() {
					if (FR.isMobile) {
						this.alignTo(Ext.getBody(), 't-t', [0,10]);
					}
				}
			}
		});
		Ext.ux.TargetSelector.superclass.initComponent.apply(this, arguments);
	},
	initBrowser: function() {
		var cols = [
			{
				width: .15,
				align: 'center',
				tpl: '<i class="fa fa-fw fa-lg {iconCls}"></i>'
			},
			{
				tpl: new Ext.XTemplate('<div class="x-unselectable">{text}</div>')
			}
		];
		if (!this.noBrowse) {
			cols.push({
				width: .24,
				align: 'center',
				tpl: '<div class="frBtn x-unselectable x-btn-icon"><i class="fa fa-fw fa-chevron-right"></i></div>'
			});
		}
		this.listPanel = new Ext.list.ListView({
			hideHeaders: true, singleSelect: true, loadingText: FR.T('Loading...'),
			emptyText: FR.T(this.emptyText),
			store: new Ext.data.JsonStore({
				url: this.dataUrl, root: 'items',
				fields: ['iconCls', 'text', 'pathname'],
				sortInfo: {field: 'text', direction: 'ASC'},
				listeners: {
					'add': function(store, records) {
						Ext.each(records, function(record) {
							this.prepareRecord(record);
						}, this);
					},
					'load': function(store, records) {
						if (store.reader.jsonData.folderName) {
							this.folderName.setText(store.reader.jsonData.folderName);
						}
						Ext.each(records, function(record) {
							this.prepareRecord(record).commit();
						}, this);
						if (this.onSelectionChange) {
							this.onSelectionChange.apply(this);
						}
					},
					'loadexception': function(proxy, req, resp) {
						try {
							var rs = Ext.decode(resp.responseText);
						} catch (er) {}
						if (rs && rs.msg) {
							FR.UI.feedback(rs.msg);
						}
					},
					scope: this
				}
			}),
			columns: cols,
			listeners: {
				'click': function(list, idx, node, e) {
					if (this.noBrowse) {return false;}
					if (e.getTarget('div.frBtn')) {
						this.load(list.store.getAt(idx).get('path'));
					}
				},
				'dblclick': function(list, idx, node, e) {
					if (this.noBrowse) {return false;}
					this.load(list.store.getAt(idx).get('path'));
				},
				'selectionchange': function(list, sel) {
					this.selectedRecord = (sel[0]) ? list.getRecord(sel[0]) : false;
					if (this.onSelectionChange) {
						this.onSelectionChange.apply(this);
					}
				},
				scope: this
			}
		});
	},
	addRecord: function(data) {
		var s = this.listPanel.store;
		var r = new s.recordType(data);
		s.addSorted(r);
		this.listPanel.select(r);
		this.listPanel.scrollToRecord(r);
	},
	prepareRecord: function(record) {
		var pathname = record.data.pathname || record.data.text;
		record.data.path = this.currentPath + '/' + pathname;
		if (!record.data.iconCls) {record.data.iconCls = 'fa-folder';}
		return record;
	},
	load: function(path) {
		this.currentPath = path;
		this.listPanel.store.removeAll();
		if (!this.noBrowse) {
			this.folderName.setText('');
			this.parentPath = FR.utils.pathInfo(this.currentPath).dirname;
			this.backButton.setVisible(this.parentPath);
		}
		this.listPanel.store.baseParams.path = path;
		this.listPanel.store.load();
	},
	goUp: function() {
		this.load(this.parentPath);
	},
	getSelectedPath: function() {
		return this.selectedRecord ? this.selectedRecord.get('path') : this.currentPath;
	}
});