var html = '';

if (licenseInfo.key) {
	html += '<p>' + FR.T('License key in use: <b>%1</b>').replace('%1', licenseInfo.key) + '</p><br>';
	html += '<p>' + FR.T('You are using <b>%1 user accounts</b> out of <b>%2</b>.').replace('%1', licenseInfo.users.current).replace('%2', licenseInfo.users.maximum) + '</p><br>';
	if (licenseInfo.expiry) {
		html += '<p>' + FR.T('The license will expire on <b>%1</b>.').replace('%1', licenseInfo.expiry).replace('%2', licenseInfo.users.maximum) + '</p>';
	}
} else {
	html += '<p>' + FR.T('You are using <b>%1 user accounts</b> out of <b>%2</b>.').replace('%1', licenseInfo.users.current).replace('%2', licenseInfo.users.maximum) + '</p><br>';
	html += '<p>' + FR.T('Click the above button to register your FileRun copy.') + '</p>';
}

FR.licensing = {
	promptForEmail: function() {
		new Ext.ux.prompt({text: FR.T('<p>Please type your e-mail address.</p><p>It will be kept safe and you will not receive any unwanted messages.</p> <p>It is needed for receiving a private license key which will give you access to the software update server.</p>'), defaultValue: userEmail, confirmHandler: function(emailAddress, d, prompt) {
			FR.licensing.panel.bwrap.mask(FR.T('Please wait...'));
			Ext.Ajax.request({
				url: FR.URLRoot + '/?module=cpanel&section=settings&page=license&action=request',
				params: {
					emailAddress: emailAddress
				},
				callback: function () {
					if (FR.licensing.panel) {
						FR.licensing.panel.bwrap.unmask();
					}
				},
				success: function (req) {
					try {
						var rs = Ext.util.JSON.decode(req.responseText);
					} catch (er) {return false;}
					if (rs.success) {
						if (rs.msg) {
							new Ext.ux.prompt({text: rs.msg, callback: function() {
								FR.licensing.promptForKey();
							}});
						} else {
							FR.licensing.promptForKey();
						}
					} else {
						if (rs.msg) {
							new Ext.ux.prompt({
								text: rs.msg, callback: function () {
									FR.licensing.promptForEmail();
								}
							});
						}
					}
				},
				failure: function (f, a) {
					new Ext.ux.prompt({text: f.responseText, callback: function() {
						FR.licensing.promptForEmail();
					}});
				},
				scope: this
			});
			prompt.close();
		}, scope: this});
	},
	promptForKey: function(msg) {
		new Ext.ux.prompt({
			text: FR.T('Please paste here the received license key')+':',
			defaultValue: '',
			confirmHandler: function(lkey, d, prompt) {
				FR.licensing.panel.bwrap.mask(FR.T('Please wait...'));
				Ext.Ajax.request({
					url: FR.URLRoot + '/?module=cpanel&section=settings&page=license&action=applyKey',
					params: {key: lkey},
					callback: function () {
						if (FR.licensing.panel) {FR.licensing.panel.bwrap.unmask();}
					},
					success: function (req) {
						try {
							var rs = Ext.util.JSON.decode(req.responseText);
						} catch (er) {return false;}
						if (rs.success) {
							if (rs.msg) {FR.feedback(rs.msg);}
							Ext.getCmp('appTab').removeAll(true);
							FR.tempPanel.load({
								url: FR.URLRoot + '/?module=cpanel&section=settings&page=license',
								scripts: true
							});
						} else {
							if (rs.msg) {
								new Ext.ux.prompt({text: rs.msg, callback: function() {
									FR.licensing.promptForKey();
								}});
							}
						}
					},
					failure: function (f, a) {
						new Ext.ux.prompt({text: f.responseText, callback: function() {
							FR.licensing.promptForKey();
						}});
					},
					scope: this
				});
			}
		});
	}
};

FR.licensing.panel = new Ext.Panel({
	title: FR.T('Software licensing'), layout:'fit', border: false,
	bodyStyle: 'padding:15px;',  cls: 'FREditForm',
	html: html,
	tbar: [
		{
			text: FR.T(licenseInfo.key ? 'Update' : 'Register'),
			cls: 'fr-btn-primary',
			iconCls: 'fa fa-fw fa-refresh color-white',
			handler: function() {
				if (!licenseInfo.key) {
					FR.licensing.promptForEmail();
				} else {
					FR.licensing.panel.bwrap.mask(FR.T('Please wait...'));
					Ext.Ajax.request({
						url: FR.URLRoot + '/?module=cpanel&section=settings&page=license&action=update',
						callback: function () {
							if (FR.licensing.panel) {
								FR.licensing.panel.bwrap.unmask();
							}
						},
						success: function (req) {
							try {
								var rs = Ext.util.JSON.decode(req.responseText);
							} catch (er) {
								return false;
							}
							if (rs.msg) {
								FR.feedback(rs.msg);
								Ext.getCmp('appTab').removeAll(true);
								FR.tempPanel.load({
									url: FR.URLRoot + '/?module=cpanel&section=settings&page=license',
									scripts: true
								});
							}
						},
						failure: function (f, a) {
							FR.feedback(f.responseText);
						},
						scope: this
					});
				}
			}
		}
	]
});
Ext.getCmp('appTab').add(FR.licensing.panel);
Ext.getCmp('appTab').doLayout();