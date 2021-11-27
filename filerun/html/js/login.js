var FR = {
	windowHeight: 320,
	windowWidth: 400,
	maxWinWidth: 400,
	logoAreaWidth: 240,
	logoAreaHeight: 196,
	showSouth: false,
	init: function() {
		var canvasSize = Ext.getBody().getViewSize();
		if (canvasSize.height < 520) {
			if (Settings.ui_login_logo.length) {
				Settings.ui_login_text = false;
			}
		}
		FR.isMobile = (canvasSize.width < 480);
		if (canvasSize.width < 650) {
			Settings.ui_login_logo = false;
			Settings.ui_login_text = false;
		}
		if (canvasSize.width < 400) {
			this.maxWinWidth = canvasSize.width-20;
			this.windowWidth = this.maxWinWidth;
		}
		this.promptWidth = Ext.min([this.maxWinWidth, 350]);
		if (Settings.ui_login_logo.length || Settings.ui_login_text.length) {
			this.windowWidth += this.logoAreaWidth;
		}
		if (Settings.ui_login_title.length) {
			this.windowHeight += 24;
		}
		if (Settings.ui_login_logo.length && Settings.ui_login_text.length) {
			this.windowHeight += 144;
			this.showSouth = true;
		}
	},
	initForm: function() {
		this.formPanel = new Ext.form.FormPanel({
			labelAlign: 'right',
			defaultType: 'textfield', autoHeight: true, hideLabels: true,
			cls: 'loginForm', standardSubmit: true, url: URLRoot+'/?module=fileman&page=login&action=login',
			listeners: {
				'render': function() {
					this.getForm().el.set({
						'action': URLRoot+'/?module=fileman&page=login&action=login',
						'target': 'submitIframe',
						'onSubmit': 'FR.submitForm();return false;'
					});
				}
			},
			items: [
				{
					ref: 'usrField', name: 'username', value: prefilledUsername,
					width: '100%', tabIndex: 1, cls: 'loginFormField',
					autoCreate: {tag: 'input', type: 'text', placeholder: FR.T('Username'), autocomplete: 'on', required: 'true'}
				},
				{
					xtype: 'textfield',
					id: 'pass', tabIndex: 2, value: prefilledPassword, width: '100%',
					name: 'password', inputType: 'password', cls: 'loginFormField',
					autoCreate: {tag: 'input', type: 'password', placeholder: FR.T('Password'), autocomplete: 'on'}
				},
				{xtype: 'component', html: '<input type="submit" hidefocus="true" tabindex="-1" style="position:absolute;z-index:-100;width:1px;height:1px;top:-100px;" />'},
				{
					xtype: 'textfield', ref: 'otp', hidden: true,
					id: 'otp', value: '', width: '100%',
					name: 'otp', cls: 'loginFormField', emptyText: FR.T('Verification code')
				},
				{xtype: 'hidden', name: 'two_step_secret', ref: 'two_step_secret', value: ''},
				{xtype: 'hidden', name: 'language', ref: 'language', value: ''},
				{xtype: 'displayfield', cls: 'forgotPass', value: '<a href="'+URLRoot+'/?module=fileman&page=password_recovery">'+FR.T('Forgot password?')+'</a>', hidden: !Settings.passwordRecoveryEnabled}
			]
		});
		this.iframe = Ext.DomHelper.append(document.body, {
			tag: 'iframe', name: 'submitIframe', id:'submitIframe',
			frameBorder: 0, width: 0, height: 0,
			css: 'display:none;visibility:hidden;height:0px;',
			src: 'about:blank'
		});
		Ext.get('submitIframe').on('load', function() {
			this.win.body.unmask();
			var frameDoc;
			if (this.iframe.contentDocument) {
				if (this.iframe.contentDocument.document) {
					frameDoc = this.iframe.contentDocument.document;
				} else {
					frameDoc = this.iframe.contentDocument;
				}
			} else {
				if (this.iframe.contentWindow.document) {
					frameDoc = this.iframe.contentWindow.document;
				}
			}
			var responseText = frameDoc.body.innerHTML;
			if (responseText.length == 0) {
				return false;
			}
			try {
				var rs = Ext.util.JSON.decode(responseText);
			} catch (er) {
				if (confirm(FR.T('Unexpected server reply. Press "OK" to display it.'))) {
					document.write(responseText);
				}
				return false;
			}
			if (rs.success) {
				FR.win.body.mask(FR.T('Loading...'));
				if (rs.redirect_url) {
					document.location.href = decodeURIComponent(rs.redirect_url);
				} else {
					document.location.reload();
				}
			} else if (rs.success == false) {
				FR.formPanel.otp.setValue('');
				if (rs.twoStepSecret) {
					FR.formPanel.two_step_secret.setValue(rs.twoStepSecret);
					FR.showQR(rs.twoStepSecret, rs.keyURI, rs.keyURIPlain);
				} else {
					if (rs.ask_otp) {
						new Ext.ux.prompt({
							width: this.promptWidth,
							text: rs.error,
							placeHolder: FR.T('6 digit verification code'),
							confirmHandler: function(code) {
								FR.formPanel.otp.setValue(code);
								FR.submitForm();
							}
						});
					} else {
						new Ext.ux.prompt({width: this.promptWidth, text: rs.error, callback: function() {FR.formPanel.usrField.focus(true);}});
					}
				}
			}
		}, this);


		var lang = [];
		Ext.each(Settings.languages, function(l) {
			var t = l[1], v = l[0];
			lang.push({
				text: t, handler: function () {
					FR.win.body.mask(FR.T('Changing language...'));
					document.location.href = URLRoot+'/?language='+encodeURIComponent(v);
				}
			});
		});

		this.win = new Ext.Window({
			title: FR.T(Settings.ui_login_title), cls:'login'+(Settings.ui_bg?' transparent':''),
			layout: 'border', width: this.windowWidth, height: this.windowHeight,
			closable: false, draggable: false, maximized: Ext.isMobile,
			listeners: {'show': function(){
				FR.formPanel.usrField.focus(false, 20);
				if (Settings.ui_login_logo.length) {
					Ext.fly('loginLogoImage').show().
						setStyle('background-image', 'url("'+Settings.ui_login_logo+'")').
						setHeight(FR.logoAreaHeight);

					/* adjust small logos */
					Ext.get(document.createElement('img')).on('load', function () {if (this.dom) {
						if (this.dom.width < FR.logoAreaHeight && this.dom.height < FR.logoAreaHeight) {
							Ext.fly('loginLogoImage').setStyle('background-size', 'auto');
						}
					}}).set({src: Settings.ui_login_logo});

				} else {
					if (Settings.ui_login_text.length) {
						Ext.get('loginText').show();
					}
				}
			}},
			items: [
				{
					region: 'center', footerStyle: 'padding:0 44px;',
					layout: 'fit',
					items: {
						layout: 'border',
						items: [
							{
								region: 'west', width: this.logoAreaWidth, id: 'logoArea',
								html:'<div id="loginLogoImage" style="display:none"></div><div id="loginText">'+Settings.ui_login_text+'</div>',
								hidden: (!Settings.ui_login_logo.length && !Settings.ui_login_text.length)
							},
							{
								region: 'center',
								items: this.formPanel
							}
						]
					},
					buttonAlign: 'left',
					buttons: [
						{
							text: Settings.selectedLang,
							cls: 'lang-select', width: 'auto',
							hidden: !Settings.ui_display_language_menu,
							menu: lang,
							listeners: {
								'render': function() {
									new Ext.ToolTip({
										target: this.el, style: 'padding:5px;white-space:nowrap',
										anchor: 'right', showDelay: 500, html: FR.T('Language')
									})
								}
							}
						},
						{
							text: FR.T('Create account'), cls: 'fr-btn-link',
							hidden: !Settings.signUpEnabled,
							handler: function(){document.location.href = signUpURL;}
						},
						new Ext.Toolbar.Fill(),
						{
							text: FR.T('Sign in'), tabIndex: 4, cls: 'fr-btn-primary', style: 'margin-right:0',
							handler: function(){FR.submitForm();}
						},
						{
							text: FR.T('SSO'), tabIndex: 5, cls: 'fr-btn-default', style: 'margin-left:5px',
							handler: function(){document.location.href = URLRoot+'/sso';}, hidden: !Settings.ssoEnabled, id: 'ssoBtn'
						}
					]
				},
				{
					region: 'south', hidden: !this.showSouth,
					height: 110, cls: 'footerTextPanel', margins: {top: this.showSouth ? 34 : 0, right:0, bottom:0, left:0},
					html: '<div class="footerText">'+Settings.ui_login_text+'</div>'
				}
			]

		});
		this.win.show();
		if (!FR.isMobile) {
			this.win.anchorTo(Ext.get('theBODY'), 'c-c');
		}
		if (Settings.message) {
			new Ext.ux.prompt({width: this.promptWidth, text: Settings.message, callback: function() {FR.formPanel.usrField.focus(true);}});
		}
		if (Settings.ssoEnabled) {
			if (Settings.ssoOnly) {
				this.win.body.mask(FR.T('Signing in...'));
				document.location.href = URLRoot+'/sso';
			} else {
				new Ext.ToolTip({
					target: 'ssoBtn', style: 'padding:5px;white-space:nowrap',
					anchor: 'top', showDelay: 10, dismissDelay: 0,
					html: FR.T('Single Sign On')
				});
			}
		}
	},
	submitForm: function() {
		this.win.body.mask(FR.T('Signing in...'));
		FR.formPanel.getForm().submit();
	},
	showOTPField: function() {
		FR.formPanel.otp.show();
		FR.formPanel.doLayout();
		FR.win.setHeight(FR.windowHeight+50);
		FR.win.center();
		FR.formPanel.otp.focus();
	},
	showQR: function(secret, keyURI, keyURIPlain) {
		if (FR.isMobile) {

			var appURL = Ext.isAndroid ?
				'https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=en' :
				'https://itunes.apple.com/us/app/google-authenticator/id388497605?mt=8';
			FR.add2stepWin = new Ext.Window({
				title: FR.T('2-step: Add account'), closable: false, resizable: false,
				width: this.promptWidth, modal: true,
				items: {
					layout: 'form', bodyStyle: 'padding:20px 20px 40px 20px', defaults: {hideLabel: true},
					items: [
						{xtype: 'displayfield', value: FR.T('Add a new <a href="%1" target="_blank">Google Authenticator</a> account with the following key:').replace('%1', appURL)},
						{xtype: 'textfield',  cls: 'loginFormField', width: '100%', height: 30, value: secret, style: 'margin-top:10px;text-align:center'}
					]
				},
				buttonAlign: 'center',
				buttons: [
					{
						cls: 'fr-btn-primary',
						text: FR.T('Done'), handler: function() {
							FR.add2stepWin.close();
							FR.showOTPField();
						}
					},
					{
						cls: 'fr-btn-default',
						text: FR.T('Open Authenticator'),
						handler: function() {
							document.location.href = keyURIPlain;
						}
					}
				]
			});
			FR.add2stepWin.show();
			return false;
		}
		FR.QRWindow = new Ext.Window({
			title: FR.T('2-step verification: add account'), closable: false, resizable: false,
			layout: 'border', width: this.maxWinWidth, height: 400, modal: true,
			items: [
				{
					region: 'north', bodyStyle: 'padding:10px;text-align:center;font-size:14px;', height: 50,
					html: FR.T('Scan this barcode with the <a href="%1" target="_blank">Google Authenticator</a> app on your mobile device to add your account.').replace('%1', 'https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=en')
				},
				{
					region: 'center',
					html:
					'<div style="text-align:center;">' +
					'<div style="" class="loginQRCodeWrap">' +
					'<img title="'+secret+'" src="'+URLRoot +'/?module=fileman&section=utils&page=qrcode&encoded=1&size=6&data='+encodeURIComponent(keyURI)+'" width="222" height="222" />' +
					'</div>' +
					'</div>'
				}
			],
			buttonAlign: 'center',
			buttons: [{
				cls: 'fr-btn-primary',
				text: FR.T('Done'), handler: function(){
					FR.QRWindow.close();
					FR.showOTPField();
				}
			}]
		});
		FR.QRWindow.show();
	}
};
Ext.onReady(function() {
	Ext.fly('loadMsg').fadeOut();
	FR.init();
	if (Settings.androidAppURL && Ext.isAndroid &&
		window.localStorage && !window.localStorage.getItem('androidPrompt')
	) {
		new Ext.ux.prompt({
			width: FR.promptWidth,
			text: FR.T('There is an Android app that you can use to access your files more comfortably. Would you like to try that instead?'),
			confirmHandler: function () {
				document.location.href = Settings.androidAppURL;
				FR.initForm();
			},
			cancelHandler: function () {
				FR.initForm();
			}
		});
		window.localStorage.setItem('androidPrompt', true);
	} else {
		FR.initForm();
	}
});