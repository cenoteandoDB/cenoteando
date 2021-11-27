Ext.getCmp('appTab').add(new FR.components.editForm({
	title: FR.T('Import Users'),
	items: {
		xtype: 'tabpanel', ref: 'tabPanel',
		activeTab: 0, deferredRender: false,
		defaults: {autoScroll: true, bodyStyle:'padding:10px', listeners: {'render': function() {this.doLayout(false, true);}}},
		items: [
			{
				title: FR.T('Step 1: Upload CSV File'),
				items: [
					{
						xtype: 'displayfield', style: 'font-size:11px;color:gray;padding-bottom:10px;',
						value: FR.T('The CSV file needs to contain at least two columns, for username and name.')+'<br><br>'+
							FR.T('You will be asked to map the fields, so the names and the order of the columns are not important.')
					},
					{
						xtype: 'fieldset', labelWidth: 150,
						width: 500,	defaults: {width: 300},
						items: [
							{
								xtype: 'radiogroup',
								fieldLabel: FR.T('Fields are separated by'),
								columns: 1,
								items: [
									{boxLabel: FR.T('Comma'), name: 'delimiter', inputValue: 'comma', value: 'comma', checked: true},
									{boxLabel: FR.T('Semicolon'), name: 'delimiter', inputValue: 'semicolon', value: 'semicolon', checked: false},
									{boxLabel: FR.T('Tab'), name: 'delimiter', inputValue: 'tab', value: 'tab', checked: false}
								]
							},
							{
								xtype: 'panel', layout: 'hbox',
								layoutConfig: {padding: 5}, bodyStyle: 'padding-left:150px',
								defaults:{margins:'0 5 0 0'},
								items: [
									{
										xtype: 'button', text: FR.T('Upload CSV file'), cls:'fr-btn-primary color-white', iconCls: 'fa fa-fw fa-upload',
										listeners: {
											'afterrender': function () {
												var formPanel = this.ownerCt.ownerCt.ownerCt.ownerCt.ownerCt;
												var tabPanel = formPanel.tabPanel;
												var uploadTab = tabPanel.items.itemAt(0);
												this.flow = new Flow({
													target: FR.URLRoot+'/?module=users&section=import&page=upload',
													singleFile: true, startOnSubmit: true
												});
												this.flow.on('filesSubmitted', function() {
													uploadTab.bwrap.mask(FR.T('Upload starting...'));
												});
												this.flow.on('progress', function(flow) {
													var percent = Math.floor(flow.getProgress()*100);
													uploadTab.bwrap.mask(FR.T('Uploading...%1%').replace('%1', percent));
												});
												this.flow.on('fileSuccess', function(file, message) {
													uploadTab.bwrap.unmask();
													try {
														var rs = Ext.util.JSON.decode(message);
													} catch (er){
														FR.feedback('Unexpected server reply: '+message);
													}
													if (rs) {
														if (rs.msg) {FR.feedback(rs.msg);}
														if (rs.success) {
															var mapFieldsTab = tabPanel.items.itemAt(1);
															uploadTab.setDisabled(1);
															mapFieldsTab.setDisabled(0);
															tabPanel.setActiveTab(1);

															var comboStore = new Ext.data.SimpleStore({
																idIndex: 0,
																fields: ['key', 'display'],
																data: FR.importColumns
															});

															// create the Data Store
															var fields = ['record_number'];
															var columns = [{dataIndex: 'record_number', width:100}];
															var comboMappings = [{xtype: 'displayfield', width: 100, value: FR.T('Record number')}];
															var gridWidth = 100;
															for (var i = 0 ; i < rs.preview[0].length-1; i++) {
																gridWidth = gridWidth+130;
																fields.push('h'+i);
																columns.push({dataIndex: 'h'+i, width: 130});
																comboMappings.push({
																	xtype: 'combo', width: 125,
																	mode: 'local', editable: false,
																	triggerAction: 'all', lazyRender: true,
																	displayField: 'display', valueField: 'key',
																	listClass: 'x-combo-list-small', store: comboStore,
																	name: 'mappings', hiddenName: 'mappings['+i+']',
																	value: ((rs.preset && rs.preset[i]) ? rs.preset[i] : '-')
																});
															}
															var store = new Ext.data.ArrayStore({
																idIndex: 0, fields: fields, data: rs.preview
															});
															var grid = new Ext.grid.GridPanel({
																columns: columns,	store: store, border: false,
																hideHeaders: true, columnLines: true, width: gridWidth
															});
															var combos = new Ext.form.CompositeField({
																items: comboMappings, width: gridWidth
															});

															mapFieldsTab.add(combos);
															mapFieldsTab.add(new Ext.form.DisplayField());
															mapFieldsTab.add(grid);
															mapFieldsTab.add(new Ext.form.DisplayField({
																style: 'font-size:10px;color:gray',
																value: FR.T('Only the first 10 records are being displayed here.')
															}));
															mapFieldsTab.doLayout();
														}
													}
												});
												this.flow.on('fileError', function(file, message) {
													uploadTab.bwrap.unmask();
													try {var rs = Ext.util.JSON.decode(message);} catch (er){
														FR.feedback('Unexpected server reply: '+message);
													}
													if (rs && rs.msg) {FR.feedback(rs.msg);}
												});
												this.flow.on('complete', function() {
													uploadTab.bwrap.unmask();
												});
											}
										},
										handler: function() {
											var formPanel = this.ownerCt.ownerCt.ownerCt.ownerCt.ownerCt;
											this.flow.removeAll();
											this.flow.browseFiles({query: {delimiter: formPanel.form.getValues().delimiter}});
										}
									}
								]
							}
						]
					}
				]
			},
			{
				title: FR.T('Step 2: Map Fields'),
				disabled: true,
				tbar: [
					{
						text: FR.T('Import Users'),
						cls: 'fr-btn-primary fr-btn-smaller',
						ref: 'saveBtn',
						handler: function() {
							var fp = this.ownerCt.ownerCt.ownerCt.ownerCt;
							fp.el.mask(FR.T('Loading...'));
							Ext.Ajax.request({
								url: FR.URLRoot+'/?module=users&section=import&page=import',
								params: fp.form.getValues(),
								success: function(req) {
									this.el.unmask();
									try {
										var rs = Ext.util.JSON.decode(req.responseText);
									} catch (er){
										FR.feedback('Error: '+req.responseText);
										return false;
									}
									if (rs.success) {
										fp.results.update(rs.msg);
										fp.tabPanel.items.itemAt(2).setDisabled(0);
										fp.tabPanel.setActiveTab(2);
									} else {
										FR.feedback(rs.msg);
									}
								},
								failure: function() {FR.feedback('An error was encountered while trying to send the request to the server.');},
								scope: fp
							});
						}
					}
				],
				items: [
					{
						xtype: 'fieldset',
						labelWidth: 200,
						width: 500,
						items: [
							{
								xtype: 'combo',
								fieldLabel: FR.T('Assign a role to the users'),
								name: 'role', hiddenName: 'role', ref: '../role',
								autoCreate: true, mode: 'local', editable: false,
								displayField: 'name', valueField: 'id', allowBlank: false, forceSelection: true,
								triggerAction:'all', disableKeyFilter: true, value: FR.roles[0] ? FR.roles[0][0] : '-',
								store: new Ext.data.SimpleStore({fields: ['id', 'name'], data: FR.roles})
							},
							{
								xtype: 'userslistfield', name: 'groups', only: 'groups', value: '',
								fieldLabel: FR.T('Add the users to groups'), tcfg: {height: 70, width: 230}
							},
							{
								xtype: 'textfield',
								fieldLabel: FR.T('Start with record number'),
								name: 'offset', width: 60,
								helpText: FR.T('Set this to 2, if your CSV file has a header line.'),
								value: 2
							},
							{
								xtype: 'checkbox',
								fieldLabel: FR.T('Passwords are in clear text'),
								name: 'clear_text_pass', value: 1,
								helpText: FR.T('Enable this option if the passwords stored in your CSV files are not encrypted.')
							},
							{
								xtype: 'checkbox',
								fieldLabel: FR.T('Automatically generate passwords for the accounts'),
								name: 'gen_pass', value: 1
							},
							{
								xtype: 'checkbox',
								fieldLabel: FR.T('Require user to change the password'),
								name: 'require_password_change', value: 1
							},
							{
								xtype: 'checkbox',
								boxLabel: FR.T('Send a notification now'),
								helpText: FR.T('An e-mail message with the login information will be sent to the user\'s address.'), inputValue: 1,
								name: 'notify', checked: false
							}
						]
					}
				]
			},
			{
				title: FR.T('Step 3: Import Users'),
				disabled: true,
				items: [{ref: '../../results', bodyStyle:'padding:10px', html: ''}]
			}
		]
	}
}));
Ext.getCmp('appTab').doLayout();