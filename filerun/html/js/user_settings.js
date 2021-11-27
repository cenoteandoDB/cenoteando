var FR = {
	initLayout: function() {
		var appsOpts = [];
		if (FR.apps && FR.apps.length > 0) {
			var boxes = [];
			Ext.each(FR.apps, function (item) {
				boxes.push({
					boxLabel: item.name + ' <span class="colorGray">' + item.date_created + '</span>',
					name: 'revoke[]',
					inputValue: item.id,
					helpText: FR.T('Granted on %1 from %2').replace('%1', '<strong>'+item.date_created+'</strong>').replace('%2', '<strong>'+item.client_ip+'</strong>') + '<br><br>'+item.device_uuid
				});
			});
			appsOpts.push({
				xtype: 'checkboxgroup',
				itemCls: 'x-check-group-alt',
				columns: 1,
				fieldLabel: FR.T('Revoke access'),
				items: boxes
			});
		}
		appsOpts.push({
			xtype: 'compositefield',
			items: [
				{xtype: 'textfield', value:'', hidden: true},
				{xtype: 'button', text: FR.T('Connect WebDAV app'),
					cls:'fr-btn-default fr-btn-smaller fr-btn-nomargin',
					handler: function() {
						window.open(FR.URLRoot+'/oauth2/authorize/?response_type=webdav&client_id=Generic0000000000000000000WebDAV&redirect_uri=nc%3A%2F%2F&state=state5df4f4de0f81e&scope=webdav');
					}
				}
			]
		});


		this.viewport = new Ext.Viewport({
			layout: 'fit',
			items: {
				xtype: 'form', autoScroll: true, bodyStyle: 'padding:10px',
				layout: 'form', id: 'theForm',
				items: [
					{xtype: 'hidden', name: 'csrf', value: FR.system.csrf_token},
					{
						xtype: 'fieldset', hidden: !FR.system.allowUserToEdit,
						title: FR.T('Basic details'),
						defaults: {width: 190}, labelWidth: 140,
						items: [
							{
								xtype : 'compositefield',
								fieldLabel: FR.T('Name'),
								items : [
									{
										flex : 1,
										xtype: 'textfield',
										name: 'name',
										value: FR.userInfo.name
									},
									{
										flex : 1,
										xtype: 'textfield',
										name: 'name2',
										value: FR.userInfo.name2
									}
								]
							},
							{
								xtype: 'textfield',
								fieldLabel: FR.T('E-mail address'),
								name: 'email', value: FR.userInfo.email
							},
							{
								xtype: 'checkbox',
								boxLabel: FR.T('E-mail notifications'), inputValue: 1, hidden: !FR.system.allowEmailNotifications,
								name: 'receive_notifications', checked: FR.userInfo.receive_notifications,
								helpText: FR.T('If checked, this option gets the user notified when:')+
									'<div style="margin-top:5px;">&bull; '+FR.T('A file has been downloaded by another user.')+'</div>'+
									'<div>&bull; '+FR.T('Another user provided a file or a folder via copying, moving, uploading or sharing.')+'</div>'+
									'<div>&bull; '+FR.T('Another user added a comment or set a label on a file or a folder.')+'</div>'
							},
							{
								xtype: 'textfield',
								fieldLabel: FR.T('Phone'),
								name: 'phone', value: FR.userInfo.phone
							},
							{
								xtype : 'displayfield',
								fieldLabel: FR.T('Profile image'),
								html: '<a href="javascript:FR.applyNewImage()" class="avatarSelector" style="width:60px;display: inline-block;"><div style="position:relative;width:60px;"><img src="a/?uid='+FR.userInfo.id+'&noCache='+ (new Date().getTime())+'" height="60" id="avatarImg"><div class="cameraIcon"></div></div></a>'
							},
							{
								xtype: 'checkbox',
								boxLabel: FR.T('Mute sound notifications'),
								checked: (window.parent.FR.localSettings.get('sound-notif', window.parent.Settings.sound_notification ? 'enabled' : 'disabled') == 'disabled'),
								listeners: {
									'check': function(el, checked) {
										window.parent.FR.localSettings.set('sound-notif', checked ? 'disabled' : 'enabled');
									}
								}, hidden: !window.parent.User.perms.file_history
							}
						]
					},
					{
						xtype: 'fieldset',
						title: FR.T('Change password'),
						labelWidth: 140, hidden: !FR.system.allowUserToChangePass,
						defaults: {xtype: 'textfield', width: 190, inputType: 'password'},
						items: [
							{fieldLabel: FR.T('Current password'), name: 'current_password'},
							{fieldLabel: FR.T('New password'), name: 'new_password'},
							{fieldLabel: FR.T('Confirm new password'), name: 'confirm_new_password'},
							{
								xtype: 'displayfield', submitValue: false,
								hideLabel: true, hidden: !FR.userInfo.last_pass_change,
								style: 'color:gray;text-align:right;font-size:11px;', width: 335,
								value: FR.T('Your password has been last changed %1').replace('%1', FR.userInfo.last_pass_change)
							}
						]
					},
					{
						xtype: 'fieldset',
						title: FR.T('2-Step verification'),
						defaults: {width: 380}, hidden: !FR.system.enable2stepOption,
						items: [
							{
								xtype: 'checkbox',
								boxLabel: FR.T('Enable 2-step verification'),
								inputValue: 1, hideLabel: true,
								name: 'two_step_enabled', checked: FR.userInfo.two_step_enabled
							},
							{
								xtype: 'displayfield', width:340, hideLabel: true, style: 'color:gray', value: FR.T('Every time you login you will need to type in also a temporary code which can be generated on your mobile device with a dedicated app such as Google Authenticator.')
							}
						]
					},
					{
						xtype: 'fieldset',
						title: FR.T('Connected apps'),
						hidden: !FR.system.showApps,
						items: appsOpts
					}
				], buttonAlign: 'left',
				buttons: [{
					text: FR.T('Save changes'), cls: 'fr-btn-primary', handler: function() {
						FR.formPanel = Ext.getCmp('theForm');
						FR.formPanel.bwrap.mask(FR.T('Saving changes...'));
						Ext.Ajax.request({
							url: FR.URLRoot+'/?module=fileman&section=profile&action=save',
							params: Ext.apply({
								'receive_notifications': 0,
								'two_step_enabled': 0
							}, FR.formPanel.form.getValues()),
							callback: function() {FR.formPanel.bwrap.unmask();},
							success: function(req) {
								try {
									var rs = Ext.util.JSON.decode(req.responseText);
								} catch (er){return false;}
								if (rs) {
									if (rs.msg) {window.parent.FR.UI.feedback(rs.msg);}
									if (rs.success) {
										window.parent.FR.UI.popups.accountSettings.close();
									}
								} else {window.parent.FR.UI.feedback(req.responseText);}
							},
							failure: function(f, a) {FR.UI.feedback(f.responseText);}
						});
					}}
				]
			}
		});
	},
	applyNewImage: function() {
		var input = document.createElement('input');
		input.setAttribute('type', 'file');
		input.style.display = 'none';

		input.addEventListener('change', function(e) {
			if (!e.target.files) {
				alert(FR.T('You need a modern browser in order to use this feature.'));
				return;
			}
			if (e.target.files[0].type != 'image/png' && e.target.files[0].type != 'image/jpeg') {
				alert(FR.T('Please select a PNG or JPG image file.'));
				return;
			}
			var reader  = new FileReader();
			reader.onload = function (e) {

				var el = document.createElement('div');
				FR.cropperWindow = new Ext.Window({
					width: 300,
					contentEl: el, closable: false, buttonAlign: 'center', maximized: true,
					buttons: [
						{text: FR.T('Save changes'), cls: 'fr-btn-primary', handler: function() {
							FR.cropper.croppie('result', {type: 'canvas', size: 'viewport'}).then(function(canvas){
								canvas.toBlob(function(blob) {
									blob.fileName = 'avatar.png';
									var upload = new Flow({
										target: FR.URLRoot+'/?module=fileman&section=profile&action=upload_avatar',
										validateChunkResponse: function(status, message) {
											if (status != '200') {return 'retry';}
											try {var rs = Ext.decode(message);} catch (er){return 'retry';}
											if (rs) {if (rs.success) {return 'success';} else {return 'error';}}
										}, validateChunkResponseScope: this, startOnSubmit: true
									});
									upload.on('fileSuccess', function(f, sr) {
										FR.uploadProgress.hide();
										FR.cropperWindow.close();
										$('#avatarImg').attr('src', canvas.toDataURL('image/png', 1));
										with (window.parent) {
											var a = FR.UI.actions.user.el.first();
											var url = FR.baseURL+'/a/?uid='+User.id+'&noCache='+ (new Date().getTime());
											a.set({'style': 'background-image: url(\''+url+'\')'});
										}
									});
									upload.on('fileError', function(f, sr) {
										FR.uploadProgress.hide();
										try {var rs = Ext.decode(sr);} catch (er){}
										if (rs && rs.msg) {alert(rs.msg);}
									});
									upload.on('progress', function(flow) {
										var percent = Math.floor(flow.getProgress()*100);
										FR.uploadProgress.setText(FR.T('Saving image..')+' &nbsp; &nbsp;'+percent+'%');

									});
									upload.on('uploadStart', function(flow) {
										FR.uploadProgress = new Ext.ux.prompt({text: FR.T('Saving image..'), closeAction: 'hide'});
									});
									upload.addFile(blob);

								}, 'image/png', 1);
							});
						}},
						{text: FR.T('Cancel'), cls: 'fr-btn-default', style: 'margin-left:5px', handler: function() {
							FR.cropperWindow.close();
						}}
					]
				});
				FR.cropperWindow.show();

				FR.cropper = $(el).croppie({
					enableExif: true,
					viewport: {
						width: 116,
						height: 116,
						type: 'square'
					},
					boundary: {
						width: 150,
						height: 150
					}
				});

				FR.cropper.croppie('bind', {
					url: e.target.result
				});
			};
			reader.readAsDataURL(e.target.files[0]);
		});
		document.body.appendChild(input);
		input.click();
	}
};
Ext.onReady(function() {
	FR.initLayout();
});