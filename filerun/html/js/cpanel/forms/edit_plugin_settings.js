var items = [];


items.push({
	xtype: 'fieldset',
	title: FR.pluginInfo.JSconfig.title,
	width: 500,
	defaults: {xtype: 'displayfield', hideLabel: true},
	items: [
		{value: FR.pluginInfo.description, hidden: !FR.pluginInfo.description.length},
		{value: FR.T('Supported formats')+': '+(FR.pluginInfo.ext || FR.T('Any'))}
	]
});

items.push({
	xtype: 'fieldset', hidden: FR.pluginInfo.isImmutable,
	title: FR.T('Options'), width: 500,
	items: [
		{
			xtype: 'checkbox',
			hideLabel: true,
			boxLabel: FR.T('Disable plugin'),
			width: 400, value: 1,
			name: 'settings[disable_custom_action_'+FR.pluginInfo.name+']', checked: FR.pluginInfo.isDisabled
		},
		{
			xtype: 'checkbox',
			hideLabel: true,
			boxLabel: FR.T('Open in a new browser tab'),
			width: 400, value: 1,
			name: 'settings[custom_action_'+FR.pluginInfo.name+'_newtab]', checked: FR.pluginInfo.openInNewTab
		},
		{
			xtype: 'checkbox',
			hideLabel: true,
			boxLabel: FR.T('Hide option for creating new files'),
			width: 400, value: 1,
			name: 'settings[custom_action_'+FR.pluginInfo.name+'_hide_create_new]', checked: FR.pluginInfo.hideCreateNew, hidden: !FR.pluginInfo.hasCreateNew
		}
	]
});

var settingFields = [];
Ext.each(FR.pluginInfo.settings, function(s) {
	var fieldCfg = {
		xtype: 'textfield', value: s.v,
		name: 'settings[plugins_'+FR.pluginInfo.name+'_'+s.k+']'
	};
	if (s.large) {
		fieldCfg.xtype = 'textarea';
		fieldCfg.height = 100;
	}
	if (s.type == 'checkbox') {
		fieldCfg.xtype = 'checkbox';
		fieldCfg.boxLabel = FR.T(s.title);
		fieldCfg.hideLabel = true;
		if (s.v == '1') {
			fieldCfg.checked = true;
		}
	} else {
		fieldCfg.width = 270;
		fieldCfg.fieldLabel = FR.T(s.title);
	}
	if (s.helpText) {
		fieldCfg.helpText = s.helpText;
	}
	settingFields.push(fieldCfg);
	if (s.comment) {
		settingFields.push({xtype: 'displayfield', value: s.comment});
	}
});
if (settingFields.length > 0) {
	items.push({
		xtype: 'fieldset',
		title: FR.T('Plugin settings'),
		width: 500, labelWidth: 180,
		items: settingFields
	});
}
var formPanel = new FR.components.editForm({
	title: FR.T('Edit plugin: %1').replace('%1', FR.pluginInfo.JSconfig.title),
	layout: 'form', bodyStyle: 'padding:10px;', autoScroll: true,
	items: items,
	tbar: [
		{
			text: FR.T('Save changes'),
			cls: 'fr-btn-primary',
			ref: 'saveBtn',
			handler: function() {
				var editForm = this.ownerCt.ownerCt;
				var params = editForm.form.getFieldValues();
				var opts = {
					url: FR.URLRoot+'/?module=cpanel&section=settings&page=default&action=save',
					maskText: 'Saving changes...',
					params: params
				};
				editForm.submitForm(opts);
			}
		}
	]
});
Ext.getCmp('gridTabPanel').add(formPanel);
formPanel.show();