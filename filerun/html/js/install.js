FR = {
	step: 0, adminPass: false,
	T: function(s) {return s;}
};
Ext.onReady(function() {
	FR.win = new Ext.Window({
		title: '<img src="images/icons/filerun.png" style="height:25px;vertical-align: bottom;"><span style="color:#9B9999"> FileRun - Installation</span>',
		width: 410, buttonAlign: 'right',
		height: 310,
		closable: false, draggable: false,
		layout: 'card', activeItem: 0,
		items: [
			{
				bodyStyle: 'padding:20px 0',
				html: '<span style="font-size:16px;font-weight:bold">Welcome to '+appName+'!</span>' +
				'<br><br>' +
				'This wizard will help you install the app with just a few clicks.' +
				'<br><br>' +
				'For in-depth information, please check the <a href="https://docs.filerun.com/filerun_install_guide" target="_blank">installation guide</a>.' +
				'<br><br>' +
				'✅ By using FileRun you are accepting the <a href="https://f.afian.se/wl/?id=zROVSIj1b5jlXxSx25oCuIExDZXZsPi0" target="_blank">license agreement</a>.'
			},
			{
				id: 'reqPanel', bodyStyle: 'padding: 10px', autoScroll: true,
				html: ''
			},
			{
				xtype: 'form', id:'mysqlFrm', bodyStyle: 'padding: 10px', labelAlign: 'right', autoScroll: true, labelWidth: 120,
				items: [
					{xtype: 'displayfield', hideLabel: true, value: '<span style="font-size:16px;font-weight:bold">Database setup</span><br><br>Please type in your MySQL server connection information:'},
					{xtype: 'displayfield', height: 20},
					{
						xtype: 'compositefield',
						items: [
							{xtype: 'textfield', name:'host', width: 145, value: 'localhost', fieldLabel: 'MySQL hostname'},
							{xtype: 'textfield', name:'port', width: 50, value: '3306'}
						]
					},
					{xtype: 'textfield', name:'dbname', width: 200, value: '', fieldLabel: 'Database name'},
					{xtype: 'textfield', name:'user', width: 200, value: '', fieldLabel: 'MySQL user'},
					{xtype: 'textfield', name:'pass', width: 200, value: '', fieldLabel: 'Password'},
					{xtype: 'checkbox', name:'dropExisting', value: '1', width: 200, boxLabel: 'Destroy any data that might be in the existing database'},
					{xtype: 'displayfield', height: 20},
					{xtype: 'displayfield', hideLabel: true, value: 'The database will be automatically created if it doesn\'t exist.<br>The table names are prefixed with "df_".'}
				]
			},
			{
				id: 'successPanel', bodyStyle: 'padding: 10px', html: ''
			}
		],
		buttons: [
			{
				id: 'backBtn',
				text: 'Back',
				style: 'margin-right:10px',
				hidden: true,
				handler: function() {
					if (FR.step == 1) {
						FR.step = 0;
						FR.win.setSize(410, 310).anchorTo(Ext.get('theBODY'), 'c-c');
					} else if (FR.step == 2) {
						FR.step = 1;
						FR.win.setSize(600, 440).anchorTo(Ext.get('theBODY'), 'c-c');
					} else if (FR.step == 3) {
						FR.step = 3;
					}
					FR.win.getLayout().setActiveItem(FR.step);
					if (FR.step == 0) {
						this.hide();
					}
				}
			},
			{
				text: 'Next',
				cls: 'fr-btn-primary',
				handler: function(){
					if (FR.step == 0) {
						FR.checkRequirements();
					} else if (FR.step == 1) {
						FR.win.setSize(430, 460).anchorTo(Ext.get('theBODY'), 'c-c');
						FR.win.getLayout().setActiveItem(2);
						FR.step = 2;
					} else if (FR.step == 2) {
						FR.dbSetup();
					} else if (FR.step == 3) {
						document.location.href = URLRoot+'/?username=superuser';
					}
				}
			}
		]
	});
	FR.checkRequirements = function() {
		Ext.get(FR.win.body).mask('Checking server requirements...');
		Ext.Ajax.request({
			url: URLRoot+'/?module=install&page=requirements',
			callback: function(opt, success, resp) {
				FR.step = 1;
				Ext.getCmp('backBtn').show();
				Ext.get(FR.win.body).unmask();
				FR.win.setSize(600, 440).anchorTo(Ext.get('theBODY'), 'c-c');
				FR.win.getLayout().setActiveItem(1);
				Ext.getCmp('reqPanel').update(resp.responseText);
			}, scope: this
		});
	};
	FR.dbSetup = function() {
		Ext.get(FR.win.body).mask('Setting up database...');
		Ext.Ajax.request({
			url: URLRoot+'/?module=install&page=mysql_setup',
			params: Ext.getCmp('mysqlFrm').getForm().getValues(),
			callback: function() {
				Ext.get(FR.win.body).unmask();
			},
			success: function(resp) {
				try {
					var rs = Ext.util.JSON.decode(resp.responseText);
				} catch (er) {
					if (confirm('Unexpected server reply. Press "OK" to display it.')) {
						document.write(resp.responseText);
					}
				}
				if (rs.success) {
					FR.step = 3;
					FR.win.setSize(440, 420).anchorTo(Ext.get('theBODY'), 'c-c');
					FR.adminPass = rs.adminPass;
					Ext.getCmp('successPanel').update(
						'<span style="font-size:20px;font-weight:bold">All done!</span>' +
						'<br><br>' +
						''+appName+' installed successfully!' +
						'<br><br>' +
						'The default user account was created:' +
						'<br><br>' +
						'Your username is <div style="display:inline-block;border:1px solid whitesmoke;padding:3px;font-weight:bold">superuser</div>' +
						'<div style="height:1px"></div>' +
						'Your password is <div style="display:inline-block;border:1px solid whitesmoke;padding:3px;font-weight:bold">'+rs.adminPass+'</div>' +
						'<br><br>' +
						'<span style="color:red;font-weight:bold;">It is important that you make a note of the above password!</span>'+
						'<br><br>' +
						'After signing in, set a home folder for your account by editing its permissions from the FileRun control panel.<br><br>Click "Next" to close this wizard and open the login page.'
					);
					FR.win.getLayout().setActiveItem(3);
					Ext.getCmp('backBtn').hide();
				} else if (rs.success == false) {
					new Ext.ux.prompt({
						text: '<div style="max-height:200px;overflow:auto;">'+rs.msg+'</div>'
					});
				}
			},
			failure: function(frm, act) {document.write(resp.responseText);}, scope: this
		});
	};
	FR.win.show().anchorTo(Ext.getBody(), 'c-c');
});