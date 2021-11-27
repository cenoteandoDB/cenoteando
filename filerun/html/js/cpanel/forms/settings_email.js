FR.editSettings = {};
FR.editSettings.formPanel = new FR.components.editForm({
	title: FR.T('E-mail settings'),
	layout: 'form', bodyStyle: 'padding:10px;',
	labelWidth: 150, autoScroll: true,
	items: [
		{
			xtype: 'fieldset',
			checkboxToggle: {tag: 'input', type: 'checkbox', name: this.checkboxName || this.id + '-checkbox', id: 'settings[smtp_enable]'}, 
			checkboxName: 'settings[smtp_enable]',
			title: FR.T('Use a SMTP server.'), animCollapse: true,
			collapsed: !parseInt(FR.settings.smtp_enable),
			width: 500, defaults: {width: 250}, listeners: {'expand': function() {this.doLayout();}},
			items: [
				{
					xtype: 'textfield',
					fieldLabel: FR.T('SMTP server'),
					name: 'settings[smtp_host]', value: FR.settings.smtp_host
				},
				{
					xtype: 'textfield',
					fieldLabel: FR.T('Port number'), width: 50,
					name: 'settings[smtp_port]', value: FR.settings.smtp_port
				},
				{
					xtype: 'combo',
					fieldLabel: FR.T('Security'),
					name: 'settings[smtp_security]', hiddenName: 'settings[smtp_security]',
					autoCreate: true, mode: 'local', editable: false,
					displayField: 'name', valueField: 'id',
					triggerAction:'all', disableKeyFilter: true,
					value: FR.settings.smtp_security,
					store: new Ext.data.SimpleStore({fields: ['id', 'name'], data: [
						['none', FR.T('None')],
						['tls', FR.T('TLS')],
						['ssl', FR.T('SSL')]
					]})
				},
				{
					xtype: 'checkbox',
					boxLabel: FR.T('SMTP requires authentication.'), value: 1,
					name: 'settings[smtp_auth]', checked: parseInt(FR.settings.smtp_auth)
				},
				{
					xtype: 'textfield',
					fieldLabel: FR.T('SMTP username'),
					name: 'settings[smtp_username]', value: FR.settings.smtp_username
				},
				{
					xtype: 'textfield',
					fieldLabel: FR.T('SMTP password'),
					name: 'settings[smtp_password]', value: FR.settings.smtp_password,
					inputType: 'password', listeners: {
						'focus': function() {
							this.getEl().dom.setAttribute('type', 'text');
						},
						'blur': function() {
							this.getEl().dom.setAttribute('type', 'password');
						}
					}
				},
				{
					xtype: 'panel', border: false, layout: 'hbox', width: 500,
					layoutConfig: {padding: 5}, bodyStyle: 'padding-left:150px',
					defaults:{margins:'0 5 0 0'},
					items: [
						{xtype: 'button', text: FR.T('Test settings'), cls: 'fr-btn-default fr-btn-smaller fr-btn-nomargin',
							handler: function() {
							var params = this.ownerCt.ownerCt.ownerCt.form.getValues();
							var output = this.ownerCt.ownerCt.serverReply; output.show();
							FR.utils.getAjaxOutput(FR.URLRoot+'/?module=cpanel&section=settings&page=email&action=test', params, output);
						}}
					]
				},
				{xtype: 'displayfield', ref: 'serverReply', width:300, value: 'test', style:'border:1px solid silver;padding:3px;white-space:nowrap;overflow:auto;max-height:160px;font-size:10px;', hidden: true}
			]
		},
		{
			xtype: 'fieldset',
			title: FR.T('E-mail notifications'),
			width: 500, defaults: {width: 300},
			items: [
				{
					xtype: 'textfield', width: 250,
					fieldLabel: FR.T('From e-mail address'),
					name: 'settings[default_notification_address]', value: FR.settings.default_notification_address
				},
				{
					xtype: 'textfield', width: 250,
					fieldLabel: FR.T('From name'),
					name: 'settings[default_notification_name]', value: FR.settings.default_notification_name
				},
				{
					xtype: 'textfield',
					fieldLabel: FR.T('Subject template'),
					name: 'settings[notifications_subject_template]', value: FR.settings.notifications_subject_template
				},
				{
					xtype: 'textarea', height: 220,
					fieldLabel: FR.T('Message template'),
					name: 'settings[notifications_template]',
					value: FR.settings.notifications_template
				},
				{
					xtype: 'textfield', width: 250,
					fieldLabel: FR.T('BCC'),
					name: 'settings[notifications_bcc]', value: FR.settings.notifications_bcc,
					helpText: FR.T('Specify an e-mail address where to send copies of the notifications')
				},
				{
					xtype: 'checkbox',
					boxLabel: FR.T('Instant email notifications'), value: 1,
					name: 'settings[instant_email_notifications]', checked: parseInt(FR.settings.instant_email_notifications),
					helpText: FR.T('Uncheck this option if you will be running the notification script using a scheduled task.')
				},
				{
					xtype: 'checkbox', hidden: FR.system.isFree,
					boxLabel: FR.T('Allow users to set notification settings to folders.'), value: 1,
					name: 'settings[allow_folder_notifications]', checked: parseInt(FR.settings.allow_folder_notifications)
				}
			]
		},
		{
			xtype: 'fieldset', hidden: FR.system.isFree,
			title: FR.T('Misc'), labelWidth: 1,
			width: 500, defaults: {width: 500},
			items: [
				{
					xtype: 'checkbox',
					boxLabel: FR.T('Allow the users to edit the e-mail address they are sending files from.'), value: 1,
					name: 'settings[send_from_custom_email]', checked: parseInt(FR.settings.send_from_custom_email)
				}
			]
		}
	],
	tbar: [
		{
			text: FR.T('Save changes'), cls: 'fr-btn-primary',
			ref: 'saveBtn',
			handler: function() {
				var editForm = this.ownerCt.ownerCt;
				var params = editForm.form.getFieldValues();
				var extra = {};
				extra['settings[smtp_enable]'] = Ext.get('settings[smtp_enable]').dom.checked ? 1:0;
				Ext.apply(params, extra);
				var opts = {
					url: FR.URLRoot+'/?module=cpanel&section=settings&action=save',
					maskText: 'Saving changes...',
					params: params
				};
				editForm.submitForm(opts);
			}
		}
	]
});
Ext.getCmp('appTab').add(FR.editSettings.formPanel);
Ext.getCmp('appTab').doLayout();