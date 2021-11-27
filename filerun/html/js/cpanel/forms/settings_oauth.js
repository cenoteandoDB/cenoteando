FR.editSettings = {};
FR.editSettings.formPanel = new FR.components.editForm({
	title: FR.T('OAuth2'),
	layout: 'form', bodyStyle: 'padding:10px;',
	autoScroll: true, defaults: {width: 500},
	items: [

		{xtype: 'displayfield', hidden: !Ext.isIE},
		{
			xtype: 'displayfield', hideLabel: true, style: 'color:gray;padding:13px', value: '<i class="fa fa-info-circle"></i> ' + FR.T('The API is required by the mobile and desktop apps.')
		},
		{
			xtype: 'fieldset',
			checkboxToggle: {tag: 'input', type: 'checkbox', id: 'settings[oauth2]'},
			title: FR.T('Enable API'), animCollapse: true,
			collapsed: !parseInt(FR.settings.oauth2),
			labelWidth: 250,
			width: 600, defaults: {width: 300},
			listeners: {'expand': function() {if (!this.layoutPatched) {this.doLayout(false, true);this.layoutPatched = true;}}},
			items: [
				{
					xtype: 'checkbox', hideLabel: true,
					boxLabel: FR.T('Allow unsafe access over plain HTTP.'), value: 1,
					name: 'settings[oauth2_allow_over_http]', checked: parseInt(FR.settings.oauth2_allow_over_http),
					helpText: FR.T('Enabling this puts your data at risk and should not be used during production.')
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
				extra['settings[oauth2]'] = Ext.get('settings[oauth2]').dom.checked ? 1:0;
				Ext.apply(params, extra);
				var opts = {
					url: FR.URLRoot+'/?module=cpanel&section=settings&page=oauth&action=save',
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