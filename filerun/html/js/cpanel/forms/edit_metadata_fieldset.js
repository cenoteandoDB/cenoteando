FR.editFieldSet = {
	getFieldsSelector: function() {
		this.tree = {};
		this.tree.panel = new Ext.tree.TreePanel({cls: 'plain-list', style: 'border:1px solid silver',
			animate: true, containerScroll: true, rootVisible:false, autoScroll: true, lines: false,
			height: 180, width: 250,
			bbar: [
				{
					text: FR.T('Add'), iconCls: 'fa fa-fw fa-plus-circle', ref: '../addBtn', style:'margin-left:5px',
					handler: function() {
						Ext.getCmp('gridTabPanel').el.mask('Loading...');
						FR.tempPanel.load({
							url: FR.URLRoot+FR.modules.metadata_fields.url.add,
							params: {sid: FR.setInfo.id}, scripts: true,
							callback: function() {
								Ext.getCmp('gridTabPanel').el.unmask();
							}
						});
					}, scope: this
				},
				{
					text: FR.T('Edit'), ref: '../editBtn', iconCls: 'fa fa-fw fa-edit', disabled: true,
					handler: function() {
						var node = this.tree.panel.getSelectionModel().getSelectedNode();
						Ext.getCmp('gridTabPanel').el.mask('Loading...');
						FR.tempPanel.load({
							url: FR.URLRoot+FR.modules.metadata_fields.url.edit,
							params: {id: node.attributes.extra.id}, scripts: true,
							callback: function() {
								Ext.getCmp('gridTabPanel').el.unmask();
							}
						});
					}, scope: this
				},{
					text: FR.T('Delete'), ref: '../removeBtn', iconCls: 'fa fa-fw fa-remove colorRed', disabled: true,
					handler: function() {
						var node = this.tree.panel.getSelectionModel().getSelectedNode();
						FR.editFieldSet.formPanel.bwrap.mask(FR.T('Please wait...'));
						Ext.Ajax.request({
							url: FR.URLRoot+FR.modules.metadata_fields.url.del,
							params: {id: node.attributes.extra.id},
							callback: function() {if (FR.editFieldSet.formPanel.bwrap){FR.editFieldSet.formPanel.bwrap.unmask();}},
							success: function(req) {
								try {
									var rs = Ext.util.JSON.decode(req.responseText);
								} catch (er){return false;}
								if (rs) {
									if (rs.success) {
										this.tree.root.removeChild(node);
										FR.feedback(rs.msg);
									} else {
										FR.feedback(rs.msg);
									}
								} else {FR.feedback(req.responseText);}
							},
							failure: function(f, a) {FR.feedback(f.responseText);},
							scope: this
						});
					}, scope: this
				}
			]
		});
		this.tree.root = new Ext.tree.TreeNode({text: 'Root'});
		this.tree.panel.setRootNode(this.tree.root);
		Ext.each(FR.setInfo.fields, function(field) {
			this.tree.root.appendChild(new Ext.tree.TreeNode({text: field.name,  leaf: true, extra: field}));
		}, this);
		this.tree.panel.getSelectionModel().on('selectionchange', function (selectionModel, treeNode) {
			this.tree.panel.editBtn.setDisabled(!treeNode);
			this.tree.panel.removeBtn.setDisabled(!treeNode);
		}, this);
	}
};
FR.editFieldSet.getFieldsSelector();
FR.editFieldSet.formPanel = new FR.components.editForm({
	title: FR.T('Edit Field Set')+' "'+FR.setInfo.name+'"',
	layout: 'form', bodyStyle: 'padding:10px;', autoScroll: true,
	items: [
		{
			xtype: 'fieldset',
			title: FR.T('Basic Info'),
			width: 500,
			defaults: {width: 250},
			items: [
				{
					xtype: 'hidden',
					name: 'id',
					value: FR.setInfo.id
				},
				{
					xtype: 'textfield',
					fieldLabel: FR.T('Field set name'),
					name: 'name',
					value: FR.setInfo.name
				},{
					xtype: 'textarea',
					fieldLabel: FR.T('Description'),
					name: 'description',
					value: FR.setInfo.description
				},
				{
					xtype: 'checkbox',
					boxLabel: FR.T('Generic field set'),
					width: 400, value: 1,
					helpText: FR.T('A generic field set is one that is available for every file by default.'),
					name: 'generic', checked: parseInt(FR.setInfo.generic)
				}
			]
		},
		{
			xtype: 'fieldset',
			title: FR.T('Fields'),
			width: 500,
			defaults: {width: 250},
			items: {
				xtype: 'compositefield',
				items: [{xtype: 'textfield', hidden: true, fieldLabel: ''}, FR.editFieldSet.tree.panel]
			}
		}
	],
	tbar: [
		{
			text: FR.T('Save changes'),
			cls: 'fr-btn-primary',
			ref: 'saveBtn',
			handler: function() {
				var editForm = this.ownerCt.ownerCt;
				var opts = {
					url: FR.URLRoot+'/?module=metadata&section=cpanel&page=edit_fieldset&action=save',
					maskText: 'Saving changes...'
				};
				editForm.submitForm(opts);
			}
		},
		'->',
		{
			text: FR.T('Delete Field Set'),
			iconCls: 'fa fa-fw fa-remove colorRed',
			handler: function(){FR.editFieldSet.deleteHandler();}
		}
	]
});
FR.editFieldSet.deleteHandler = function() {
	new Ext.ux.prompt({
		text: FR.T('Please confirm field set deletion.'),
		confirmHandler: function() {
			var opts = {
				url: FR.URLRoot+'/?module=metadata&section=cpanel&page=delete_fieldset&id='+FR.setInfo.id,
				maskText: 'Please wait...'
			};
			FR.editFieldSet.formPanel.deleteAction(opts);
		}
	});
};
Ext.getCmp('gridTabPanel').add(FR.editFieldSet.formPanel);
FR.editFieldSet.formPanel.show();