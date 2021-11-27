FR.initTree = function () {
	var displayed = [];
	var opts = {
		adminSection: {
			text: FR.T('Admin'), id: 'admin', cls: 'sysConfMenuItem',
			children: [
				{
					text: FR.T('Users'), id: 'users',
					iconCls: 'fa fa-fw fa-user',
					module: (FR.user.perms.adminUsers ? FR.modules.users : false),
					leaf: FR.system.isFree,
					children: [
						{
							text: FR.T('Users online'), hidden: !FR.system.enableUsersOnline,
							iconCls: 'fa fa-fw fa-user-circle', leaf: true,
							appURL: FR.URLRoot+'/?module=cpanel&section=tools&page=users_online'
						},
						{
							text: FR.T('Storage usage'), hidden: FR.system.isFree,
							iconCls: 'fa fa-fw fa-chart-pie', leaf: true, id: 'space-quota',
							appURL: FR.URLRoot+'/?module=cpanel&section=tools&page=space_quota'
						},
						{
							text: FR.T('Import users'), hidden: (FR.system.isFree || FR.system.isFreelancer || !FR.user.isSuperuser),
							iconCls: 'fa fa-fw fa-file-upload',
							leaf: true, id: 'import-users',
							appURL: FR.URLRoot+'/?module=users&section=import'
						},
						{
							text: FR.T('Export users'), hidden: (FR.system.isFree || FR.system.isFreelancer || !FR.user.isSuperuser),
							iconCls: 'fa fa-fw fa-file-download',
							leaf: true, id: 'export-users',
							appURL: FR.URLRoot+'/?module=users&section=cpanel&page=export'
						}
					]
				},
				{
					text: FR.T('Roles'), id: 'roles',
					iconCls: 'fa fa-fw fa-user-tie', leaf: true,
					module: FR.modules.roles, hidden: !FR.user.perms.adminRoles
				},
				{
					text: FR.T('Groups'), id: 'groups',
					iconCls: 'fa fa-fw fa-group', leaf: true,
					module: FR.modules.groups, hidden: !FR.user.perms.adminUsers
				},
				{
					text: FR.T('Activity logs'),
					id: 'activity-logs', leaf: true,
					iconCls: 'fa fa-fw fa-book',
					module: FR.modules.logs, hidden: !FR.user.perms.adminLogs
				},
				{
					text: FR.T('Web Links'),
					iconCls: 'fa fa-fw fa-link', leaf: true,
					id: 'web-links',
					module: FR.modules.weblinks
				}
			]
		},
		iface: {
			text: FR.T('Interface'),
			id: 'interface',
			cls: 'adminSection',
			children: [
				{
					text: FR.T('Options'), leaf: true, id: 'interface-options', cls: 'adminNoIcon',
					appURL: FR.URLRoot+'/?module=cpanel&section=settings&page=interface'
				},
				{
					text: FR.T('Branding'), leaf: true, id: 'interface-branding', cls: 'adminNoIcon',
					appURL: FR.URLRoot+'/?module=cpanel&section=settings&page=branding'
				}
			]
		},
		email: {
			text: FR.T('E-mail'), cls: 'adminSection', id: 'email',
			children: [
				{
					text: FR.T('Settings'), leaf: true, hidden: !FR.user.isSuperuser,
					appURL: FR.URLRoot+'/?module=cpanel&section=settings&page=email',
					id: 'email-settings', cls: 'adminNoIcon'
				},
				{
					text: FR.T('Notifications'), leaf: true, cls: 'adminNoIcon',
					module: FR.modules.notifications, id: 'email-notifications'
				},
				{
					text: FR.T('Logs'), leaf: true, hidden: !FR.user.isSuperuser,
					module: FR.modules.notif_logs, id: 'email-logs', cls: 'adminNoIcon'
				}
			]
		},
		files: {
			text: FR.T('Files'),
			id: 'files',
			cls: 'adminSection',
			children: [
				{
					text: FR.T('Thumbs and previews'), leaf: true, id: 'files-preview', cls: 'adminNoIcon', hidden: !FR.user.isSuperuser,
					appURL: FR.URLRoot+'/?module=cpanel&section=settings&page=image_preview',
				},
				{
					text: FR.T('Plugins'), expanded: true, hidden: !FR.user.isSuperuser,
					module: FR.modules.openWith, id: 'files-plugins', cls: 'adminNoIcon',
					children: [
						{
							text: FR.T('Defaults'), leaf: true, id: 'files-plugins-defaults',
							module: FR.modules.defaultOpenWith, cls: 'adminNoIcon'
						}
					]
				},
				{
					text: FR.T('Searching'), leaf: true, hidden: !FR.user.isSuperuser,
					appURL: FR.URLRoot+'/?module=cpanel&section=settings&page=file_search', id: 'searching',
					cls: 'adminNoIcon'
				},
				{
					text: FR.T('Misc options'), leaf: true, hidden: !FR.user.isSuperuser,
					appURL: FR.URLRoot+'/?module=cpanel&section=settings&page=files', id: 'files-misc',
					cls: 'adminNoIcon'
				},
				{
					text: FR.T('Metadata'), expanded: true, id: 'metadata', cls: 'adminNoIcon',
					children: [
						{
							text: FR.T('File types'), leaf: true, cls: 'adminNoIcon',
							id: 'metadata-file-types',
							module: FR.modules.metadata_filetypes
						},
						{
							text: FR.T('Field sets'), leaf: true, id: 'metadata-fieldsets',
							module: FR.modules.metadata_fieldsets, cls: 'adminNoIcon'
						}
					]
				}
			]
		},
		sec: {
			text: FR.T('Security'),
			id: 'security',
			cls: 'adminSection',
			children: [
				{
					text: (FR.system.isFree || FR.system.isFreelancer) ? FR.T('User login') : FR.T('Login and registration'), leaf: true, cls: 'adminNoIcon',
					appURL: FR.URLRoot+'/?module=cpanel&section=settings&page=login_registration', id: 'login-registration'
				},
				{
					text: FR.T('Guest users'), leaf: true, cls: 'adminNoIcon',
					appURL: FR.URLRoot+'/?module=cpanel&section=settings&page=guest_users', id: 'guest-users'
				},
				{
					text: FR.T('Password policy'), leaf: true, hidden: (FR.system.isFree || FR.system.isFreelancer), cls: 'adminNoIcon',
					appURL: FR.URLRoot+'/?module=cpanel&section=settings&page=passwords', id: 'password-policy'
				},
				{
					text: FR.T('API'), id: 'api', expanded: true, cls: 'adminNoIcon',
					appURL: FR.URLRoot+'/?module=cpanel&section=settings&page=oauth',
					children: [
						{
							text: FR.T('Clients'), leaf: true, id: 'api-clients',
							module: FR.modules.oauth2_clients, cls: 'adminNoIcon'
						}
					]
				}
			]
		},
		more: {
			text: FR.T('More'),
			id: 'more',
			cls: 'adminSection',
			children: [
				{
					text: FR.T('Misc options'), leaf: true, id: 'misc', cls: 'adminNoIcon',
					appURL: FR.URLRoot+'/?module=cpanel&section=settings&page=misc'
				},
				{
					text: FR.T('Third party services'), leaf: true, id: 'third-party', cls: 'adminNoIcon',
					appURL: FR.URLRoot+'/?module=cpanel&section=settings&page=third_party'
				},
				{
					text: FR.T('Software update'), leaf: true, id: 'update', cls: 'adminNoIcon',
					appURL: FR.URLRoot+'/?module=software_update&section=cpanel'
				},
				{
					text: FR.T('Software licensing'), leaf: true, id: 'licensing', cls: 'adminNoIcon',
					appURL: FR.URLRoot+'/?module=cpanel&section=settings&page=license'
				}
			]
		},
		sysConf: {
			text: FR.T('Configuration'), id: 'sysconf', leaf: true,
			cls: 'sysConfMenuItem'
		}
	};
	if (FR.user.isIndep || FR.user.perms.adminUsers) {
		displayed.push(opts.adminSection);
	}
	if (FR.user.isSuperuser || FR.user.perms.adminNotif  || FR.user.perms.adminMetadata) {
		displayed.push(opts.sysConf);
	}
	if (FR.user.isSuperuser) {
		displayed.push(opts.iface);
	}
	if (FR.user.isSuperuser || FR.user.perms.adminMetadata) {
		displayed.push(opts.files);
	}
	if (FR.user.isSuperuser || FR.user.perms.adminNotif) {
		displayed.push(opts.email);
	}
	if (FR.user.isSuperuser) {
		displayed.push(opts.sec);
		displayed.push(opts.more);
	}

	this.tree = {
		init: function() {
			this.panel = new Ext.tree.TreePanel({
				region: 'center',
				autoScroll: true, rootVisible: false,
				listeners: {
					'contextmenu': function (tree, e) {e.stopEvent();return false;}
				},
				root: {
					expanded: true,
					id: 'cpanel',
					children: displayed
				}
			});
			this.panel.getSelectionModel().on('selectionchange', function(selectionModel, treeNode) {
				FR.tsel = treeNode.attributes;
				if (FR.tsel.module) {
					if (FR.tsel.module.type == 'grid') {
						Ext.getCmp('cardDisplayArea').getLayout().setActiveItem(0);
						FR.grid.loadModule(FR.tsel.module);
					} else {
						if (FR.tsel.module.activeItem) {
							Ext.getCmp('cardDisplayArea').getLayout().setActiveItem(FR.tsel.module.activeItem);
						}
					}
				} else {
					if (FR.tsel.appURL) {
						Ext.getCmp('cardDisplayArea').getLayout().setActiveItem(1);
						Ext.getCmp('appTab').removeAll(true);
						FR.tempPanel.load({
							url: FR.tsel.appURL,
							nocache: true,
							scripts: true
						});
					}
				}
				//console.log();
				var path = treeNode.getPath();
				window.history.pushState({path: path}, '', '#' + path);
			});
			this.panel.getSelectionModel().on('beforeselect', function(selectionModel, treeNode) {
				var a = treeNode.attributes;
				if (a.id == 'metadata') {
					treeNode.firstChild.select();
					return false;
				}
				if (['sysConfMenuItem','adminSection'].indexOf(a.cls) != -1) {
					treeNode.expand();
					return false;
				}
			});
			this.panel.getRootNode().on('load', function () {
				window.setTimeout(function () {
					if (FR.user.perms.adminUsers) {

						var path = decodeURI(document.location.hash.substring(1));
						if (!path) {
							path = '/cpanel/admin/users';
						}
						FR.tree.panel.selectPath(path, 'id',function(t, node){node.ensureVisible();});
					}
				}, 200);
			});
		}
	};
	this.tree.init();
};