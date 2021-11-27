FR.logSearch = {
	actionsList: []
};
Ext.each(FR.actions, function(act) {
	FR.logSearch.actionsList.push(new Ext.form.Checkbox({name:'actions['+act.k+']', inputValue: act.k, boxLabel: act.t, checked: false}));
});
FR.logSearch.formPanel = new FR.components.editForm({
	title: FR.T('Search Activity Logs'),
	layout: 'form', bodyStyle: 'padding:10px;',
	defaults: {width: 250}, autoScroll: true,
	items: [
		{
			xtype: 'textfield',
			fieldLabel: FR.T('Keyword'),
			name: 'search',
			value: ''
		},{
			xtype: 'datefield',
			fieldLabel: FR.T('Date start'),
			name: 'date_start', value: ''
		},
		{
			xtype: 'datefield',
			fieldLabel: FR.T('Date end'),
			name: 'date_end', value: ''
		},
		{
			fieldLabel: FR.T('Action'),
			xtype: 'checkboxgroup', columns: 1,
			height: 150, width: 250, autoScroll: true, style: 'padding:5px;border:1px solid silver',
			items: FR.logSearch.actionsList
		},
		{
			xtype: 'panel', width: 355, style: 'margin-bottom:5px',
			bbar: [
				'->',
				{
					text: FR.T('Select all'), cls:'fr-btn-smaller', handler: function() {Ext.each(FR.logSearch.actionsList, function(c) {c.setValue(true);});}
				},
				{
					text: FR.T('Clear all'), cls:'fr-btn-smaller', handler: function() {Ext.each(FR.logSearch.actionsList, function(c) {c.setValue(false);});}
				}
			]
		},
		{
			xtype: 'userslistfield',
			name: 'users', only: 'users',
			value: '', showSelf: true,
			fieldLabel: FR.T('Users'),
			tcfg: {height: 150, width: 250}
		}
	],
	tbar: [
		{
			text: FR.T('Search'),
			cls: 'fr-btn-primary',
			iconCls: 'fa fa-fw fa-search color-white',
			handler: function() {
				var editForm = this.ownerCt.ownerCt;
				var store = FR.grid.panel.getStore();
				store.baseParams = Ext.apply({limit: FR.system.gridItemsPerPage}, editForm.form.getValues());
				Ext.getCmp('gridTab').show();
				store.load();
			}
		},
		{
			text: FR.T('Export'),
			cls: 'fr-btn-primary',
			iconCls: 'fa fa-fw fa-download color-white', style: 'margin-left:5px',
			handler: function () {
				var frm = document.createElement('FORM');
				frm.action = FR.URLRoot+'/?module=logs&section=cpanel&page=list&export=1';
				frm.method = 'POST';
				frm.target = '_blank';
				Ext.iterate(this.ownerCt.ownerCt.form.getFieldValues(), function(k, v) {
					var inpt = document.createElement('INPUT');
					inpt.type = 'hidden';
					inpt.name = k;
					if (k == 'date_end' || k == 'date_start') {
						if (v) {
							inpt.value = v.format('m/d/Y');
						} else {
							inpt.value = '';
						}
					} else {
						inpt.value = v;
					}
					frm.appendChild(inpt);
				});
				Ext.getBody().dom.appendChild(frm);
				frm.submit();
				Ext.get(frm).remove();
			}
		}
	]
});
Ext.getCmp('gridTabPanel').add(FR.logSearch.formPanel);
FR.logSearch.formPanel.show();