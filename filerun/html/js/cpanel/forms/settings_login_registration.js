FR.editSettings = {
	confirmAuthPluginChange: false,
	saveChanges: function() {
		var editForm = this.formPanel;
		var params = editForm.form.getFieldValues();
		if (!FR.system.isFree) {
			if (params['settings[auth_plugin]'] != '-' && params['settings[auth_plugin]'] != FR.settings.auth_plugin && !FR.editSettings.confirmAuthPluginChange) {
				new Ext.ux.prompt({
					text: FR.T('You are about to enable an authentication plugin. Did you use the "Test settings" button to make sure the plugin is properly configured?'),
					confirmHandler: function () {
						this.confirmAuthPluginChange = true;
						this.saveChanges();
					}, scope: this
				});
				return false;
			}
			this.confirmAuthPluginChange = false;
		}
		var extra = {};
		extra['settings[user_registration_enable]'] = Ext.get('settings[user_registration_enable]').dom.checked ? 1:0;
		Ext.apply(params, extra);
		var opts = {
			url: FR.URLRoot+'/?module=cpanel&section=settings&page=login_registration&action=save',
			maskText: 'Saving changes...',
			params: params
		};
		editForm.submitForm(opts);
	},
	changePlugin: function(pluginInfo) {
		if (!pluginInfo) {return false;}
		var form = FR.editSettings.formPanel;
		var combo = form.plugin;
		var pluginOpts = form.pluginOpts;
		form.pluginDescr.update(pluginInfo.description);
		if (pluginInfo.id == '-') {
			pluginOpts.hide();
		} else {
			pluginOpts.setTitle(FR.T('%1 plugin options').replace('%1', pluginInfo.name));
			pluginOpts.removeAll();
			Ext.each(pluginInfo.fields, function (field) {
				this.ownerCt.ownerCt.pluginOpts.add({
					xtype: field.name ? 'textfield' : 'displayfield',
					fieldLabel: field.label,
					name: 'settings['+field.name+']',
					helpText: FR.T(field.helpText) || false,
					value: field.value
				});
			}, combo);

			pluginOpts.add(new Ext.form.DisplayField());

			pluginOpts.add(new Ext.form.CompositeField({fieldLabel: '', items: [
				{xtype: 'button', text: FR.T('Test settings'), cls: 'fr-btn-default fr-btn-smaller fr-btn-nomargin', handler: function() {
					var params = FR.editSettings.formPanel.form.getValues();
					var output = this.ownerCt.ownerCt.ownerCt.serverReply; output.show();
					FR.utils.getAjaxOutput(FR.URLRoot+'/?module=cpanel&section=settings&page=login_registration&action=test_auth_plugin', params, output);
				}},
				{xtype: 'displayfield'}
			]}));
			pluginOpts.add(new Ext.form.DisplayField({ref: 'serverReply', width:300, value: 'test', style:'border:1px solid silver;padding:3px;', hidden: true}));

			pluginOpts.doLayout();
			pluginOpts.show();
		}
	}
};
FR.editSettings.comboStore = new Ext.data.ArrayStore({idIndex: 0, fields: ['id', 'name', 'description', 'fields'], data: FR.pluginsInfo});
FR.editSettings.formPanel = new FR.components.editForm({
	title: FR.T('User login and registration'), autoScroll: true,
	layout: 'form', bodyStyle: 'padding:10px;',
	defaults: {width: 600}, labelWidth: 160,
	items: [
		{
			xtype: 'fieldset', hidden: FR.system.isFree,
			title: FR.T('Third-party authentication'),
			defaults: {width: 400},
			items: [
				{
					xtype: 'combo',
					fieldLabel: FR.T('Enabled plugin'), width: 200,
					name: 'settings[auth_plugin]', hiddenName: 'settings[auth_plugin]', ref: '../plugin',
					autoCreate: true, mode: 'local', editable: false,
					displayField: 'name', valueField: 'id',
					triggerAction:'all', disableKeyFilter: true,
					store: FR.editSettings.comboStore,
					listeners: {
						'beforeselect': function(combo, record) {FR.editSettings.changePlugin(record.data);}
					}
				},
				{
					xtype: 'displayfield', ref: '../pluginDescr', style: 'color:gray', value: FR.T('Use this application\'s own users database')
				},
				{
					xtype: 'checkbox',
					boxLabel: FR.T('Sync passwords to the local database'), value: 1,
					name: 'settings[auth_sync_passwords]', checked: parseInt(FR.settings.auth_sync_passwords),
					helpText: FR.T('Allows the users to login even after the third-party authentication system is not active or enabled. The passwords are stored encrypted.')
				},
				{
					xtype: 'checkbox',
					boxLabel: FR.T('Allow local user accounts to login'), value: 1,
					name: 'settings[auth_allow_local]', checked: parseInt(FR.settings.auth_allow_local),
					helpText: FR.T('Enabling this will allow access to the users that do not have an account with the third-party system.')+'<br>'+FR.T('Make sure you have a user account with the superuser\'s username in the third-party authentication database before disabling this option. If you lock the superuser out, you can disable the plugin by renaming its file.')
				},
				{
					xtype: 'textfield', width: 200,
					fieldLabel: FR.T('IP address limitation'), emptyText: FR.T('Example:')+' 192.168.1.*',
					name: 'settings[auth_plugin_ip_mask]', value: FR.settings.auth_plugin_ip_mask,
					helpText: FR.T('Enable the authentication plugin only for users using certain IP addresses.')+'<br><br>'+
					FR.T('There are three possible formats that can be used:')+'<br>'+
					FR.T('1. Wildcard format: 1.2.3.*')+'<br>'+
					FR.T('2. CIDR format: 1.2.3/24 OR 1.2.3.4/255.255.255.0')+'<br>'+
					FR.T('3. Start-End IP format: 1.2.3.0-1.2.3.255')+'<br><br>'+
					FR.T('It does not work with the "%1" option enabled.').replace('%1', FR.T('Sync passwords to the local database'))
				}
				/*,
				{
					xtype: 'checkbox',
					boxLabel: FR.T('Automatically create and assign groups'), value: 1,
					name: 'settings[auth_autogroups]', checked: parseInt(FR.settings.auth_autogroups)
				}*/
			]
		},
		{
			xtype: 'fieldset',
			title: '&nbsp;', hidden: true,
			defaults: {width: 360}, ref: 'pluginOpts',
			items: []
		},
		{
			xtype: 'fieldset', hidden: FR.system.isFree,
			title: FR.T('New users'),
			defaults: {width: 400},
			items: [
				{
					xtype: 'combo',
					fieldLabel: FR.T('Role'), width: 200,
					name: 'settings[user_registration_default_role]', hiddenName: 'settings[user_registration_default_role]',
					autoCreate: true, mode: 'local', editable: false,
					emptyText: FR.T('Select...'),
					displayField: 'name', valueField: 'id',
					triggerAction:'all', disableKeyFilter: true,
					value: (FR.settings.user_registration_default_role ? FR.settings.user_registration_default_role : '-'),
					store: new Ext.data.SimpleStore({fields: ['id', 'name'], data: FR.roles})
				}
			]
		},
		{
			xtype: 'fieldset', hidden: (FR.system.isFree || FR.system.isFreelancer),
			animCollapse: true,
			checkboxToggle: {tag: 'input', type: 'checkbox', id: 'settings[user_registration_enable]'},
			checkboxName: 'settings[user_registration_enable]',
			title: FR.T('User Registration'),
			collapsed: !parseInt(FR.settings.user_registration_enable),
			defaults: {width: 400},
			items: [
				{
					xtype: 'checkbox',
					boxLabel: FR.T('E-mail account confirmation links.'), value: 1,
					name: 'settings[user_registration_email_verification]', checked: parseInt(FR.settings.user_registration_email_verification)
				},
				{
					xtype: 'checkbox',
					boxLabel: FR.T('New accounts require admin activation.'), value: 1,
					name: 'settings[user_registration_approval]', checked: parseInt(FR.settings.user_registration_approval)
				},
				{
					xtype: 'checkbox',
					boxLabel: FR.T('Automatically generate the passwords.'), value: 1,
					name: 'settings[user_registration_generate_passwords]', checked: parseInt(FR.settings.user_registration_generate_passwords)
				},
				{
					xtype: 'userslistfield', name: 'settings[user_registration_default_groups]', only: 'groups', value: FR.settings.user_registration_default_groups,
					fieldLabel: FR.T('Default groups'), tcfg: {height: 150, width: 250}
				},
				{
					xtype: 'fieldset',
					title: FR.T('Required fields'),
					autoWidth: true, defaults: {xtype: 'checkbox', value: 1, width: 200},
					labelWidth: 150,
					items: [
						{
							boxLabel: FR.T('E-mail address'),
							name: 'settings[user_registration_reqfields_email]', checked: parseInt(FR.settings.user_registration_reqfields_email)
						},
						{
							boxLabel: FR.T('Phone'),
							name: 'settings[user_registration_reqfields_phone]', checked: parseInt(FR.settings.user_registration_reqfields_phone)
						},
						{
							boxLabel: FR.T('Company'),
							name: 'settings[user_registration_reqfields_company]', checked: parseInt(FR.settings.user_registration_reqfields_company)
						},
						{
							boxLabel: FR.T('Web site address'),
							name: 'settings[user_registration_reqfields_website]', checked: parseInt(FR.settings.user_registration_reqfields_website)
						},
						{
							boxLabel: FR.T('Comment'),
							name: 'settings[user_registration_reqfields_description]', checked: parseInt(FR.settings.user_registration_reqfields_description)
						}
					]
				}
			]
		},
		{
			xtype: 'fieldset',
			title: FR.T('User Login'),
			defaults: {width: 400},
			items: [
				{
					xtype: 'textfield', width: 60,
					fieldLabel: FR.T('Maximum login attempts'),
					name: 'settings[max_login_attempts]', value: FR.settings.max_login_attempts,
					helpText: FR.T('The user\'s account will be automatically deactivated after the last failed attempt.')+
					'<br>'+FR.T('The recommended value is 4.')
				},
				{
					xtype: 'checkbox',
					boxLabel: FR.T('Allow users to reset their passwords.'), value: 1,
					name: 'settings[password_recovery_enable]', checked: parseInt(FR.settings.password_recovery_enable)
				},
				{
					xtype: 'checkbox',
					boxLabel: FR.T('Force users to change their passwords after reset.'), value: 1,
					name: 'settings[password_recovery_force_change]', checked: parseInt(FR.settings.password_recovery_force_change)
				},
				{
					xtype: 'checkbox',
					boxLabel: FR.T('Allow users to change their passwords.'), value: 1,
					name: 'settings[allow_change_pass]', checked: parseInt(FR.settings.allow_change_pass)
				}
			]
		},
		{
			xtype: 'fieldset',
			title: FR.T('User Logout'),
			defaults: {width: 300},
			items: [
				{
					xtype: 'textfield', width: 60,
					fieldLabel: FR.T('Inactivity timeout'),
					name: 'settings[logout_inactivity]', value: FR.settings.logout_inactivity,
					helpText: FR.T('The user is automatically logged out after this defined number of minutes of inactivity.')+'<br>'+
					FR.T('Setting this to 0 will have the users permanently logged in until they sign out themselves.')
				},
				{
					xtype: 'textfield', 
					fieldLabel: FR.T('Redirect URL after logout'),
					name: 'settings[logout_redirect]', value: FR.settings.logout_redirect
				},
				{
					xtype: 'textfield',
					fieldLabel: FR.T('Logout URL'), hidden: FR.system.isFree,
					name: 'settings[logout_url]', value: FR.settings.logout_url
				},
				{
					xtype: 'checkbox',
					boxLabel: FR.T('Hide the logout option'), value: 1, hidden: FR.system.isFree,
					name: 'settings[logout_hide]', checked: parseInt(FR.settings.logout_hide)
				}
			]
		}
	],
	tbar: [
		{
			text: FR.T('Save changes'), cls: 'fr-btn-primary',
			ref: 'saveBtn',
			handler: FR.editSettings.saveChanges, scope: FR.editSettings
		}
	]
});
Ext.getCmp('appTab').add(FR.editSettings.formPanel);
Ext.getCmp('appTab').doLayout(false, true);


if (!FR.system.isFree) {
	if (!FR.settings.auth_plugin) {FR.settings.auth_plugin = '-';}
	var pluginInfoRecord = FR.editSettings.comboStore.getById(FR.settings.auth_plugin);
	if (pluginInfoRecord) {
		FR.editSettings.formPanel.plugin.setValue(FR.settings.auth_plugin);
		FR.editSettings.changePlugin(pluginInfoRecord.data);
	}
} else {
	FR.settings.auth_plugin = '-';
}