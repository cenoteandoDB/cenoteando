Ext.onReady(function() {
	Ext.QuickTips.init();
	var fieldWidth = 170;
	var labelWidth = 110;

	if (['german', 'dutch', 'finnish', 'turkish', 'italian'].indexOf(FR.language) != -1) {
		labelWidth = 180;
	} else if (['french', 'spanish', 'danish'].indexOf(FR.language) != -1) {
		labelWidth = 160;
	}
	FR.viewSettings = {};


	var tabs = [];

	tabs.push(
		{
	title: FR.T('Options'),
	autoScroll: true,
	bodyStyle:'padding:15px 0px 0px 15px',
	items: [{
		layout: 'form',
		defaults: {xtype: 'checkbox', value: '1', hideLabel: true},
		items: [
			{name: 'allow_downloads', id: 'allow_downloads'},
			{name: 'allow_editing', id: 'allow_editing'},
			{name: 'allow_uploads', id: 'allow_uploads'},
			{
				boxLabel: FR.T('Receive e-mail notifications.'),
				name: 'notify', id: 'notify',
				helpText: FR.T('Receive e-mail notifications when visitors upload or download files via this link.')
			},
			{
				boxLabel: FR.T('Share the file comments with the visitors.'),
				name: 'show_comments', id: 'show_comments', hidden: !window.parent.User.perms.read_comments,
				listeners: {
					'check': function(field, checked) {
						Ext.getCmp('show_comments_names_field').setVisible(checked);
					}
				}
			},
			{
				xtype: 'compositefield', height: 20,
				hidden: !window.parent.User.perms.read_comments,
				id: 'show_comments_names_field',
				items: [
					{width: 20, height: 20},
					{
						boxLabel: FR.T('Display users names.'), hideLabel: true,
						xtype: 'checkbox', value: '1', name: 'show_comments_names', id: 'show_comments_names'
					}
				]
			},
			{
				boxLabel: FR.T('Share the metadata with the visitors.'),
				name: 'show_metadata', id: 'show_metadata', hidden: !window.parent.User.perms.metadata
			}
		]
	}]
	});

	tabs.push({
		title: FR.T('Restrictions'),
		autoScroll: true,
		bodyStyle:'padding:15px 15px 18px 15px',
		items: [
			{
				layout: 'form', labelAlign: 'right', labelWidth: labelWidth,
				items: [
					{
						xtype: 'datefield', fieldLabel: FR.T('Expiration date'), width: fieldWidth,
						name: 'expiry', id: 'expiry', minValue: new Date(),
						helpText: FR.T('The link will stop working at the end of this specified day.')
					},
					{
						xtype: 'numberfield',
						fieldLabel: FR.T('Download limit'),
						name: 'download_limit', id: 'download_limit',
						width: 50,
						allowDecimals: false, allowNegative: false, autoStripChars: true,
						helpText: FR.T('Specify a number of downloads after which the link will stop working.')
					},
					{
						xtype: 'textfield', fieldLabel: FR.T('Set a password'),
						name: 'password', id: 'password',
						selectOnFocus: true, width: fieldWidth,
						listeners: {
							'focus': function () {
								if (this.getRawValue().length == 0) {
									this.setValue(randomPass(12, true, true, true, true, 2));
									this.getEl().dom.select();
								}
							}
						}
					},
					{
						boxLabel: FR.T('Require visitors to be signed in.'),
						xtype: 'checkbox',
						name: 'require_login',
						id: 'require_login',
						value: '1',
						helpText: FR.T('Only registered users will be able to access this link.')
					}
				]
			}
		]
	});

	tabs.push({
		title: FR.T('Download Terms'),
		bodyStyle:'padding:15px',
		autoScroll: true,
		items: [
			{
			xtype: 'displayfield',
			value: FR.T('Force the visitors to accept your written terms before being able to download files.')
			},
			{xtype: 'htmleditor', hideLabel: true, id: 'dterms', enableFont: false, height:82, width: '99%'}

		]
	});

	FR.UI.form = new Ext.FormPanel({
		layout: 'fit',
		items: [
			{
				xtype: 'tabpanel', ref: 'tabPanel',
				activeTab: 0, deferredRender: false,
				buttonAlign: 'center',
				items: tabs,
				buttons: [
					{
						id: 'saveBtn', width: 'auto',
						text: FR.T('Save changes'), cls: 'fr-btn-primary fr-btn-smaller', style:'margin-right:5px;',
						handler: function(){FR.SaveChanges();}
					},
					{
						cls: 'fr-btn-smaller', width: 'auto',
						text: FR.T('Cancel'),
						handler: function(){
							FR.UI.form.tabPanel.setActiveTab(0);
							Ext.getCmp('cardPanel').getLayout().setActiveItem(0);
						}
					}
				]
			}

		]
    });

	var linklabel = '&nbsp;';
	if (window.parent.FR.WebLinking.isFileRequest) {
		linklabel = 'Give this link to people you’re requesting files from';
	}
	FR.linkTypeStore = new Ext.data.SimpleStore({fields: ['val', 'label'], data: [
		['preview', FR.T('With preview')],
		['open', FR.T('Open in browser')],
		['download', FR.T('Force download')]
	]});
	FR.linkTypeFolderStore = new Ext.data.SimpleStore({fields: ['val', 'label'], data: [
		['grid', FR.T('Grid view')],
		['list', FR.T('List view')],
		['gallery', FR.T('Image gallery')],
		['playlist', FR.T('Audio playlist')],
		['rss', FR.T('RSS feed')]
	]});
	FR.viewport = new Ext.Viewport({
		activeItem: 0, id: 'cardPanel', layout: 'card',
		items: [
			{
				layout: 'anchor',
				bodyStyle: 'padding-top:20px;',
				items: [
					{
						xtype: 'component',
						autoEl: {html: '<div class="x-form-item" id="linkLabel">'+FR.T(linklabel)+':</div>'}
					},
					{
						xtype: 'textfield',
						id: 'LinkURLField', anchor:'100%',
						height: 40,
						selectOnFocus: true, readOnly: true,
						listeners: {
							'focus': function() {
								this.getEl().dom.select();
							}
						}
					},
					{
						xtype: 'toolbar', style: 'margin-top:5px;',
						items: [
				{
					id: 'linkTypeOptFile',
					xtype: 'combo', width: 130,
					mode: 'local', editable: false,
					displayField: 'label', valueField: 'val', value: 'preview',
					triggerAction: 'all', disableKeyFilter: true,
					store: FR.linkTypeStore,
					listeners: {
						'select': function(combo, sel) {
							FR.viewSettings.linkTypeOptFile = sel.data.val;
							FR.changeViewSettings();
							var allowsEditing = Ext.getCmp('allow_editing').getValue();
							if (sel.data.val == 'edit' && allowsEditing != 1) {
								new Ext.ux.prompt({
									text: FR.T('The current settings of this link do not allow editing. Would you like to enable editing now?'),
									confirmHandler: function () {
										Ext.getCmp('allow_editing').setValue(true);
										FR.SaveChanges();
									},
									scope: this
								});
							}
							var allowsDownload = Ext.getCmp('allow_downloads').getValue();
							if ((sel.data.val == 'open' || sel.data.val == 'download') && allowsDownload != 1) {
								new Ext.ux.prompt({
									text: FR.T('The current settings of this link do not allow downloading. Would you like to enable downloading now?'),
									confirmHandler: function () {
										Ext.getCmp('allow_downloads').setValue(true);
										FR.SaveChanges();
									},
									scope: this
								});
							}
						}
					}
				},
							{
					id: 'linkTypeOpt',
					xtype: 'combo', width: 130,
					mode: 'local', editable: false,
					displayField: 'label', valueField: 'val', value: FR.defaultMode,
					triggerAction: 'all', disableKeyFilter: true,
					store: FR.linkTypeFolderStore,
					listeners: {
						'select': function(combo, sel) {
							FR.viewSettings.linkTypeOpt = sel.data.val;
							FR.changeViewSettings();
						}
					}
				},
				'->',
				{
					id: 'shortLinkToggle',
					iconCls: 'fa fa-scissors gray',
					cls: 'fr-btn-smaller',
					text: FR.T('Shorten'),
					enableToggle: true,
					toggleHandler: function (item, pressed) {
						if (pressed) {
							if (!FR.WebLinkInfo.short_url) {
								FR.getShort();
							} else {
								Ext.getCmp('LinkURLField').setValue(FR.WebLinkInfo.short_url);
							}
						} else {
							Ext.getCmp('LinkURLField').setValue(FR.WebLinkInfo.url);
						}
						Ext.getCmp('LinkURLField').getEl().highlight("dc143c", {
							attr: 'border-color',
							easing: 'easeIn',
							endColor: 'C1C1C1',
							duration: 1
						});
					}
				},
				{
					text: FR.T('Copy'),
					iconCls: 'fa fa-fw fa-clipboard gray',
					cls: 'fr-btn-smaller',
					handler: function(){FR.copyToClipboard();}
				},
				{
					text: FR.T('Open'),
					id: 'openBtn',
					iconCls: 'fa fa-fw fa-external-link gray',
					cls: 'fr-btn-smaller',
					handler: function(){
						window.open(Ext.getCmp('LinkURLField').getValue());
					}
				}
						]
					}
				],
				tbar: [
					{
						iconCls: 'fa fa-cog',
						cls: 'fr-btn-default fr-btn-smaller',
						text: FR.T('Advanced'),
						handler: function() {
							Ext.getCmp('cardPanel').getLayout().setActiveItem(1);
						}
					},
					'->',
					{
						id: 'removeBtn',
						text: FR.T('Remove link'), iconCls: 'fa fa-remove icon-red',
						handler: function() {
							var url = URLRoot+'/?module=weblinks&section=ajax&page=remove';
							FR.loadMask.show();
							Ext.Ajax.request({
								url: url, method: 'post',
								params: {
									path: window.parent.FR.WebLinking.path
								},
								success: function(req){
									FR.loadMask.hide();
									try {
										var rs = Ext.util.JSON.decode(req.responseText);
									} catch (er){return false;}
									if (rs.success) {
										window.parent.FR.utils.applyFileUpdates(window.parent.FR.WebLinking.path, {weblink: 0});
										window.parent.FR.UI.popups.webLink.hide();
										if (rs.msg) {
											window.parent.FR.UI.feedback(rs.msg);
										}
									} else {
										new Ext.ux.prompt({text: rs.msg});
									}
								}
							});
						}
					}
				],
				buttonAlign: 'left',
				buttons: [
					{
						cls: 'fr-btn-primary',
						text: FR.T('Done'),
						handler: function() {
							window.parent.FR.UI.popups.webLink.hide();
						}
					},
					{
						id: 'shareBtn', iconCls: 'fa fa-fw fa-share-alt gray', style: 'margin-left:10px;',
						text: FR.T('Share link'),
						menu: {
							items: [
								{
									text: FR.T('LinkedIn'),
									handler: function() {
										window.open(
											'http://www.linkedin.com/shareArticle?mini=true&url='+encodeURIComponent(Ext.getCmp('LinkURLField').getValue())+'&source='+encodeURIComponent(window.parent.Settings.title),
											Ext.isIE?'_blank':'linkedin-share-dialog',
											'width=570,height=430'
										);
									}
								},
								{
									text: FR.T('Twitter'),
									handler: function() {
										window.open(
											'https://twitter.com/share?text='+encodeURIComponent(Ext.getCmp('LinkURLField').getValue()),
											Ext.isIE?'_blank':'twitter-share-dialog',
											'width=570,height=350'
										);
									}
								},
								{
									text: FR.T('Facebook'),
									handler: function() {
										window.open(
											'https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(Ext.getCmp('LinkURLField').getValue()),
											Ext.isIE?'_blank':'facebook-share-dialog',
											'width=626,height=436'
										);
									}
								},
								{
									text: FR.T('Gmail'), hidden: !FR.userCanEmail,
									handler: function() {
										var url = 'http://mail.google.com/mail/?view=cm&fs=1&ui=1&body=' + encodeURIComponent(Ext.getCmp('LinkURLField').getValue());
										window.open(url, Ext.isIE?'_blank':'gmail-share-dialog','width=626,height=436');
									}
								},
								{xtype: 'menuseparator', hidden: !FR.showQR},
								{
									id: 'QRCBtn', hidden: !FR.showQR,
									text: FR.T('QR Code'), iconCls: 'fa fa-fw fa-qrcode',
									handler: function() {
										FR.showQRCode(Ext.getCmp('LinkURLField').getValue());
									}
								},
								{xtype: 'menuseparator', hidden: !FR.userCanEmail},
								{
									id: 'emailBtn', hidden: !FR.userCanEmail,
									text: FR.useClientEmail ? FR.T('E-mail program') : FR.T('E-mail'),  iconCls: 'fa fa-fw fa-envelope-o',
									handler: function() {
										FR.emailLink();
									}
								}
							]
						}
					}
				]
			},
			FR.UI.form
		]
	});
	FR.SaveChanges = function() {
		FR.loadMask.show();
		FR.UI.form.getForm().submit({
			clientValidation: true,
			url: URLRoot+'/?module=weblinks&section=ajax&page=update',
			params: {
				path: window.parent.FR.WebLinking.path,
				download_terms: Ext.getCmp('dterms').getValue()
			},
			success: function(form, action) {
				FR.loadMask.hide();
				Ext.getCmp('cardPanel').getLayout().setActiveItem(0);
				FR.UI.form.tabPanel.setActiveTab(0);

				var allow_uploads = Ext.getCmp('allow_uploads').getValue();
				var allow_downloads = Ext.getCmp('allow_downloads').getValue();
				Ext.getCmp('linkTypeOpt').setVisible(
					FR.WebLinkInfo.isdir && ((allow_uploads && allow_downloads) || !allow_uploads)
				);

				window.parent.FR.UI.feedback(action.result.msg);
			},
			failure: function(form, action) {
				FR.loadMask.hide();
				switch (action.failureType) {
					case Ext.form.Action.CLIENT_INVALID:
						new Ext.ux.prompt({text: FR.T("Please make the appropriate <br>changes to the highlighted fields.")});break;
					case Ext.form.Action.CONNECT_FAILURE:
						new Ext.ux.prompt({text: FR.T("Ajax communication failed.")});break;
					case Ext.form.Action.SERVER_INVALID:
						new Ext.ux.prompt({text: action.result.msg});
				}
			}
		});
	};
	FR.getInfo = function () {
		window.parent.Ext.get(window.parent.FR.UI.popups.webLink.getLayout().container.body.dom).mask(FR.T('Loading data...'));
		var url = URLRoot+'/?module=weblinks&section=ajax&page=load'+(FR.email ? '&email=1' : '');
		var pars = {path: window.parent.FR.WebLinking.path};
		if (window.parent.FR.WebLinking.isFileRequest) {
			pars.isFileRequest = 1;
			window.parent.FR.WebLinking.isFileRequest = false;
		}
		Ext.Ajax.request({
			url: url,
			method: 'post',
			params: pars,
			success: function(req){
				window.parent.Ext.get(window.parent.FR.UI.popups.webLink.getLayout().container.body.dom).unmask();
				try {
					var rs = Ext.util.JSON.decode(req.responseText);
				} catch (er){}
				if (!rs || !rs.linkInfo) {
					if (rs && rs.msg) {
						window.parent.FR.UI.feedback(rs.msg);
						window.parent.FR.UI.popups.webLink.hide();
					} else {
						new Ext.ux.prompt({text: FR.T('Application error: Unexpected server response!')});
					}
					FR.UI.form.getForm().reset();
					Ext.getCmp('LinkURLField').setValue('');
					return false;
				}
				FR.WebLinkInfo = rs.linkInfo;
				FR.WebLinkInfo.isdir = rs.isdir;

				var allow_downloads = Ext.getCmp('allow_downloads');
				var label = rs.isdir ? 'Allow visitors to download files from the folder.' : 'Allow visitors to download this file.';
				allow_downloads.setBoxLabel(FR.T(label))
								.setValue((rs.linkInfo.allow_downloads == '1'));

				var allow_editing = Ext.getCmp('allow_editing');
				var label = rs.isdir ? 'Allow visitors to edit the files inside this folder.' : 'Allow visitors to edit this file.';
				allow_editing.setBoxLabel(FR.T(label))
							.setValue((rs.linkInfo.allow_editing == '1'))
							.setVisible(rs.editingAvailable);
				FR.toggleEditableOption(rs.editingAvailable);


				var allow_uploads = Ext.getCmp('allow_uploads');
				var label = rs.isdir ? 'Allow visitors to upload files in this folder.' : 'Allow visitors to upload new versions of this file.';
				allow_uploads.setBoxLabel(FR.T(label))
								.setValue((rs.linkInfo.allow_uploads == '1'))
								.setVisible(rs.uploadAvailable);
				Ext.getCmp('linkTypeOpt').setValue(FR.defaultMode)
										.setVisible(
					rs.isdir && ((rs.linkInfo.allow_uploads == '1' && rs.linkInfo.allow_downloads == '1') || rs.linkInfo.allow_uploads == '0')
				);
				Ext.getCmp('linkTypeOptFile').setValue('preview')
									.setVisible(!rs.isdir);
				Ext.getCmp('require_login').setVisible(!rs.require_login);
				Ext.getCmp('download_limit').setVisible(!rs.isdir);
				Ext.getCmp('shortLinkToggle').toggle((rs.linkInfo && rs.linkInfo.short_url), true)
									.setVisible(!FR.disableShortURL);

				Ext.getCmp('expiry').setValue(rs.linkInfo.expiry2);
				Ext.getCmp('download_limit').setValue(rs.linkInfo.download_limit);
				Ext.getCmp('password').setValue(rs.linkInfo.password);
				Ext.getCmp('LinkURLField').setValue(rs.linkInfo.short_url ? rs.linkInfo.short_url : rs.linkInfo.url);

				Ext.getCmp('dterms').setValue(rs.linkInfo.download_terms);

				if (rs.linkInfo.short_url) {
					Ext.getCmp('shortLinkToggle').toggle(true, true);
				}
				Ext.getCmp('require_login').setValue((rs.linkInfo.require_login == '1'));

				Ext.getCmp('show_comments').suspendEvents().setValue((rs.linkInfo.show_comments == '1')).resumeEvents();
				Ext.getCmp('show_comments_names').setValue((rs.linkInfo.show_comments_names == '1'));
				Ext.getCmp('show_comments_names_field').setVisible((rs.linkInfo.show_comments == '1'));
				Ext.getCmp('show_metadata').setValue((rs.linkInfo.show_metadata == '1'));

				Ext.getCmp('notify').setValue((rs.linkInfo.notify == '1'));
				Ext.getCmp('cardPanel').getLayout().setActiveItem(0);

				with (window.parent) {
					FR.utils.applyFileUpdates(FR.WebLinking.path, {weblink: 1});
				}
				if (rs.linkInfo.allow_uploads == true) {
					Ext.fly('linkLabel').update(FR.T('Give this link to people you’re requesting files from')+':');
				} else {
					Ext.fly('linkLabel').update('&nbsp;');
				}
			}
		});
	};
	FR.changeViewSettings = function () {
		var url = FR.WebLinkInfo.url;
		if (FR.WebLinkInfo.isdir) {
			if (FR.viewSettings.linkTypeOpt) {
				url += '&mode='+FR.viewSettings.linkTypeOpt;
			}
		} else {
			if (FR.viewSettings.linkTypeOptFile != 'preview') {
				url += '&fmode=' + FR.viewSettings.linkTypeOptFile;
			}
		}
		Ext.getCmp('LinkURLField').setValue(url);
		Ext.getCmp('LinkURLField').getEl().highlight("cffac5", {attr: 'background-color', easing: 'easeIn', endColor: 'f1f3f4', duration: 1});
	};
	FR.update = function() {
		if (FR.QRWindow) {FR.QRWindow.hide();}
		this.getInfo();
	};
	FR.toggleEditableOption = function(editingAvailable) {
		FR.linkTypeStore.removeAt(3);
		if (editingAvailable) {
			FR.linkTypeStore.add([new Ext.data.Record({'val': 'edit','label':FR.T('Editable')})]);
		}
	};
	FR.getShort = function() {
		var url = Ext.getCmp('LinkURLField').getValue();
		Ext.getCmp('LinkURLField').setValue(FR.T('Loading...'));
		Ext.Ajax.request({
			url: URLRoot+'/?module=weblinks&section=ajax&page=get_short',
			method: 'post',
			params: {
				linkId: FR.WebLinkInfo.id,
				url: url
			},
			success: function(req){
				try {
					var rs = Ext.util.JSON.decode(req.responseText);
				} catch (er){return false;}
				if (rs.success) {
					FR.WebLinkInfo.short_url = rs.url;
					Ext.getCmp('LinkURLField').setValue(rs.url);
				} else {
					Ext.getCmp('LinkURLField').setValue(rs.error);
				}
			}
		});
	};
	FR.emailLink = function() {
		if (FR.useClientEmail) {
			document.location.href = 'mailto:?body='+Ext.getCmp('LinkURLField').getValue();
		} else {
			window.parent.FR.actions.EmailFromLink();
		}
	};

	FR.showQRCode = function (URL) {
		if (!FR.QRWindow) {
			FR.QRWindow = new window.parent.Ext.Window({
				title: FR.T('QR Code'), closeAction: 'hide', draggable: false,
				layout: 'border', width: 270, height: 270, modal: true, hideBorders: true, resizable: false,
				items: [
					{
						region: 'north', bodyStyle: 'padding:3px;text-align:center;', height: 35,
						html: FR.T('Scan this QR code with your mobile device.')
					},
					{
						region: 'center',
						html: '<div style="text-align:center;"><div style="display:inline-block;background-image:url(images/loading.gif);background-position: center center;background-repeat:no-repeat;width:148px;height:148px;" id="qrwrap"><img src="'+URLRoot +'/?module=fileman&section=utils&page=qrcode&data='+encodeURIComponent(URL)+'" width="148" height="148" border="0" alt="" /></div></div>'
					}
				]
			});
		}
		FR.QRWindow.show();
	};
	FR.copyToClipboard = function() {
		Ext.getCmp('LinkURLField').focus();
		try {
			if (document.execCommand('copy')) {
				window.parent.FR.UI.feedback(FR.T('The link has been copied to clipboard.'));
			}
		} catch (err) {}
	};
	window.parent.Ext.get(window.parent.FR.UI.popups.webLink.getLayout().container.body.dom).unmask();
	FR.loadMask = new Ext.LoadMask(Ext.getCmp('cardPanel').el, {msg: window.parent.FR.T('Loading...')});
	FR.getInfo();
});