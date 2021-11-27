Ext.onReady(function() {
	var login = new Ext.FormPanel({
		url: PostURL, method: 'POST', standardSubmit: true,
		hideLabels: true, autoHeight: true,
		bodyStyle: 'padding-top:15px;padding-bottom:15px;',
		items:[
			{xtype: 'component', html: '<input type="text" name="user" value="'+formUsername+'" hidefocus="true" tabindex="-1" style="position:absolute;z-index:-100;width:1px;height:1px;top:-100px;" />'},
			{xtype: 'displayfield', value: formTitle, style: 'color:gray;font-size:16px;'},
			{
				xtype: 'textfield', id: 'passField', name: 'pass', inputType: 'password',
				width: 300, tabIndex: 1, style: 'font-size:16px;text-align:center', height:30
			},
			{xtype: 'component', html: '<input type="submit" hidefocus="true" tabindex="-1" style="position:absolute;z-index:-100;width:1px;height:1px;top:-100px;" />'}
		]
	});
	new Ext.Window({
		layout: 'fit', cls:'login'+(transparent?' transparent':''),
		width: 350, autoHeight: true,
		closable: false, resizable: false, draggable: false,
		items: login,
		buttons: [{
			text: submitLabel,
			formBind: true,	cls: 'fr-btn-primary',
			handler:function(){login.getForm().el.dom.submit();}
		}],
		listeners: {'show': function() {
			Ext.getCmp('passField').focus(false, 100);
		}}
	}).show().anchorTo(Ext.getBody(), 'c-c');
});