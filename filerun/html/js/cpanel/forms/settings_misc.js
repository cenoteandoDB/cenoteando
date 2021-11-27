FR.editSettings = {custom_actions:[]};
FR.editSettings.formPanel = new FR.components.editForm({
	title: FR.T('Misc options'),
	layout: 'form', bodyStyle: 'padding:10px;',
	labelWidth: 250, autoScroll: true, defaults: {width: 500},
	items: [
		{
			xtype: 'fieldset', labelWidth: 200, defaults: {width: 250},
			items:[
				{xtype: 'displayfield', hidden: !Ext.isIE},
				{
					xtype: 'checkbox',
					boxLabel: FR.T('Enable maintenance mode'), value: 1,
					name: 'settings[maintenance]', checked: parseInt(FR.settings.maintenance),
					helpText: FR.T('Disables users access and WebLinks.<br>The superuser still has normal access.')
				},
				{
					xtype: 'textarea', grow: true,
					fieldLabel: FR.T('Maintenance message to users'), height: 70,
					name: 'settings[maintenance_message_users]', value: FR.settings.maintenance_message_users
				},
				{
					xtype: 'textarea', grow: true,
					fieldLabel: FR.T('Maintenance message to public'), height: 70,
					name: 'settings[maintenance_message_public]', value: FR.settings.maintenance_message_public
				}
			]
		},
		{
			xtype: 'fieldset',
			labelWidth: 1,
			items:[
				{xtype: 'displayfield', hidden: !Ext.isIE},
				{
					xtype: 'checkbox',
					boxLabel: FR.T('Force users to access via HTTPS.'),
					width: 400, value: 1,
					name: 'settings[force_https]', checked: parseInt(FR.settings.force_https)
				}
			]
		},
		{
			xtype: 'fieldset', labelWidth: 300, defaults: {xtype: 'numberfield', width: 60, allowBlank: false,},
			items:[
				{xtype: 'displayfield', hidden: !Ext.isIE},
				{
					fieldLabel: FR.T('Number of days to keep the user activity log entries'),
					name: 'settings[user_activity_logs_entry_lifetime]', value: FR.settings.user_activity_logs_entry_lifetime
				},
				{
					fieldLabel: FR.T('Users quota warning level'),
					name: 'settings[quota_warning_level]',
					value: FR.settings.quota_warning_level, hidden: FR.system.isFree,
					helpText: FR.T('Set a number between 70 and 100, representing the quota usage percentage.')
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
				var opts = {
					url: FR.URLRoot+'/?module=cpanel&section=settings&action=save',
					maskText: 'Saving changes...',
					params: editForm.form.getFieldValues()
				};
				editForm.submitForm(opts);
			}
		}
	]
});
Ext.getCmp('appTab').add(FR.editSettings.formPanel);
Ext.getCmp('appTab').doLayout();