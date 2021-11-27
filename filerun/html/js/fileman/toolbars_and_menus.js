FR.initToolbar = function() {
	/* Labels */
	var labels = [{text: FR.T('No label'), handler: function(item){FR.actions.setLabel('');}}];
	FR.labels.each(function(label) {
		labels.push({
			text: '<span style="color:'+label.color+';">'+label.text+'</span>', labelInfo: label,
			handler: function(item) {
				FR.actions.setLabel(label.text+'|'+label.color);
			}
		});
	});
	labels.push('-');
	labels.push({
		text: FR.T('Custom label')+'..',
		handler: function() {return false;},
		menu: new Ext.menu.ColorMenu({
			allowReselect: true,
			colors: [
				'000000', '00008B', '0000FF', '8B008B', '8A2BE2', '4682B4', '1E90FF',
				'00FFFF', '006400', '008000', '008B8B', '00FF00', '7FFF00', 'FF0000', 'DC143C',
				'A52A2A', 'FF1493', 'FF4500', 'FF8C00', 'FFFF00', '808080'
			], height: 62,
			handler: function(cm, color){
				new Ext.ux.prompt({
					title: FR.T('Custom label'),
					text: FR.T('Please type the %1label\'s text%2').replace('%1', '<div class="FRLabel" style="background-color:#'+color+';">').replace('%2', '</div>'),
					defaultValue: FR.T('New label'),
					confirmHandler: function(text) {FR.actions.setLabel(text+'|#'+color);}
				});
			}
		})
	});

	/* "Open with" and "Create" items */
	var createNewFileItems = [];
	Ext.each(FR.customActions, function(ca) {
		if (ca.createNew) {
			var show = true;
			Ext.each(ca.requiredUserPerms, function(perm) {
				if (!User.perms[perm]) {show = false;}
			});
			if (show) {
				var menu = false;
				var handler = function() {return FR.actions.createNew(ca);};
				if (ca.createNew.options) {
					menu = [];
					Ext.each(ca.createNew.options, function(o) {
						menu.push({
							text: o.title, icon: o.icon, iconCls: o.iconCls,
							handler: function() {return FR.actions.createNew(ca, o.fileName);}
						});
					});
					handler = function() {return false;};
				}
				createNewFileItems.push(new Ext.Action({
					text: FR.T(ca.createNew.title), icon: ca.icon, iconCls: ca.iconCls,
					handler: handler, menu: menu
				}));
			}
		}
	});


	FR.UI.actions = {
		toggleTree: new Ext.Button({
			iconCls: 'fa fa-fw fa-folder-open', cls: 'fr-btn-tree-toggle', enableToggle: true, hidden: !FR.isMobile,
			toggleHandler: function() {Ext.getCmp('FR-Tree-Region').toggleCollapse();}
		}),
		searchBtn: new Ext.Button({
			iconCls: 'fa fa-fw fa-search', enableToggle: true, style: (Ext.isMobile ? '' : 'margin-left:15px'),
			tooltip: FR.T('Search'), disabled: true,
			toggleHandler: function(btn, pressed) {if (pressed) {FR.UI.searchPanel.open();} else {FR.UI.searchPanel.close();}}
		}),
		downloadCart: new Ext.Button({
			iconCls: 'fa fa-fw fa-cart-arrow-down', hidden: (!Settings.ui_enable_download_cart || FR.isMobile || !User.perms.download),
			tooltip: FR.T('Download cart'),
			menu: [FR.UI.cart = new FR.components.cartPanel()],
			listeners: {render: function() {FR.UI.cart.attachToComponent(this);}}
		}),
		logout: new Ext.Action({
			text: FR.T('Sign out'),
			iconCls: 'fa-sign-out',
			handler:function(){document.location.href = FR.logoutURL;},
			hidden: Settings.hideLogout
		}),
		cpanel: new Ext.Action({
			text: FR.isMobile ? FR.T('Control Panel') : false,
			iconCls: 'fa fa-fw fa-cog',
			tooltip: FR.T('Control Panel'),
			handler:function() {FR.actions.openControlPanel();}, hidden: (!User.isAdmin && !User.isIndep)
		}),
		help: new Ext.Action({
			iconCls: 'fa fa-fw fa-question',
			tooltip: FR.T('Help'),
			handler:function(){
				FR.UI.popup({src: Settings.helpURL, noId:1});
			}, hidden: (FR.isMobile || !Settings.helpURL)
		}),
		createNewFolder: new FR.ContextAction({
			text: FR.T('Folder'), iconCls: 'fa-folder icon-silver',
			action: 'newFolder', noContext: true
		}),
		fileRequest: new FR.ContextAction({
			text: FR.T('File request'), iconCls: 'fa-inbox-in', hidden: !User.perms.weblink,
			action: 'newFileRequest', noContext: true
		}),
		filePick: new Ext.Action({
			text: (FR.isMobile ? false : 'Select'), iconCls: 'fa fa-fw fa-check', cls: (FR.isMobile ? false : 'fr-btn-primary fr-btn-file-picker'),
			hidden: true,
			tooltip: FR.T('Select file'),
			handler: function() {
				var a = FR.UI.contextActions[FR.filePicker];
				if (a) {
					var item = FR.UI.gridPanel.getOneSel();
					FR.actions.customAction(a.settings, item.data.path, item.data.name);
				}
			}
		}),
		download: new FR.ContextAction({
			iconCls: 'fa fa-fw fa-download', hidden: true,
			tooltip: FR.T('Download'),
			action: 'download', noContext: true
		}),
		preview: new FR.ContextAction({
			iconCls: 'fa fa-fw fa-eye', hidden: true,
			tooltip: FR.T('Preview'),
			action: 'preview', noContext: true
		}),
		weblink: new FR.ContextAction({
			iconCls: 'fa fa-fw fa-link', hidden: true,
			tooltip: FR.T('Get link'),
			action: 'weblink', noContext: true
		}),
		shareWithUsers: new FR.ContextAction({
			iconCls: 'fa fa-fw fa-user-plus', hidden: true,
			tooltip: FR.T('Share with users'),
			action: 'shareWithUsers', noContext: true
		}),
		remove: new FR.ContextAction({
			iconCls: 'fa fa-fw fa-trash-alt', hidden: true,
			tooltip: FR.T('Remove'),
			action: 'remove', noContext: true
		}),
		more: new Ext.Button({
			iconCls: 'fa fa-fw fa-ellipsis-v',
			tooltip: FR.T('More options'),  enableToggle: true,
			toggleHandler: function(btn, toggled) {
				var cm = FR.UI.contextMenu;
				if (toggled) {
					FR.UI.gridPanel.showContextMenu(this.el);
				} else {
					cm.hide();
				}
			}
		}),
		refresh: new FR.ContextAction({
			iconCls: 'fa fa-fw fa-refresh', hidden: true,
			tooltip: FR.T('Refresh'), cls: 'fr-btn-refresh',
			action: 'refresh', noContext: true
		}),
		moreSep: new Ext.Toolbar.Separator({hidden: FR.isMobile}),
		sortItems: new Ext.Button({
			iconCls: 'fa fa-fw fa-sort',
			tooltip: FR.T('Sort'), hidden: true,
			enableToggle: true, toggleHandler: function(btn, toggled) {
				var hd = FR.UI.gridPanel.getView().mainHd;
				if (toggled) {
					hd.setStyle('display', 'block');
					FR.UI.feedback(FR.T('Use the displayed header bar to sort by the desired field.'));
				} else {
					hd.setStyle('display', 'none');
				}
			}
		}),
		info: new Ext.Button({
			iconCls: 'fa fa-fw fa-info-circle', enableToggle: true, pressed: !FR.isMobile,
			tooltip: FR.T((User.perms.file_history)?'Details and activity':'Details'),
			toggleHandler: function(btn, toggled) {
				if (toggled) {
					FR.UI.infoPanel.customExpand();
				} else {
					FR.UI.infoPanel.customCollapse();
				}
			}
		}),
		toggleViewList: new Ext.Action({
			iconCls: FR.UI.getViewIconCls(), cls: 'fr-btn-toggle-view',
			tooltip: FR.T('Display mode'),
			menu: {
				defaults: {
					handler: function() {FR.UI.gridPanel.view.changeMode(this.mode, true);}
				},
				items: [
					{iconCls: 'fa-list', text: FR.T('Detailed list'), mode: 'list'},
					{iconCls: 'fa-th', text: FR.T('Thumbnails'), mode: 'thumbnails'},
					{xtype: 'tbseparator', hidden: (!Settings.media_folders_photos && !Settings.media_folders_videos && !Settings.media_folders_music)},
					{iconCls: 'fa-picture-o', text: FR.T('Photos'), mode: 'photos', hidden: !Settings.media_folders_photos},
					{iconCls: 'fa-video-camera', text: FR.T('Videos'), mode: 'videos', hidden: !Settings.media_folders_videos},
					{iconCls: 'fa-music', text: FR.T('Music'), mode: 'music', hidden: !Settings.media_folders_music}
				]
			}
		}),
		profileSettings: new Ext.Action({
			text: FR.T('Account settings'), iconCls: 'fa-address-card', hidden: !User.perms.account_settings,
			handler: function() {FR.actions.openAccountSettings();}
		})
	};

	var logoHTML = '';
	if (Settings.ui_user_logo.length > 0) {
		logoHTML = FR.UI.getImageLogo(Settings.ui_user_logo);
	} else {
		if (Settings.ui_title_logo) {
			logoHTML = FR.UI.getTextLogo(Settings.title);
		} else if (Settings.ui_logo_url) {
			logoHTML = FR.UI.getImageLogo(Settings.ui_logo_url);
		}
	}
	FR.UI.actions.logo = new Ext.Toolbar.TextItem({text: logoHTML});

	var newBtn = {
		text: (FR.isMobile ? false : FR.T('New')), iconCls: 'fa fa-fw fa-plus', cls: (FR.isMobile ? false : 'fr-btn-new'),
		hidden: !User.perms.upload, disabled: true
	};
	newBtn.menu = [
		FR.UI.actions.createNewFolder,
		'-',
		{text: FR.T('File upload'), iconCls: 'fa-file-upload', handler: function() {FR.actions.upload('files');}},
		{text: FR.T('Folder upload'), iconCls: 'fa-folder-upload', handler: function() {FR.actions.upload('folder');}},
		{xtype: 'menuseparator', hidden: !User.perms.weblink},
		FR.UI.actions.fileRequest
	];
	if (createNewFileItems.length > 0) {
		newBtn.menu.push('-');
		newBtn.menu.push(createNewFileItems);
	}
	FR.UI.actions.newItem = new Ext.Button(newBtn);
	var menuItems = [FR.UI.actions.profileSettings, FR.UI.actions.logout];
	if (FR.isMobile) {
		menuItems.unshift(FR.UI.actions.cpanel);
	}
	FR.UI.actions.user = new Ext.Button({
		cls: 'fr-btn-user',
		tooltip: User.fname,
		overflowText: User.fname,
		icon: FR.baseURL+'/a/?uid='+User.id,
		menu: menuItems
	});

	var ua = FR.UI.actions;
	/* Header toolbar */
	var items = [
		ua.logo,
		ua.toggleTree,
		ua.newItem,
		ua.searchBtn,
		ua.downloadCart,
		'->',
		ua.filePick,
		ua.download,
		ua.preview,
		ua.weblink,
		ua.shareWithUsers,
		ua.remove,
		ua.more,
		ua.moreSep
	];
	if (!FR.isMobile) {
		items.push(ua.cpanel);
	}
	items = items.concat([
		ua.help,
		ua.user
	]);
	FR.UI.headerTBar = new Ext.Toolbar({
		height: (Settings.ui_theme == 'one' ? 50 : 64), plain: true, cls: 'headerTbar x-unselectable', items: items,
		enableOverflow: FR.isMobile
	});


	FR.UI.contextActions = {};
	var a = FR.UI.contextActions;
	a.newOpt = new FR.ContextAction({
		text: FR.T('New'), iconCls: 'fa-plus', requires: ['empty',  function() {
			return !FR.UI.gridPanel.view.searchMode;
		}, 'create'], menu: newBtn.menu
	});
	a.newFolder = new FR.ContextAction({
		text: FR.T('New sub-folder'), iconCls: 'fa-folder', action: 'newFolder', requires: ['non-empty', 'in-tree', 'create']
	});
	a.refresh = new FR.ContextAction({
		text: FR.T('Refresh'), iconCls: 'fa-refresh', action: 'refresh', requires: ['empty']
	});
	a.selectAll = new FR.ContextAction({
		text: FR.T('Select All'), iconCls: 'fa-check-circle', action: 'selectAll', requires: ['empty', function () {return !FR.currentSectionIsVirtual;}, function() {return FR.UI.gridPanel.store.getCount();}]
	});
	a.locate = new FR.ContextAction({
		text: FR.T('Locate'), iconCls: 'fa-crosshairs', action: 'locate', requires: ['single', 'in-grid', 'not-virtual', {skip_sections: ['trash', 'userWithShares', 'sharedFolder']}, function() {
			return FR.currentSection != 'myfiles' || FR.UI.gridPanel.view.searchMode;
		}]
	});

	a.download = new FR.ContextAction({
		text: FR.T('Download'), iconCls: 'fa-download',
		action: 'download', requires: ['non-empty', {skip_sections: ['trash']}, 'download', function(cm) {
			if (!User.perms.download_folders) {
				if ((cm.location == 'tree') || FR.UI.gridPanel.selectionHasFolders()) {
					return false;
				}
			}
			return true;
		}]
	});
	a.preview = new FR.ContextAction({
		text: FR.T('Preview'), iconCls: 'fa-eye',
		action: 'preview', requires: ['single', 'file', {skip_sections: ['trash']}, 'preview']
	});
	a.edit = new FR.ContextAction({
		text: FR.T('Edit'), iconCls: 'fa-edit',
		action: 'edit', requires: ['single', 'file', {skip_sections: ['trash']}, function(cm) {
			return FR.utils.isEditable(cm.target[0]);
		}]
	});

	var openWithItems = [];
	Ext.each(FR.customActions, function(ca) {
		var a = {
			action: 'customAction', isOpenWithItem: true, text: ca.title, icon: ca.icon, iconCls: ca.iconCls, requires: (ca.requires || [])
		};
		if (a.requires.indexOf('multiple') == -1) {a.requires.push('single');}
		if (!ca.folder) {a.requires.push('file');}
		if (ca.extensions) {
			a.requires.push(function(cm, opt) {
				return (opt.settings.extensions.indexOf(cm.target[0].ext) != -1);
			});
			if (ca.replaceDoubleClickAction) {
				Ext.each(ca.extensions, function(ext) {
					FR.ext[ext] = ca.actionName;
				});
			}
		}
		if (ca.useWith) {
			a.requires.push(function(cm, opt) {
				return (opt.settings.useWith.indexOf(cm.target[0].filetype) != -1);
			});
		}
		FR.UI.contextActions[ca.actionName] = new FR.ContextAction(a);
		FR.UI.contextActions[ca.actionName].settings = ca;
		openWithItems.push(FR.UI.contextActions[ca.actionName]);
	});
	a.openWith = new FR.ContextAction({
		text: FR.T('Open with..'), menu: {items: openWithItems}, requires: ['non-empty', 'download', {skip_sections: ['trash', 'collections']}]
	});

	a.label = new FR.ContextAction({
		text: FR.T('Label'), iconCls: 'fa-tag',	menu: {items: labels}, requires: ['non-empty', 'download', 'not-homefolder', 'isNotCollection',
		function() {
			if (!User.perms.read_comments || !User.perms.write_comments) {return false;}
			if (FR.currentSection == 'sharedFolder') {return FR.currentFolderPerms.comment;}
			return true;
		}]
	});
	a.addTags = new FR.ContextAction({
		text: FR.T('Add tags'), iconCls: 'fa-hashtag', action: 'addTags', requires: ['alter', {skip_sections: ['trash', 'collections']},
			function(cm) {return User.perms.metadata && cm.target.length > 1;}
		]
	});
	a.addTags2 = new FR.ContextAction({
		text: FR.T('Tag files'), iconCls: 'fa-hashtag', action: 'addTags', requires: ['alter', {skip_sections: ['trash', 'collections']},
			function(cm) {return User.perms.metadata && cm.target.length == 0;},
			function() {return FR.UI.gridPanel.store.getCount();}
		]
	});
	a.addToCollection = new FR.ContextAction({
		text: FR.T('Collection..'), action: 'addToCollection', requires: [
			function() {return Settings.ui_enable_collections;},
			function() {return !User.perms.read_only;},
			'non-empty', 'not-homefolder', 'download', {skip_sections: ['sharedFolder', 'userWithShares']}
		],
		iconCls: 'fa-archive', isAddToItem: true
	});
	a.addStar = new FR.ContextAction({
		text: FR.T('Starred'), iconCls: 'fa-star', action: 'addStar',
		requires: [
			'non-empty', {skip_sections: ['trash']}, 'not-homefolder', 'not-virtual', 'not-readonly',
			function() {return User.perms.download;},
			{skip_sections: ['starred']},
			function(cm) {
				if (cm.location == 'grid') {
					var countStarred = 0;
					Ext.each(cm.target, function (t) {if (t.star) {countStarred++;}});
					if (countStarred == 0 || (countStarred > 0 && countStarred < cm.target.length)) {
						return true;
					}
				} else {
					var t = cm.target.attributes;
					if (t.section == 'myfiles' || t.section == 'sharedFolder') {
						return (!t.custom || (t.custom && !t.custom.star));
					}
				}
			}
		], isAddToItem: true
	});
	a.removeStar = new FR.ContextAction({
		text: FR.T('Remove star'), iconCls: 'fa-star-o', action: 'removeStar',
		requires: [
			'non-empty', {skip_sections: ['trash']}, 'not-readonly',
			function() {return User.perms.download;},
			function(cm) {
				if (cm.location == 'grid') {
					if (FR.currentSection == 'starred') {return true;}
					var countStarred = 0;
					Ext.each(cm.target, function (t) {if (t.star) {countStarred++;}});
					if (countStarred > 0) {
						return true;
					}
				} else {
					var t = cm.target.attributes;
					if (t.section == 'myfiles' || t.section == 'sharedFolder') {
						return (t.custom && t.custom.star);
					}
				}
			}
		]
	});

	a.metadata = new FR.ContextAction({
		text: FR.T('Metadata'), iconCls: 'fa-sticky-note', action: 'metadata', requires: ['single', 'not-homefolder', 'download', 'isNotCollection', function() {return (User.perms.metadata);}],
		isMoreOptItem: true
	});
	a.rename = new FR.ContextAction({
		text: FR.T('Rename'), iconCls: 'fa-i-cursor', action: 'rename',
		requires: ['non-empty', {skip_sections: ['trash']}, 'not-homefolder', 'single', 'alter', function (cm) {
			if (cm.location == 'tree' && cm.target.attributes.section == 'collections') {
				return false;
			}
			return true;
		}]
	});
	a.restore = new FR.ContextAction({
		text: FR.T('Restore'), iconCls: 'fa-undo',
		action: 'restore', requires: ['non-empty', 'alter', {sections: ['trash']}]
	});

	a.remove = new FR.ContextAction({
		text: FR.T('Remove'), iconCls: 'fa-trash-alt',
		action: 'remove', requires: ['non-empty', 'not-homefolder', 'alter', 'isNotCollection', function (cm) {
			if (cm.location == 'tree' && cm.target.attributes.section == 'collections') {
				return false;
			}
			return true;
		}]
	});
	a.emptyTrash = new FR.ContextAction({
		text: FR.T('Empty trash'), iconCls: 'fa-trash', action: 'emptyTrash', requires: [{sections: ['trash']}]
	});
	a.weblink = new FR.ContextAction({
		text: FR.T('Web link'), iconCls: 'fa-link', action: 'weblink', requires: ['single', 'non-empty', 'not-homefolder', 'download', 'weblink'],
		isShareItem: true
	});
	a.shareWithUsers = new FR.ContextAction({
		text: FR.T('With users'), iconCls: 'fa-user-plus', action: 'shareWithUsers', requires: [
			'non-empty', 'download', 'share', 'isNotCollection'
		],
		isShareItem: true
	});
	a.email = new FR.ContextAction({
		text: FR.T('E-mail'), iconCls: 'fa-envelope-o', action: 'email', requires: ['non-empty', 'not-homefolder', 'download', 'email', 'isNotCollection'],
		isShareItem: true
	});
	a.share = new FR.ContextAction({
		text: FR.T('Share'), iconCls: 'fa-share-alt',
		menu: [a.weblink, a.shareWithUsers, a.email]
	});
	a.getInternalLink = new FR.ContextAction({
		text: FR.T('Copy direct link'), iconCls: 'fa-link', action: 'getInternalLink', requires: ['single', 'non-empty', 'not-virtual', {sections: ['myfiles', 'sharedFolder', 'media', 'shares', 'webLinked']}],
		isMoreOptItem: true
	});
	a.notifications = new FR.ContextAction({
		text: FR.T('Notifications'), iconCls: 'fa-bell', requires: ['single', 'folder', {sections: ['myfiles', 'userWithShares', 'sharedFolder', 'collection']}, 'isNotCollection',  function() {return Settings.allow_folder_notifications;}
		],
		menu: {
			listeners: {
				'beforeshow': function() {
					var nfo;
					var cm = FR.UI.contextMenu;
					if (cm.location == 'tree') {
						var tn = cm.target.attributes;
						if (tn.custom && tn.custom.notInfo) {
							nfo = tn.custom.notInfo;
						}
					} else {
						nfo = cm.target[0].notInfo;
					}
					if (!nfo) {nfo = {w: 0, s: 0, r: 0, m: 0};}
					this.items.first().getForm().setValues(nfo, true);
				}
			},
			items: [
				{
					xtype: 'form',
					style: 'padding:10px 15px 0 15px',
					bodyStyle: 'padding-bottom:5px',
					defaults: {
						xtype: 'checkbox', hideLabel: true,
						listeners: {
							'check': function(box, checked) {
								var formPanel = this.ownerCt.body;
								formPanel.mask();
								FR.contextMenuActions.saveNotif(this.ownerCt.items, function() {
									formPanel.unmask();
								});
							}
						}
					},
					items: [
						{xtype: 'displayfield', value: FR.T('Receive notifications on:'), style: 'color:gray;padding-bottom:10px'},
						{boxLabel: FR.T('New files'), name: 'w'},
						{boxLabel: FR.T('New comments and labels'), name: 's'},
						{boxLabel: FR.T('Downloads and previews'), name: 'r'},
						{boxLabel: FR.T('Other actions'), name: 'm'}
					]
				}
			]
		},
		isMoreOptItem: true
	});
	a.props = new FR.ContextAction({
		text: FR.T('Control Panel'), iconCls: 'fa-cogs', action: 'props', requires: [
			function (){return User.isAdmin;}, 'single', 'not-virtual',
			function(cm) {
				if (['recent', 'myfiles', 'userWithShares', 'sharedFolder', 'starred', 'shares', 'webLinked', 'collection', 'media'].indexOf(cm.section) != -1) {
					return !(cm.location == 'tree' && ['myfiles', 'sharedFolder'].indexOf(cm.section) == -1);
				}
			}
		], isMoreOptItem: true
	});
	a.copyMove = new FR.ContextAction({
		text: FR.T('Copy')+'/'+FR.T('Move')+'..', action: 'copyOrMove', requires: ['non-empty', 'isNotCollection', {skip_sections: ['trash']}, 'not-homefolder', 'download', function() {return !User.perms.read_only;}]
	});
	a.alog = new FR.ContextAction({
		text: FR.T('Activity log'), iconCls: 'fa-book', action: 'activityLog', requires: [
			'single', 'not-virtual',
			function(cm) {
				if (!User.perms.file_history) {return false;}
				if (cm.section == 'sharedFolder') {
					return Settings.filelog_for_shares;
				}
				if (cm.location == 'tree') {
					if (['myfiles', 'sharedFolder'].indexOf(cm.section) == -1) {
						return false;
					}
					if (cm.target.attributes.homefolder) {return false;}
				}
				return true;
			}
		], isMoreOptItem: true
	});
	a.zip = new FR.ContextAction({
		text: FR.T('Zip archive..'), iconCls: 'fa-file-zip-o', action: 'zip', requires: ['non-empty', 'not-homefolder', 'create', 'download', 'alter', function(cm){
			if (cm.target.length == 1 && cm.target[0].filetype == 'arch') {return false;}
			if (cm.location == 'tree') {
				return User.perms.download_folders;
			} else {
				return !(cm.target.length == 1 && cm.target[0].isFolder && !User.perms.download_folders);
			}
		}],
		isAddToItem: true
	});
	a.extract = new FR.ContextAction({
		text: FR.T('Extract archive..'), action: 'extract', requires: ['file', 'single', 'download', 'create', function(cm){return (cm.target[0].filetype == 'arch');}],
		isAddToItem: true
	});
	a.unweblink = new FR.ContextAction({
		text: FR.T('Remove Web Links'), iconCls: 'fa-unlink', action: 'unweblink', requires: ['non-empty', 'in-grid', {sections: ['webLinked']}]
	});
	a.removeFromCollection = new FR.ContextAction({
		text: FR.T('Remove from collection'), iconCls: 'fa-minus-circle', action: 'removeFromCollection', requires: ['non-empty', 'in-grid', 'not-readonly', {sections: ['collection']}
		]
	});
	a.removeCollections = new FR.ContextAction({
		text: FR.T('Remove'), iconCls: 'fa-minus-circle', action: 'removeCollections',
		requires: ['non-empty', 'not-readonly', 'isCollection']
	});
	a.lock = new FR.ContextAction({
		text: FR.T('Lock'),	iconCls: 'fa-lock', action: 'lock', requires: ['alter', 'download', 'file', function() {return (!Settings.free_mode && !Settings.freelancer_mode);}]
	});
	a.unlock = new FR.ContextAction({
		text: FR.T('Unlock'), iconCls: 'fa-unlock-alt', action: 'unlock', requires: ['alter', 'download', 'file', function() {return (!Settings.free_mode && !Settings.freelancer_mode);}]
	});
	a.versioning = new FR.ContextAction({
		text: FR.T('Versioning'), iconCls: 'fa-history', requires: ['single', 'file', {skip_sections: ['trash']}, 'download', function() {
			return !Settings.disable_versioning;
		}],
		isMoreOptItem: true,
		menu: new Ext.menu.Menu({
			id: 'myfiles-contextmenu-versioning',
			items: [
				new Ext.menu.Item({
					text: FR.T('Previous Versions'),
					handler: function() {return FR.actions.openVersions();},
					hidden: Settings.disable_versioning
				}),
				a.lock, a.unlock
			]
		})
	});
	a.addTo = new FR.ContextAction({
		text: FR.T('Add to'),
		menu: [a.addStar, a.addToCollection, a.zip]
	});
	a.more = new FR.ContextAction({
		text: FR.T('More options'),
		menu: [a.getInternalLink, a.metadata, a.versioning, a.notifications, a.alog, a.props]
	});

	a.s = new Ext.menu.Separator();
	a.s0 = new Ext.menu.Separator();
	a.s1 = new Ext.menu.Separator();
	a.s2 = new Ext.menu.Separator();
	a.s3 = new Ext.menu.Separator();
	a.s4 = new Ext.menu.Separator();
	a.s5 = new Ext.menu.Separator();
	a.s6 = new Ext.menu.Separator();
	FR.UI.contextMenu = new FR.components.ContextMenu({
		items: [
			a.newOpt, a.newFolder,
				a.s0,
			a.locate, a.refresh, a.selectAll,
				a.s1,
			a.addTags2, a.unweblink, a.removeFromCollection,
				a.s2,
			a.download, a.preview, a.edit, a.openWith,
				a.s3,
			a.share, a.label, a.addTags,
				a.s4,
			a.addTo, a.copyMove, a.removeStar, a.extract, a.restore,
				a.s5,
			a.more, a.rename,
				a.s6,
			a.remove, a.removeCollections, a.emptyTrash
		],
		listeners: {
			hide: function() {
				FR.UI.actions.more.toggle(false, true);
			}
		}
	});
	FR.UI.navBar = new Ext.ux.NavBar({height:40});
	FR.UI.gridToolbar = new Ext.Toolbar({
		cls: 'fr-nav-bar',
		items: [
			FR.UI.navBar,
			'->',
			ua.refresh,
			ua.sortItems,
			ua.toggleViewList,
			ua.info
		]
	});
};

FR.components.ContextMenu = Ext.extend(Ext.menu.Menu, {
	target: false, location: false, section: false, countVisible: 0, reqChecks: new Ext.util.MixedCollection(),
	getTargetFileInfo: function() {
		if (this.target.length == 0) {
			return {path: FR.currentPath, filename: FR.UI.currentFolderTitle};
		}
		if (this.location == 'tree') {
			return {path: this.target.getPath('pathname'), filename: this.target.text};
		}
		if (this.target.length > 1) {
			return {paths: FR.UI.gridPanel.getSelectedAttrs('path')};
		}
		return {path: this.target[0].path, filename: this.target[0].filename};
	},
	event: function(opts) {
		Ext.apply(this, opts);
		this.prepareItems();
		if (this.countVisible > 0) {
			if (opts.alignTo) {
				this.show(opts.alignTo);
			} else {
				this.showAtCursor();
			}
		}
	},
	showSeparators: function() {
		var visible = new Ext.util.MixedCollection();
		if (!this.countVisible) {return;}
		this.items.each(function(item) {
			if (item.getXType() == 'menuseparator' || !item.hidden) {
				visible.add(visible.getCount(), item);
			}
		});

		var lastShown, visibleBefore = 0;
		visible.each(function(item, index, length) {
			if (item.getXType() == 'menuseparator') {
				if (visibleBefore && (!lastShown || lastShown && lastShown.getXType() != 'menuseparator')) {
					item.show();
				}
			} else {
				visibleBefore++;
			}
			lastShown = item;
		});
		if (lastShown.getXType() == 'menuseparator') {lastShown.hide();}
		visible.keySort('DESC');
		visibleBefore = 0;
		visible.each(function(item) {
			if (item.getXType() == 'menuseparator') {
				if (!visibleBefore) {item.hide();}
			} else {
				visibleBefore++;
			}
		});
	},
	prepareItems: function() {
		this.countVisible = 0;
		this.countVisibleOpenWithItems = 0;
		this.countVisibleAddToItems = 0;
		this.countVisibleMoreOptsItems = 0;
		this.countVisibleShareItems = 0;
		this.reqChecks.clear();
		Ext.iterate(FR.UI.contextActions, function(key, item) {
			var show = false;
			if (item.initialConfig.requires) {
				var meets = 0;
				Ext.each(item.initialConfig.requires, function (req) {
					var rs = false;
					var s, t = this.target, a = t.attributes;
					if (this.location == 'grid') {
						s = FR.currentSection;
					} else {
						s = a.section;
					}
					this.section = s;
					var objectType = (this.location == 'tree') ? a.objectType : (t[0] && t[0].objectType);
					var prevReqCheck = false;
					if (typeof req != 'function' && typeof req != 'object') {
						prevReqCheck = this.reqChecks.get(req);
					}
					if (prevReqCheck) {
						rs = prevReqCheck.met;
					} else if (req == 'in-grid') {
						rs = (this.location == 'grid');
					} else if (req == 'in-tree') {
						rs = (this.location == 'tree');
					} else if (req == 'empty') {
						rs = (this.target.length == 0);
					} else if (req == 'non-empty') {
						rs = (this.location == 'tree' || t.length > 0);
					} else if (req == 'single') {
						rs = (this.location == 'tree' || t.length == 1);
					} else if (req == 'multiple') {
						rs = (this.target.length > 1);
					} else if (req == 'file') {
						rs = (this.location == 'grid' && (t[0] && !t[0].isFolder));
					} else if (req == 'folder') {
						rs = (this.location == 'tree' || (t[0] && t[0].isFolder));
					} else if (req == 'isCollection') {
						rs = (objectType == 'collection');
					} else if (req == 'isNotCollection') {
						rs = (objectType != 'collection');
					} else if (req == 'isNotVirtual') {
						rs = (objectType != 'virtual');
					} else if (req == 'section-myfiles') {
						rs = (s == 'myfiles');
					} else if (req == 'not-homefolder') {
						rs = (this.location == 'grid' || (this.location == 'tree' && !a.homefolder));
					} else if (req == 'not-virtual') {
						if (this.location == 'tree') {
							if (!a.virtual) {
								rs = true;
							}
						} else {
							if (!FR.currentSectionIsVirtual) {
								rs = true;
							}
						}
					} else if (req == 'create') {
						if (User.perms.upload) {
							if (['myfiles', 'sharedFolder'].indexOf(s) != -1) {
								if (this.location == 'tree') {
									if (!a.perms || (a.perms && a.perms.upload)) {
										rs = true;
									}
								} else {
									rs = !(FR.currentFolderPerms && !FR.currentFolderPerms.upload);
								}
							}
						}
					} else if (req == 'weblink') {
						if (User.perms.weblink) {
							if (this.location == 'tree') {
								if (!a.perms || (a.perms && a.perms.share)) {
									rs = true;
								}
							} else {
								rs = !(FR.currentFolderPerms && !FR.currentFolderPerms.share);
							}
						}
					} else if (req == 'share') {
						if (User.perms.share) {
							if (['sharedFolder', 'userWithShares'].indexOf(s) == -1) {
								if (this.location == 'tree') {
									rs = (!a.perms || (a.perms && a.perms.share));
								} else {
									rs = (!FR.currentFolderPerms || FR.currentFolderPerms.share);
								}
							}
						}
					} else if (req == 'email') {
						if (User.perms.email) {
							if (this.location == 'tree') {
								if (!a.perms || (a.perms && a.perms.share)) {
									rs = true;
								}
							} else {
								rs = !(FR.currentFolderPerms && !FR.currentFolderPerms.share);
							}
						}
					} else if (req == 'preview') {
						rs = User.perms.preview;
					} else if (req == 'download') {
						if (User.perms.download) {
							if (this.location == 'tree') {
								if (['myfiles', 'collection'].indexOf(s) != -1) {
									rs = true;
								} else if (s == 'sharedFolder') {
									if (a.perms.download) {
										rs = true;
									}
								}
							} else {
								if (['recent', 'myfiles', 'starred', 'shares', 'recent', 'webLinked', 'search', 'userWithShares', 'collection'].indexOf(s) != -1) {
									rs = true;
								} else if (FR.currentFolderPerms && FR.currentFolderPerms.download) {
									rs = true;
								}
							}
						}
					} else if (req == 'alter') {
						if (!User.perms.read_only) {
							if (['myfiles', 'collection', 'collections'].indexOf(s) != -1) {
								rs = true;
							} else {
								if (this.location == 'tree') {
									if (s == 'sharedFolder') {
										rs = a.perms.alter;
									}
								} else {
									if (!FR.currentSectionIsVirtual) {
										rs = !(FR.currentFolderPerms && !FR.currentFolderPerms.alter);
									}
								}
							}
						}
					} else if (req == 'not-readonly') {
						rs = !User.perms.read_only;
					} else if (typeof req == 'object') {
						if (req.sections) {
							if (req.sections.indexOf(s) != -1) {
								rs = true;
							}
						} else if (req.skip_sections) {
							if (req.skip_sections.indexOf(s) == -1) {
								rs = true;
							}
						}
					} else if (typeof req == 'function') {
						rs = req(this, item);
					} else {
						rs = true;
					}
					if (typeof req != 'function' && typeof req != 'object') {
						this.reqChecks.add(req, {met: rs});
					}
					if (rs) {
						meets++;
					} else {
						return false;
					}
				}, this);

				if (item.initialConfig.requires.length == meets) {
					show = true;
					if (item.initialConfig.isOpenWithItem) {
						this.countVisibleOpenWithItems++;
					}
					if (item.initialConfig.isAddToItem) {
						this.countVisibleAddToItems++;
					}
					if (item.initialConfig.isMoreOptItem) {
						this.countVisibleMoreOptsItems++;
					}
					if (item.initialConfig.isShareItem) {
						this.countVisibleShareItems++;
					}
				}
			}
			if (show) {
				item.show();
				this.countVisible++;
			} else {
				item.hide();
			}
		}, this);
		FR.UI.contextActions.openWith.setHidden((this.countVisibleOpenWithItems == 0));
		FR.UI.contextActions.addTo.setHidden((this.countVisibleAddToItems == 0));
		FR.UI.contextActions.more.setHidden((this.countVisibleMoreOptsItems == 0));
		FR.UI.contextActions.share.setHidden((this.countVisibleShareItems == 0));
		this.showSeparators();
	},
	showAtCursor: function() {
		this.showAt([FR.UI.xy[0]+2, FR.UI.xy[1]+2]);
	}
});
FR.ContextAction = Ext.extend(Ext.Action, {
	constructor: function(config){
		if (config.action) {
			config.handler = function (t, e) {
				FR.UI.actions.more.toggle(false, true);
				return FR.contextMenuActions[this.initialConfig.action](this.initialConfig.noContext ? false : FR.UI.contextMenu, this, e);
			};
			config.scope = this;
		} else {if (!config.handler){config.handler = function () {return false;}}}
		this.initialConfig = config;
		this.itemId = config.itemId = (config.itemId || config.id || Ext.id());
		this.items = [];
	}
});