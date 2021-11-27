Ext.namespace('Ext.ux.form');
Ext.ux.form.TagsField = Ext.extend(Ext.ux.form.SuperBoxSelect, {
	name: 'tags', metadataFieldId: 'tags',
	pinList: false, multiSelectMode: false,
	removeValuesFromStore: false, supressClearValueRemoveEvents: true,
	preventMultipleRemoveEvents: true, caseSensitive: false,
	valueField: 'v', displayField: 'd', mode: 'remote', minChars: 3,
	initComponent: function() {
		if (this.mode == 'remote') {
			this.store = new Ext.data.JsonStore({
				baseParams: {metadataFieldId: this.metadataFieldId},
				autoDestroy: true,
				url: URLRoot + '/?module=metadata&section=ajax&page=autocomplete',
				root: 'values',
				fields: ['v', 'd']
			});
		} else {
			this.store = new Ext.data.SimpleStore({
				fields: ['v', 'd'],
				data: []
			});
		}
		Ext.apply(this, {
			listeners : {
				'afterrender': function () {
					if (this.initialConfig.storeData) {
						this.setValueEx(this.initialConfig.storeData);
					}
				}
			}
		});
		Ext.ux.form.TagsField.superclass.initComponent.apply(this, arguments);
	}
});
Ext.reg('tagsfield', Ext.ux.form.TagsField);