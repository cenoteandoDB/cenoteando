FR.customActions.pdf_split = {
	run: function() {
		this.prompt = new Ext.Window({
			title: '<?php echo \S::safeJS($this->JSconfig['title']);?>',
			layout : 'fit', width: 380, height: 210,
			closable: false, closeAction: 'hide', resizable: false,
			items: {
				xtype: 'form', labelWidth: 120, bodyStyle:'padding-top:10px',
				labelAlign: 'right',
				items: [
					{
						xtype: 'textfield',
						name: 'pages', width: 180,
						fieldLabel: '<?php echo \S::safeJS(self::t("Pages to extract"));?>',
						helpText: FR.T('It can be a range of pages (<b>1-5</b> or <b>5-1</b>), or a list of separate pages (<b>1</b>,<b>2</b>,<b>3</b>), or any combination of ranges and separate pages (<b>1</b>, <b>5-10</b>).')
					},
					{
						xtype: 'checkbox',
						name: 'split',
						checked: true, inputValue: '1',
						fieldLabel: '',
						boxLabel: '<?php echo \S::safeJS(self::t("Each page in a separate file"));?>'
					}
				]
			},
			buttonAlign: 'left',
			buttons: [{
				text : FR.T('Ok'), cls: 'fr-btn-primary',
				handler: function() {this.doAction();}, scope: this
			}, {
				text : FR.T('Cancel'), style: 'margin-left:15px',
				handler : function() {this.prompt.hide();}, scope: this
			}]
		});
		this.prompt.show();
	},
	doAction: function() {
		FR.actions.processGridItemsByPaths({
			url: '/?module=custom_actions&action=pdf_split&method=split',
			params: this.prompt.items.first().getForm().getValues()
		});
		this.prompt.hide();
	}
}