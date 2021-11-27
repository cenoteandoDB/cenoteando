Ext.namespace('Ext.ux.form');
Ext.ux.form.AutoCompleteField = Ext.extend(Ext.form.ComboBox, {
	valueField: 'v', displayField: 'd', mode: 'remote', minChars: 3,
	hideTrigger: true,
	initComponent: function() {
		this.store = new Ext.data.JsonStore({
			baseParams: {metadataFieldId: this.metadataFieldId},
			autoDestroy: true,
			url: URLRoot+'/?module=metadata&section=ajax&page=autocomplete',
			root: 'values',
			fields: ['v', 'd']
		});
		Ext.ux.form.AutoCompleteField.superclass.initComponent.apply(this, arguments);
	}
});
Ext.reg('autocompletefield', Ext.ux.form.AutoCompleteField);