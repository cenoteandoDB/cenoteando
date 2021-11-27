Ext.getCmp('gridTabPanel').add(new FR.components.editForm({
	title: FR.T('Edit User')+': '+FR.userInfo.fullName,
	userInfo: FR.userInfo,
	labelWidth: 140,
	items: {
		xtype: 'tabpanel',
		activeTab: 0, deferredRender: false,
		defaults: {autoScroll: true, bodyStyle:'padding:10px', hideMode: 'offsets'},
		listeners: {'render': function() {
			if (!FR.user.isSuperuser) {this.hideTabStripItem(3);}
			if (FR.system.isFree || FR.system.isFreelancer) {
				this.hideTabStripItem(3);
			}
		}},
		items: [
			{
				title: FR.T('Basic Information'),
				items: [
					{
						xtype: 'fieldset',
						title: FR.T('Login Info'),
						width: 500,
						defaults: {width: 200},
						items: [
							{
								xtype: 'hidden',
								name: 'id',
								value: FR.userInfo.id
							},
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
								xtype : 'compositefield', hidden: !FR.userInfo.isGuest,
								fieldLabel: FR.T('Guest access URL'), width: 290,
								items : [
									{
										xtype: 'textfield', ref:'guestAccessURL',
										width: 250, value: FR.userInfo.guestAccessURL,
										selectOnFocus: true
									},
									{
										xtype: 'button',
										iconCls: 'fa fa-fw fa-clipboard',
										cls: 'fr-btn-default fr-btn-in-form',
										handler: function() {
											this.ownerCt.ownerCt.guestAccessURL.focus();
											try {
												if (document.execCommand('copy')) {
													FR.feedback(FR.T('The URL has been copied to clipboard.'));
												}
											} catch (err) {}
										},
										tooltip: FR.T('Copy to clipboard')
									}
								]
							},
							{
								xtype: 'textfield', hidden: FR.userInfo.isGuest,
								fieldLabel: FR.T('Username'),
								name: 'unm',
								value: FR.userInfo.username,
								listeners: {
									'change': function() {
										this.ownerCt.notifyPassChange.show();
									}
								}
							},
							{
								hidden: FR.userInfo.isGuest,
								xtype: 'trigger',
								fieldLabel: FR.T('Password'),
								name: 'pwd', value: '',
								enableKeyEvents: true, emptyText: FR.T('- no change -'),
								listeners: {
									'keyup': function() {
										this.ownerCt.notifyPassChange.show();
									}
								},
								triggerClass: 'fa fa-key',
								onTriggerClick: function() {
									this.setValue(randomPass(12, true, true, true, true, 2));
									this.el.dom.select();
									this.ownerCt.notifyPassChange.show();
								},
								helpText: FR.T('Leave field empty to keep the old password.')
							},
								{
								xtype: 'displayfield',
								style: 'color:gray',
								hidden: (FR.userInfo.isGuest || !FR.userInfo.last_pass_change),
								value: FR.T('Last changed')+': '+FR.userInfo.last_pass_change_ago
							},
							{
								xtype: 'checkbox', hidden: true, ref: 'notifyPassChange',
								boxLabel: FR.T('Send a notification now'),
								width: 400, inputValue: 1, checked: 1,
								name: 'notify',
								helpText: FR.T('An e-mail message with the login information will be sent to the user\'s address.')
							},
							{
								xtype: 'checkbox', hidden: FR.userInfo.isGuest,
								boxLabel: FR.T('Require user to change the password'),
								width: 400, value: 1,
								name: 'require_password_change', checked: parseInt(FR.userInfo.require_password_change)
							},
							{
								xtype: 'checkbox',
								boxLabel: FR.T('Enable 2-step verification'),
								width: 400, value: 1, hidden: FR.userInfo.isGuest,
								name: 'two_step_enabled', checked: parseInt(FR.userInfo.two_step_enabled),
								helpText: FR.T('In order for the user to login, he will need to type in also a temporary code which can be generated on a mobile device with a dedicated app such as Google Authenticator.'),
								listeners: {
									'check': function(f, checked) {
										this.ownerCt.reset2fa.setDisabled(!checked);
									}
								}
							},
							{
								xtype: 'checkbox', ref: 'reset2fa',
								boxLabel: FR.T('Reset now'), style: 'margin-left:10px',
								width: 390, value: 1, hidden: FR.userInfo.isGuest,
								name: 'two_step_reset',
								helpText: FR.T('Enabling this option will force the user to redo the 2-step verification setup on next login.')
							}
						]
					},
					{
						xtype: 'fieldset',
						width: 500, hidden: (FR.userInfo.id == 1),
						defaults: {width: 200},
						items: [
							{
								xtype: 'checkbox',
								boxLabel: FR.T('The account is deactivated'),
								width: 400, value: 1,
								name: 'deactivate', checked: !parseInt(FR.userInfo.activated)
							},
							{
								xtype: 'datefield',
								fieldLabel: FR.T('Expiration date'),
								minValue: new Date(), hidden: (FR.userInfo.id == 1 || FR.system.isFree || FR.system.isFreelancer),
								helpText: FR.T('The user account will be automatically deactivated at the specified date.'),
								name: 'expiration_date', value: FR.userInfo.expiration_date
							}
						]
					},
					{
						xtype: 'fieldset',
						title: FR.T('E-mail Options'),
						width: 500,
						defaults: {width: 200},
						items: [
							{
								xtype: 'textfield',
								fieldLabel: FR.T('E-mail address'),
								name: 'email',
								value: FR.userInfo.email
							},
							{
								xtype: 'checkbox',
								boxLabel: FR.T('Notifications'),
								helpText: FR.T('If checked, this option gets the user notified when:')+
									'<div style="margin-top:5px;">&bull; '+FR.T('A file has been downloaded by another user.')+'</div>'+
									'<div>&bull; '+FR.T('Another user provided a file or a folder via copying, moving, uploading or sharing.')+'</div>'+
									'<div>&bull; '+FR.T('Another user added a comment or set a label on a file or a folder.')+'</div>'+
									(FR.system.isFree ? '' : '<div>&bull; '+FR.T('The space quota, if one is set, is about to hit the usage limit.')+'</div>')+
									'<br><div>'+FR.T('Note: this option applies to actions performed inside the user\'s home folder.')+'</div>'
									, inputValue: 1,
								name: 'receive_notifications', checked: parseInt(FR.userInfo.receive_notifications)
							}
						]
					},
					{
						xtype: 'fieldset',
						title: FR.T('Details'),
						width: 500, hidden: FR.system.isFree,
						defaults: {width: 200},
						items: [
							{
								xtype: 'textfield',
								fieldLabel: FR.T('Phone'),
								name: 'phone',
								value: FR.userInfo.phone
							},
							{
								xtype: 'textfield',
								fieldLabel: FR.T('Company'),
								name: 'company',
								value: FR.userInfo.company
							},
							{
								xtype: 'textfield',
								fieldLabel: FR.T('Website'),
								name: 'website',
								value: FR.userInfo.website
							},
							{
								xtype: 'textfield',
								fieldLabel: FR.T('Logo URL'),
								name: 'logo_url',
								value: FR.userInfo.logo_url
							},
							{
								xtype: 'textarea',
								fieldLabel: FR.T('Note'),
								name: 'description',
								value: FR.userInfo.description
							}
						]
					}
				]
			},
			{
				title: FR.T('Permissions'),
				defaults: {
					xtype: 'fieldset',
					width: 500
				},
				items: [
					{
						ref: 'roleFieldset',
						disabled: (FR.userInfo.id == 1),
						labelWidth: 100,
						items: [
							{
								xtype: 'combo',
								helpText: FR.T('The role defines the user\'s permission settings. The individual permission settings of the user cannot be changed if a role is selected.'),
								fieldLabel: FR.T('Role'),
								name: 'perms[role]', hiddenName: 'perms[role]', ref: '../role',
								autoCreate: true, mode: 'local', editable: false,
								emptyText: FR.T('Select...'),
								displayField: 'name', valueField: 'id',
								triggerAction:'all', disableKeyFilter: true,
								value: (FR.userInfo.perms.role ? FR.userInfo.perms.role : '-'),
								store: new Ext.data.SimpleStore({fields: ['id', 'name'], data: FR.roles}),
								listeners: {
									'beforeselect': function(f, record) {
										f.ownerCt.ownerCt.items.each(function(fieldset) {
											if (fieldset.ref != 'roleFieldset') {
												fieldset.setVisible((record.data.id == '-'));
											}
										});
										f.ownerCt.ownerCt.ownerCt.adminTab.setDisabled((record.data.id != '-'));
									}
								}
							}
						]
					},
					{
						hidden: (FR.currentUserPerms.admin_homefolder_template || FR.userInfo.perms.role != '-'),
						title: FR.T('Home folder'), labelWidth: 100,
						items: [
							{
								xtype: 'textfield',
								ref: 'homefolder',
								fieldLabel: FR.T('Path'),
								name: 'perms[homefolder]', width: 330,
								helpText:
									FR.user.isIndep ?
										FR.T('This folder will be automatically created in your home folder, if it doesn\'t exists already.') :
										FR.T('Type the path to a folder on your server. This is the user\'s personal working space.')+'<br><br>'+
										FR.T('As an example path, this app is located at %1').replace('%1', '<strong>'+FR.FileRunInstallPath+'</strong>'),
								value: FR.userInfo.perms.homefolder,
								listeners: {
									'focus': function() {
										if (FR.userInfo.perms.homefolder.length > 0) {
											this.ownerCt.editPathRemark.show();
										}
									},
									'blur': function() {
										if (FR.userInfo.perms.homefolder.length > 0) {
											this.ownerCt.editPathRemark.setVisible(this.isDirty());
										}
									}
								}
							},
							{
								xtype: 'compositefield', hidden: FR.user.isIndep,
								items: [
									{xtype: 'textfield', value:'', hidden: true},
									{xtype: 'button', text: FR.T('Check path'),
										cls:'fr-btn-default fr-btn-smaller fr-btn-nomargin',
										handler: function() {
											var fieldset = this.ownerCt.ownerCt.ownerCt;
											var par = {path: fieldset.homefolder.getValue()};
											var output = fieldset.serverReply; output.show();
											FR.utils.getAjaxOutput(FR.URLRoot+'/?module=users&section=cpanel&page=check_path', par, output);
										}
									},
									{xtype: 'button', text: FR.T('Create folder now'),
										cls:'fr-btn-default fr-btn-smaller fr-btn-nomargin',
										style: 'margin-left:5px',
										handler: function() {
											var fieldset = this.ownerCt.ownerCt.ownerCt;
											var par = {path: fieldset.homefolder.getValue()};
											var output = fieldset.serverReply; output.show();
											FR.utils.getAjaxOutput(FR.URLRoot+'/?module=users&section=cpanel&page=create_path', par, output);
										}
									}
								]
							},
							{xtype: 'displayfield', ref: 'editPathRemark', value: FR.T('Important: Changing this path will remove the users folder sharing settings and weblinks.'), style:'padding:3px;color:red', hidden: true},
							{xtype: 'displayfield', ref: 'serverReply', value: 'test', style:'border:1px solid silver;padding:3px;', hidden: true}
						]
					},
					{
						title: FR.T('Permissions'), labelWidth: 10,
						hidden: (FR.userInfo.perms.role != '-'),
						items: [
							{
								xtype: 'fieldset',
								title: 'Access',
								defaults: {xtype: 'checkbox'},
								items: [
									{
										boxLabel: FR.T('User can download files'), value: 1,
										name: 'perms[download]', checked: parseInt(FR.userInfo.perms.download),
										listeners: {
											'check': function(field, checked) {
													this.ownerCt.ownerCt.shareFieldSet.setDisabled(!checked);
													this.ownerCt.downloadFolders.setDisabled(!checked);
													this.ownerCt.canPreview.setValue(checked ? 1 : 0);
													this.ownerCt.canPreview.setDisabled(checked);
													this.ownerCt.fileLog.setDisabled(!checked);
											}
										}
									},
									{
										boxLabel: FR.T('User can preview files'), value: 1,
										name: 'perms[preview]', checked: parseInt(FR.userInfo.perms.preview),
										ref: 'canPreview', disabled: parseInt(FR.userInfo.perms.download)
									},
									{
										boxLabel: FR.T('User can download folders and collections'), value: 1, ref: 'downloadFolders',
										name: 'perms[download_folders]', checked: parseInt(FR.userInfo.perms.download_folders),
										disabled: !parseInt(FR.userInfo.perms.download),
										helpText: FR.T('Without this permission, users are not able to zip or share folders.')
									},
									{
										boxLabel: FR.T('User can read comments and view labels'), value: 1,
										name: 'perms[read_comments]', checked: parseInt(FR.userInfo.perms.read_comments)
									},
									{
										boxLabel: FR.T('User can access tags, ratings and other metadata'), value: 1,
										name: 'perms[metadata]', checked: parseInt(FR.userInfo.perms.metadata)
									},
									{
										boxLabel: FR.T('User can access the files\' activity logs'), value: 1, ref: 'fileLog',
										hidden: (FR.settings.disable_file_history || FR.system.isFree),
										name: 'perms[file_history]', checked: parseInt(FR.userInfo.perms.file_history)
									}
								]
							},
							{
								xtype: 'fieldset', disabled: !parseInt(FR.userInfo.perms.download),
								title: 'Share', ref: 'shareFieldSet',
								defaults: {xtype: 'checkbox'},
								items: [
									{
										boxLabel: FR.T('User can share with other users'), value: 1,
										name: 'perms[share]', checked: parseInt(FR.userInfo.perms.share),
										listeners: {
											'check': function(field, checked) {
												this.ownerCt.shareWithGuests.setDisabled(!checked);
											}
										}
									},
									{
										boxLabel: FR.T('User can share with guest users'), value: 1, ref: 'shareWithGuests',
										name: 'perms[share_guests]', checked: parseInt(FR.userInfo.perms.share_guests),
										disabled: !parseInt(FR.userInfo.perms.share)
									},
									{
										boxLabel: FR.T('User can share via web links'),
										name: 'perms[weblink]', checked: parseInt(FR.userInfo.perms.weblink)
									},
									{
										boxLabel: FR.T('User can share via e-mail'), value: 1,
										name: 'perms[email]', checked: parseInt(FR.userInfo.perms.email)
									}
								]
							},
							{
								xtype: 'fieldset',
								title: 'Change',
								defaults: {xtype: 'checkbox'},
								items: [
									{
										boxLabel: FR.T('User can upload files and folders'), value: 1,
										name: 'perms[upload]', checked: parseInt(FR.userInfo.perms.upload)
									},
									{
										boxLabel: FR.T('User can make changes to files and folders'), value: 1,
										name: 'perms[changes]', checked: !parseInt(FR.userInfo.perms.readonly)
									},
									{
										boxLabel: FR.T('User can write comments and set labels'), value: 1,
										name: 'perms[write_comments]', checked: parseInt(FR.userInfo.perms.write_comments)
									},
									{xtype: 'displayfield', value: ''},
									{
										boxLabel: FR.T('User can change the password'), value: 1,
										name: 'perms[change_pass]', checked: parseInt(FR.userInfo.perms.change_pass)
									},
									{
										boxLabel: FR.T('User can change personal information'), value: 1,
										name: 'perms[edit_profile]', checked: parseInt(FR.userInfo.perms.edit_profile)
									}
								]
							}
						]
					},
					{
						labelWidth: 150, hidden: (FR.userInfo.perms.role != '-'),
						items: [
							{
								xtype: 'userslistfield', allowAll: true, allItemsText: FR.T('[All users]'),
								helpText:  FR.T('Use this setting to allow the user to access folders shared by other users.'),
								fieldLabel: FR.T('Can interact with'), showSelf: true,
								tcfg: {height: 150, width: 250},
								name: 'users_may_see', value: FR.userInfo.perms.users_may_see
							}
						]
					},
					{
						labelWidth: 150, hidden: (FR.userInfo.perms.role != '-'),
						defaultType: 'textfield', defaults: {width: 60},
						items: [
							{
								fieldLabel: FR.T('Space quota'),
								name: 'perms[space_quota_max]',
								helpText: FR.T('The values are in megabytes. The value of 0 disables the limitation.'),
								value: FR.userInfo.perms.space_quota_max,
								hidden: FR.system.isFree
							},
							{
								fieldLabel: FR.T('Upload max file size'),
								name: 'perms[upload_max_size]',
								value: FR.userInfo.perms.upload_max_size,
								helpText: FR.T('The values are in megabytes. The value of 0 disables the limitation.')
							},
							{
								fieldLabel: FR.T('Allowed file types'),
								name: 'perms[upload_limit_types]',
								value: FR.userInfo.perms.upload_limit_types, width: 250,
								helpText:
									FR.T('Specify a list of file types the user will be limited to when upload files.')+
									'<br>'+
									FR.T('An empty field will allow the user to upload any type of file.')+
									'<br><br>'+
									FR.T('Example list:')+' jpg,mp3,docx,txt'
							}
						]
					}
				]
			},
			{
				title: FR.T('Groups'),
				ref: 'groupsTab',
				items: [
					{
						xtype: 'panel', layout: 'form', items: [{
							xtype: 'userslistfield', name: 'groups', only: 'groups', value: FR.userInfo.groups,
							fieldLabel: FR.T('User group(s)'), tcfg: {height: 150, width: 250},
							addHandler: function(data) {
								var formPanel = this.ownerCt.ownerCt.ownerCt.ownerCt;
								var params = {'uid': FR.userInfo.id, 'gids[]':[]};
								Ext.each(data.groups, function(group) {
									params['gids[]'].push(group.gid);
								});
								formPanel.bwrap.mask(FR.T('Please wait...'));
								var usersListCmp = this;
								Ext.Ajax.request({
									url: FR.URLRoot+'/?module=user_groups&section=cpanel&page=add_to_groups',
									method: 'POST', params: params,
									success: function(result) {
										formPanel.bwrap.unmask();
										try {
											var rs = Ext.util.JSON.decode(result.responseText);
										} catch(er) {
											FR.feedback(FR.T('Error: Unexpected server response!'));
											return false;
										}
										if (rs) {
											if (rs.success) {
												Ext.each(data.groups, function(group) {
													if (rs.gidsAdded.indexOf(group.gid) != -1) {
														usersListCmp.addItemToList({id: group.gid, name: group.name, type: 'group'});
													}
												});
											}
											if (rs.msg) {FR.feedback(rs.msg);}
										}
									}
								});
							},
							removeHandler: function(usersListCmp, selected) {
								var formPanel = this.ownerCt.ownerCt.ownerCt.ownerCt;
								var data = selected.attributes;
								new Ext.ux.prompt({
									text: FR.T('Are you sure you wish to remove %1 from the %2 group?').replace('%1', '<strong>'+FR.userInfo.name+'</strong>').replace('%2', '<strong>'+data.text+'</strong>')+
										'<br>'+
										FR.T('The user will no longer have access to files that might be shared with this group.'),
									confirmHandler: function() {
										formPanel.bwrap.mask(FR.T('Please wait...'));
										Ext.Ajax.request({
											url: FR.URLRoot+'/?module=user_groups&section=cpanel&page=remove_user',
											method: 'POST', params: {
												uid: FR.userInfo.id,
												gid: data.extra.id
											},
											success: function(result) {
												formPanel.bwrap.unmask();
												try {
													var rs = Ext.util.JSON.decode(result.responseText);
												} catch(er) {
													FR.feedback(FR.T('Error: Unexpected server response!'));
													return false;
												}
												if (rs) {
													if (rs.success) {
														usersListCmp.tree.root.removeChild(selected);
													}
													if (rs.msg) {FR.feedback(rs.msg);}
												}
											}
										});
									}
								});
							},
						}]
					}
				]
			},
			{
				title: FR.T('Admin'),
				ref: 'adminTab',
				disabled: ((FR.userInfo.id == 1) || (FR.userInfo.perms.role != '-')),
				items: [
					{
						xtype: 'fieldset',
						width: 500,
						items: [
							{
								xtype: 'radiogroup',
								fieldLabel: FR.T('Admin'),
								columns: 1,
								items: [
									{boxLabel: FR.T('No'), name: 'perms[admin_type]', inputValue: '', value: '', checked: (FR.userInfo.perms.admin_type == '')},
									{boxLabel: FR.T('Yes'), name: 'perms[admin_type]', inputValue: 'simple', value: 'simple', checked: (FR.userInfo.perms.admin_type == 'simple')},
									{boxLabel: FR.T('Yes, Independent'), name: 'perms[admin_type]', inputValue: 'indep', value: 'indep', checked: (FR.userInfo.perms.admin_type == 'indep'), helpText: FR.T('- Can only see and manage users, groups, etc. created by himself.')+'<br>'+FR.T('- He can assign space quotas within a total of his own space quota.')}
								],
								listeners: {
									'change': function(f, checked) {
										f.ownerCt.ownerCt.adminPermsFieldset.setVisible((checked.value == 'simple'));
										f.ownerCt.ownerCt.adminHomeFolderFieldset.setVisible((checked.value != ''));
										f.ownerCt.ownerCt.maxUsersFieldset.setVisible((checked.value == 'indep'));
									}
								}
							}
						]
					},
					{
						ref: 'adminPermsFieldset',
						xtype: 'fieldset',
						title: FR.T('Admin permissions'),
						width: 500, hidden: (FR.userInfo.perms.admin_type != 'simple'),
						defaults: {xtype: 'checkbox'},
						items: [
							{
								boxLabel: FR.T('User can create new user accounts.'), inputValue: 1,
								name: 'perms[admin_users]', checked: parseInt(FR.userInfo.perms.admin_users)
							},
							{
								boxLabel: FR.T('User can manage roles.'), inputValue: 1,
								name: 'perms[admin_roles]', checked: parseInt(FR.userInfo.perms.admin_roles)
							},
							{
								boxLabel: FR.T('User can manage notifications.'), inputValue: 1,
								name: 'perms[admin_notifications]', checked: parseInt(FR.userInfo.perms.admin_notifications)
							},
							{
								boxLabel: FR.T('User can access the activity logs.'), inputValue: 1,
								name: 'perms[admin_logs]', checked: parseInt(FR.userInfo.perms.admin_logs)
							},
							{
								boxLabel: FR.T('User can change the metadata settings.'), inputValue: 1,
								name: 'perms[admin_metadata]', checked: parseInt(FR.userInfo.perms.admin_metadata)
							},
							{xtype: 'displayfield', value: ''},
							{xtype: 'userslistfield', only: 'groups', allowAll: true, allItemsText: FR.T('[All groups]'),
								name: 'perms[admin_over]', value: FR.userInfo.perms.admin_over, fieldLabel: FR.T('Can manage'),
								tcfg: {height: 150, width: 250}
							}
						]
					},
					{
						ref: 'maxUsersFieldset',
						xtype: 'fieldset',
						width: 500, hidden: (FR.userInfo.perms.admin_type != 'indep'),
						items: [
							{
								xtype: 'textfield',
								fieldLabel: FR.T('Max users'),
								name: 'perms[admin_max_users]', width: 60,
								helpText: FR.T('This is the maximum number of user accounts this independent admin user can create.')+
								'<br>'+
								FR.T('Setting the value to zero will allow the admin to add an unlimited number of users.'),
								value: FR.userInfo.perms.admin_max_users
							}
						]
					},
					{
						ref: 'adminHomeFolderFieldset',
						xtype: 'fieldset',
						width: 500, hidden: (FR.userInfo.perms.admin_type == ''),
						items: [
							{
								xtype: 'textfield',
								fieldLabel: FR.T('Home folder<br>template path'),
								name: 'perms[admin_homefolder_template]', width: 300,
								helpText:
									FR.T('The users created by this administrator will have their home folders set depending on this template.')+'<br>'+
									FR.T('Leave the field empty to allow the admin to set the paths manually.')+'<br><br>'+
									FR.T('Example: /home/users/{USERNAME}')+'<br><br>'+
									FR.T('{USERNAME} will be automatically replaced with each user\'s login name.')+'<br>'+
									FR.T('{ADMUSERNAME} will be automatically replaced with this user\'s login name.')+'<br>'+
									FR.T('{NAME} will be automatically replaced with this user\'s name.')+'<br>'+
									FR.T('{EMAIL} will be automatically replaced with this user\'s e-mail.')+'<br>'+
									FR.T('{COMPANY} will be automatically replaced with this user\'s company name.'),
								value: FR.userInfo.perms.admin_homefolder_template,
								listeners: {
									'focus': function() {
										this.ownerCt.editHomeFolderTemplateRemark.show();
									},
									'blur': function() {
										this.ownerCt.editHomeFolderTemplateRemark.setVisible(this.isDirty());
									}
								}
							},
							{xtype: 'displayfield', ref: 'editHomeFolderTemplateRemark', value: FR.T('Important: Changing this path will update the home folder paths of all user accounts created by this admin. It will results in the automatic removal of these users\' folder sharing settings and weblinks.'), style:'padding:3px;color:red', hidden: true}
						]
					}
				]
			}
		]},
		tbar: [
		{
			text: FR.T('Save changes'),
			cls: 'fr-btn-primary',
			ref: 'saveBtn',
			handler: function() {
				this.ownerCt.ownerCt.submitForm({
					url: FR.URLRoot+'/?module=users&section=cpanel&page=edit&action=save',
					maskText: 'Saving changes...'
				});
			}
		},
		'->',
		{
			text: FR.T('Delete User Account'),
			iconCls: 'fa fa-fw fa-remove colorRed', disabled: (FR.userInfo.id == 1),
			handler: function() {
				var formPanel = this.ownerCt.ownerCt;
				this.deleteDlg = new Ext.Window({
					title: FR.userInfo.fullName,
					resizable: false, constrain:true, constrainHeader: true,
					modal: true, buttonAlign: "left",
					width:450, layout: 'fit', bodyStyle: 'padding-top:10px;padding-bottom:10px;',
					items: [
						{
							ref: 'delHF', xtype: 'checkbox', boxLabel: FR.T('Permanently delete the user\'s home folder.'),
							disabled: (formPanel.userInfo.perms.homefolder.length == 0)
						}
					],
					buttons: [
						{text: FR.T('Delete'), cls: 'fr-btn-primary', handler: function() {
								var opts = {
									url: FR.URLRoot+'/?module=users&section=cpanel&page=delete&uid='+formPanel.userInfo.id,
									maskText: FR.T('Please wait...')
								};
								if (this.deleteDlg.delHF.getValue()) {
									opts.extraParams = {deleteHomeFolder: 1};
								}
								this.deleteDlg.close();
								formPanel.deleteAction(opts);
							}, scope: this},
						{text: FR.T('Cancel'), style: 'margin-left:10px', handler: function(){this.deleteDlg.close();}, scope: this}
					]
				}).show();
			}
		}
	]
})).show();