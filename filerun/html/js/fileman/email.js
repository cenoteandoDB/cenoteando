Ext.onReady(function() {
	var addressHistory = [];
	FR.addressHistoryStoreData = [];
	var histCookie = Ext.util.Cookies.get("historyAddresses");
	if (histCookie != null) {
		addressHistory = Ext.util.JSON.decode(histCookie);
		var t = [];
		Ext.each(addressHistory, function(item) {if (item.length > 3){t.push([item]);}});
		FR.addressHistoryStoreData = t;
	}

	FR.update = function() {
		var html = '';
		FR.sendWebLinks = window.parent.FR.sendingByEmail.sendLinks;
		FR.filePaths = [];
		var count = window.parent.FR.sendingByEmail.items.length;
		Ext.each(window.parent.FR.sendingByEmail.items, function(item) {
			html += '<div style="white-space:nowrap;clear:both;">';
			if (item.isFolder) {
				FR.sendWebLinks = true;
				html += '<i class="fa fa-folder" style="font-size: 18px;color:#8F8F8F"></i><span style="margin-left:3px;">'+item.filename+'</span>';
			} else {
				html += '<div style="float:left;max-width:220px;overflow:hidden;text-overflow: ellipsis;margin-top:1px;font-size:11px"><img src="'+window.parent.FR.UI.getFileIconURL(item.icon)+'" align="top" style="margin-right:3px;" width="16" height="16" border="0"> '+item.filename+'</div>';
				html += '<div style="float:right;color:gray;margin-left:5px;font-size:11px">'+Ext.util.Format.fileSize(item.filesize)+'</div>';
			}
			if (FR.WebLinksForLargerFiles) {
				if (item.filesize > FR.WebLinksForLargerFiles) {
					FR.sendWebLinks = true;
				}
			}
			html += '</div>';
			FR.filePaths.push(item.path);
		});
		Ext.get('attachments').update(html);
		if (!window.parent.User.perms.weblink) {FR.sendWebLinks = false;}
		FR.UI.form.send_weblinks.setValue(FR.sendWebLinks);
		if (FR.sendWebLinks) {
			FR.UI.form.messageField.setHeight(90);
		} else {
			FR.UI.form.messageField.setHeight(130);
		}
		var subject = FR.T('%1 sent you %2 files').replace('%1', FR.fromName).replace('%2', count);
		if (count == 1) {
			subject = FR.T('%1 sent you a file').replace('%1', FR.fromName);
		}
		Ext.getCmp('subject').setValue(subject);
	};


	FR.UI.form = new Ext.FormPanel({
		border: false,
		defaultType: 'textfield', autoScroll: true,
		labelAlign: 'right', labelWidth: 90,
		bodyStyle: 'padding-bottom:15px;',
		defaults: {width: 300, labelStyle: 'white-space:nowrap'},
		items: [
			{xtype: 'hidden', name: 'csrf', value: FR.csrf_token},
			{fieldLabel: FR.T('From'), name: 'from', minLength: 5, value: FR.defaultFrom, allowBlank: false, readOnly: !FR.usersCanEditAddress, width: 180},
			{fieldLabel: FR.T('To'), xtype: 'FRRecipientField', id: 'toField', name: 'to', targetFieldName: 'toField'},
			{fieldLabel: FR.T('BCC'), xtype: 'FRRecipientField', id: 'bccField', name: 'bcc', targetFieldName: 'bccField'},
			{fieldLabel: FR.T('Subject'), name: 'subject', id: 'subject', allowBlank: false},
			{fieldLabel: FR.T('Message'), xtype: 'textarea', ref: 'messageField', height: 90, id: 'msg', emptyText: FR.T('Optional: include a personal message...'), submitValue: false},
			{fieldLabel: FR.T('Attachments'), xtype: "field", value: '', autoCreate: {tag: 'div', children: [
				{tag: 'div', id: 'attachments', 'class': 'x-form-text', style:'overflow:auto;height:52px;', html: 'Loading...'}
			]}},
			{
				boxLabel: FR.T('Send WebLinks instead of attaching the files.'),
				xtype: 'checkbox', name: 'weblinks', ref: 'send_weblinks', value: '1',
				hidden: !(window.parent.User.perms.weblink && window.parent.User.perms.download),
				listeners: {
					'check': function(f, checked) {this.ownerCt.set_weblinks.setVisible(checked);}
				}
			},
			{
				boxLabel: FR.T('Overwrite existing link settings.'), hidden: true, ref: 'set_weblinks',
				xtype: 'checkbox', name: 'set_weblinks', id: 'set_weblinks', value: '1',
				listeners: {
					'check': function() {FR.clickWebLinkOption(this)}
				}
			}
		]
    });

	var labelWidth = 90, fieldWidth = 160, popupWidth = 330;
	if (['german', 'dutch', 'finnish', 'turkish'].indexOf(FR.language) != -1) {
		labelWidth = 150;
		popupWidth = 370
	} else if (['french', 'spanish', 'danish'].indexOf(FR.language) != -1) {
		labelWidth = 140;
		popupWidth = 370
	} else if (['romanian', 'russian', 'swedish', 'basque', 'brazilian portuguese', 'brazilian_portuguese'].indexOf(FR.language) != -1) {
		labelWidth = 110;
	}

	FR.UI.webLinksForm = new Ext.FormPanel({
		border: false,
		defaultType: 'textfield',
		labelAlign: 'right', labelWidth: labelWidth,

		defaults:{labelStyle: 'white-space:nowrap'},
		items: [
			{fieldLabel: FR.T('Expiration date', 2), name: 'wl_expiry', xtype: 'datefield', id: 'wl_expiry', minValue: new Date(), value: '', width: fieldWidth},
			{fieldLabel: FR.T('Download limit', 2), name: 'wl_download_limit', width: 50, id: 'wl_download_limit'},
			{fieldLabel: FR.T('Set a password', 2), name: 'el_password', id: 'wl_password', value: '', width: fieldWidth,
				selectOnFocus: true,
				listeners: {
					'focus': function() {
						if (this.getRawValue().length == 0) {
							this.setValue(randomPass(12, true, true, true, true, 2));
							this.getEl().dom.select();
						}
					}
				}
			},
			{
				boxLabel: FR.T('Receive e-mail notifications.'),
				xtype: 'checkbox', name: 'wl_notify', id: 'wl_notify', value: '1', hideLabel: true
			}
		]
    });
	
	FR.clickWebLinkOption = function(checkbox) {
		if (!checkbox.checked) {return false;}
		if (!FR.webLinksOptWin) {
			FR.webLinksOptWin = new Ext.Window({
				title: FR.T('Web Link Options'), width: popupWidth, height: 225, resizable: false, draggable: false,
				modal: true, closeAction: 'hide', closable: false, items: FR.UI.webLinksForm, layout: 'fit', buttonAlign: 'left',
				buttons: [
					{
						text: FR.T('Done'), cls: 'fr-btn-primary fr-btn-smaller',
						handler: function(){FR.webLinksOptWin.hide();}
					}
				]
			});
		}
		FR.webLinksOptWin.show();
	};

	new Ext.Viewport({
		layout: 'border', border: false,
		items: [
			{
				region: 'center', layout: 'fit', border: false,
				items: [FR.UI.form], buttonAlign: 'left',
				buttons: [
					{
						cls: 'fr-btn-primary',
						text: FR.T("Send"),
						handler: function() {
							var params = {
								'filePaths[]': FR.filePaths,
								wl_expiry: Ext.getCmp('wl_expiry').getRawValue(),
								wl_download_limit: Ext.getCmp('wl_download_limit').getValue(),
								wl_password: Ext.getCmp('wl_password').getValue(),
								wl_notify: (Ext.getCmp('wl_notify').getValue() ? 1 : 0),
								message: Ext.getCmp('msg').getValue()
							};
							FR.UI.form.getForm().submit({
								waitTitle: FR.T('Please wait'),
								waitMsg: FR.T('Sending e-mail...'),
								clientValidation: true,
								url: URLRoot+'/?module=email&section=ajax&page=send',
								timeout: 18000,
								params: params,
								success: function(form, action) {
									if (action.result) {
										new Ext.ux.prompt({text: action.result.msg, callback: function() {FR.UI.form.getForm().reset();window.parent.FR.UI.popups.emailFiles.hide();}});

										var recipients = Ext.getCmp('toField').getValue().split(',');
										Ext.each(recipients, function(item) {
											item = Ext.util.Format.trim(item);
											if (addressHistory.indexOf(item) == -1) {addressHistory.push(item);}
										});
										var expiry = new Date();
										expiry.setTime(expiry.getTime()+(90*24*60*60));
										Ext.util.Cookies.set("historyAddresses", Ext.util.JSON.encode(addressHistory), expiry);
									} else {
										new Ext.ux.prompt({text: FR.T('Invalid server reply')});
									}
								},
								failure: function(form, action) {
									if (action.failureType == Ext.form.Action.CLIENT_INVALID) {
										new Ext.ux.prompt({text: FR.T("Please make the appropriate <br>changes to the highlighted fields.")});
									} else if (action.failureType == Ext.form.Action.CONNECT_FAILURE) {
										new Ext.ux.prompt({text: FR.T("Ajax communication failed.")});
									} else if (action.failureType == Ext.form.Action.SERVER_INVALID) {
										if (action.result.msg) {
											new Ext.ux.prompt({text: action.result.msg});
										} else {
											new Ext.ux.prompt({text: FR.T('Unexpected reply from this application\'s server')});
										}
									}
								}
							});
						}
					}
				]
			}
		]
	});
	
	window.parent.Ext.get(window.parent.FR.UI.popups.emailFiles.getLayout().container.body.dom).unmask();
	FR.update();
});

FR.recipientField = Ext.extend(Ext.form.ComboBox, {
	emptyText: FR.T('Separate recipients by ,'),
	typeAhead: true,
	displayField: 'addr',
	mode: 'local',
	triggerClass: 'fa fa-user-plus',
	initComponent:function() {
		Ext.apply(this, {
			store: new Ext.data.ArrayStore({
				fields: ['addr'],
				data: FR.addressHistoryStoreData,
				sortInfo: {field: 'addr', direction: 'DESC'}
			}),
			onTriggerClick: function(e, btn) {
				if (!FR.chooser) {FR.chooser = new UserChooser();}
				var field = Ext.getCmp(this.targetFieldName);
				FR.chooser.show(btn, function(data) {
					var s = field.getValue();
					if (data.users) {
						Ext.each(data.users, function(user) {
							s += s.length > 0 ? ', ' : '';
							s += user.name;
						});
					}
					if (data.groups) {
						Ext.each(data.groups, function(group) {
							s += s.length > 0 ? ', ' : '';
							s += '['+group.name+']';
						});
					}
					field.setValue(s);
				});
				FR.chooser.clearChecked();
				FR.recipientField.superclass.initComponent.call(this, arguments);
			}
		});
	}
});

Ext.reg('FRRecipientField', FR.recipientField);