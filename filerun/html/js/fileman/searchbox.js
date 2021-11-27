FR.components.SearchPanel = Ext.extend(Ext.Panel, {
	style: 'padding:10px', params: {}, prepopulated: false,
	initComponent: function() {

		this.delayedSearch = new Ext.util.DelayedTask(function() {
			var fieldValues = this.formPanel.form.getFieldValues();

			this.params = {};
			var sendParams = {};
			Ext.iterate(fieldValues, function(k, v) {
				if (k == 'meta') {
					Ext.each(v, function(metaItem) {
						if (metaItem.keyword) {
							if (!this.params.meta) {
								this.params.meta = {};
							}
							var metaKey = 'meta[' + metaItem['fid'] + '][]';
							if (Ext.isArray(sendParams[metaKey])) {
								sendParams[metaKey].push(metaItem.keyword);
								this.params.meta[metaItem['fid']].push(metaItem.keyword);
							} else {
								sendParams[metaKey] = [metaItem.keyword];
								this.params.meta[metaItem['fid']] = [metaItem.keyword];
							}
						}
					}, this);
				} else {
					if (v) {
						this.params[k] = v;
						sendParams[k] = v;
					}
				}
			}, this);
			if (this.isEmpty(sendParams)) {return false;}
			this.push2History();
			var g = FR.UI.gridPanel;
			g.store.loadParams = Ext.apply({}, sendParams);
			g.setMetaCols();
			g.load();
		}, this);

		this.inputListeners = {
			'keyup': function(f) {
				var v = f.getValue();
				if (f.previousValue && f.previousValue == v) {
					return false;
				}
				f.previousValue = v;
				this.delayedSearch.delay(700);
			}, scope: this
		};
		this.metaFieldSelector = new Ext.form.ComboBox({
			mode: 'local', triggerAction: 'all', editable: false, flex:1,
			store: FR.searchMetaColumns, valueField: 'id', displayField: 'title',
			value: '-', name: 'fid',
			listeners: {
				'select': function(cb, record) {
					if (record.data.options) {
						var html = '<ul style="padding-left:10px;padding-bottom:10px;"><li>'+record.data.options.join('</li><li>')+'</li></ul>';
						(new Ext.ToolTip({
							title: FR.T('Available options'),
							html: html, closable: true, dismissDelay: 20000
						})).showBy(cb.el)
					}
					this.delayedSearch.delay(0);
				}, scope: this
			}
		});

		this.inputs = {
			filename: new Ext.form.TextField({
				fieldLabel: FR.T('Name'), anchor:'100%', name: 'filename',
				enableKeyEvents: true, hidden: true,
				listeners: this.inputListeners
			}),
			metatype: new Ext.form.ComboBox({
				fieldLabel: FR.T('Type'), hidden: true,
				mode: 'local', triggerAction: 'all', editable: false, name: 'metatype',
				store: FR.searchMetaFileTypes, value: '',
				listeners: {
					'select': function(t) {
						this.delayedSearch.delay(0);
					}, 'scope': this
				}
			}),
			contents: new Ext.form.TextField({
				fieldLabel: FR.T('Contents'), anchor:'100%', name: 'contents',
				enableKeyEvents: true, hidden: true,
				listeners: this.inputListeners
			}),
			meta: new Ext.form.CompositeField({
				hidden: true, combineValues: true, name: 'meta',
				items: [
					{
						xtype: 'textfield', fieldLabel: FR.T('Metadata'),
						enableKeyEvents: true, height: 24, flex:1,  name: 'keyword',
						listeners: this.inputListeners
					},
					this.metaFieldSelector,
					{
						xtype: 'button',
						tooltip: FR.T('Add a new search criteria'),
						iconCls: 'fa fa-fw fa-plus gray', cls:'fr-btn-default fr-btn-in-form',
						handler: function() {this.addNewMeta();}, scope: this
					}
				],
				focus: function() {this.items.first().focus();}
			})
		};

		this.toggles = {
			filename: new Ext.Button({text: FR.T('Name'), value: 'filename', enableToggle: true, toggleHandler: this.typeToggle, scope: this}),
			meta: new Ext.Button({text: FR.T('Metadata'), value: 'meta', hidden: (FR.searchMetaColumns.length == 0 || !User.perms.metadata), enableToggle: true, toggleHandler: this.typeToggle, scope: this}),
			metatype: new Ext.Button({text: FR.T('Type'), value: 'metatype', enableToggle: true, toggleHandler: this.typeToggle, scope: this}),
			contents: new Ext.Button({text: FR.T('Contents'), value: 'contents', hidden: !Settings.fullTextSearch, enableToggle: true, toggleHandler: this.typeToggle, scope: this})
		};

		this.contentsToogleSeparator = new Ext.Toolbar.Separator({hidden: !Settings.fullTextSearch});

		this.formPanel = new Ext.form.FormPanel({
			items: [
				{
					xtype: 'toolbar', style: 'margin-bottom:10px',
					defaults: {scope: this},
					items: [
						this.toggles.filename,
						this.toggles.metatype,
						this.toggles.meta,
						this.contentsToogleSeparator,
						this.toggles.contents,
						{
							text: (FR.isMobile ? false: 'Search'),
							cls: 'fr-btn-primary', iconCls: 'fa fa-fw fa-search',
							style: 'margin-left:20px',
							handler: function() {this.delayedSearch.delay(0);}
						},
						'->',
						{
							tooltip: FR.T('Close search'),
							iconCls: 'fa fa-fw fa-close gray',
							handler: function() {
								this.close();
								FR.utils.reloadGrid();
							}
						}
					]
				},
				this.inputs.filename,
				this.inputs.metatype,
				this.inputs.contents,
				this.inputs.meta
			]
		});

		Ext.apply(this, {
			items: this.formPanel,
			listeners: {
				'expand': function() {
					var visible = false;
					Ext.iterate(this.inputs, function(k, input) {
						if (input.isVisible()) {
							visible = input;
							input.focus();
							return false;
						}
					});
					if (this.prepopulated) {this.adjustHeight();return true;}
					if (!visible) {
						this.toggles[Settings.search_default_mode].toggle(true);
						this.inputs[Settings.search_default_mode].focus();
					}
				}, scope: this
			}
		});
		FR.components.SearchPanel.superclass.initComponent.apply(this, arguments);
	},
	push2History: function() {
		FR.push2History(FR.currentPath + '?' + Ext.encode(this.params));
	},
	addNewMeta: function(keyword, fid) {
		var field = new Ext.form.CompositeField({
			combineValues: true, name: 'meta', additional: true,
			items: [
				{
					xtype: 'textfield', fieldLabel: FR.T('Metadata'), name: 'keyword',
					enableKeyEvents: true, height: 24, flex:1, listeners: this.inputListeners,
					value: keyword || ''
				},
				new Ext.form.ComboBox({
					mode: 'local', triggerAction: 'all', editable: false, flex:1,
					store: FR.searchMetaColumns, valueField: 'id', displayField: 'title',
					value: fid || '-', name: 'fid',
					listeners: {
						'select': function(cb, record) {
							this.delayedSearch.delay(0);
						}, scope: this
					}
				}),
				{
					xtype: 'button',
					tooltip: FR.T('Remove search criteria'),
					iconCls: 'fa fa-fw fa-minus gray', cls:'fr-btn-default fr-btn-in-form',
					handler: function(btn) {this.removeMetaInput(btn.ownerCt.ownerCt);}, scope: this
				}
			],
			focus: function() {this.items.first().focus();}
		});
		this.formPanel.add(field);
		this.formPanel.doLayout();
		this.adjustHeight();
		field.focus();
	},
	removeMetaInput: function(input) {
		var value = input.items.first().getValue();
		this.formPanel.remove(input, true);
		this.formPanel.doLayout();
		this.adjustHeight();
		if (value.length) {
			this.delayedSearch.delay(0);
		}
	},
	removeAdditionalMetaInputs: function() {
		this.formPanel.items.each(function(item) {
			if (item.name == 'meta' && item.additional) {
				this.removeMetaInput(item);
			}
		}, this);
	},
	isEmpty: function(params) {
		var isEmpty = true;
		Ext.iterate(params, function(k, v) {
			if (v) {isEmpty = false;return false;}
		});
		return isEmpty;
	},
	typeToggle: function(button, pressed) {
		if (pressed) {
			this.inputs[button.value].show().focus();
			if (button.value == 'contents') {
				this.toggles.filename.toggle(false);
				this.toggles.metatype.toggle(false);
				this.toggles.meta.toggle(false);
			} else {
				this.toggles.contents.toggle(false);
			}

		} else {
			this.inputs[button.value].hide().reset();
			if (button.value == 'meta') {
				this.formPanel.items.each(function(item) {
					if (item.name == 'meta' && item.additional) {
						this.removeMetaInput(item);
					}
				}, this);
			}
			this.delayedSearch.delay(0);
		}
		this.adjustHeight();
	},
	adjustHeight: function() {
		this.setHeight(this.formPanel.body.dom.scrollHeight+30);
		Ext.getCmp('FR-Center-Region').doLayout(true);
	},
	updateForm: function(p) {
		this.removeAdditionalMetaInputs();
		Ext.iterate(this.toggles, function(k, toggle) {
			if (k == 'meta') {
				if (p.hasOwnProperty('meta')) {toggle.toggle(true);}
			} else {
				var value = '', toggled = false;
				if (p[k]) {
					value = p[k];
					if (p[k].length > 0) {
						toggled = true;
					}
				}
				toggle.toggle(toggled);
				this.inputs[k].suspendEvents().setValue(value).resumeEvents();
			}
		}, this);

		if (p.meta) {
			var count = 0;
			Ext.iterate(p.meta, function (fid, vals) {
				Ext.each(vals, function (val) {
					count++;
					if (count == 1) {
						this.inputs.meta.items.first().suspendEvents().setValue(val).resumeEvents();
						this.metaFieldSelector.suspendEvents().setValue(fid).resumeEvents();
					} else {
						this.addNewMeta(val, fid);
					}
				}, this);
			}, this);
		}
	},
	close: function(noHistoryChange) {
		FR.UI.gridPanel.view.closeSearchPanel();
		FR.UI.actions.searchBtn.toggle(false, true);
		if (!noHistoryChange) {
			FR.push2History(FR.currentPath);
		}
	},
	open: function(prepopulated) {
		FR.UI.gridPanel.view.showSearchPanel();
		FR.UI.gridPanel.reset();
		FR.UI.infoPanel.refresh();
		FR.UI.actions.searchBtn.toggle(true, true);
	},
	doSearch: function(p) {
		if (!p && !FR.UI.tree.currentSelectedNode) {
			FR.UI.tree.selectFirstVisible();
			return false;
		}
		this.updateForm(p || {});
		this.prepopulated = !!p;
		this.open();
		this.delayedSearch.delay(0);
	}
});