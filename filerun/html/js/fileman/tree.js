FR.initTree = function() {
	var t = new Ext.tree.TreePanel({
		id: 'FR-Tree-Panel', region: 'center',
		enableDD: !User.perms.read_only, ddGroup: 'TreeDD', dropConfig: {appendOnly:true, containerScroll: true},
		animate: true, autoScroll: true, rootVisible: false,
		listeners: {
			'afterrender': function () {
				if (User.perms.upload) {
					FlowUtils.DropZoneManager.add({
						domNode: this.el.dom, overClass: 'x-tree-drag-append',
						findTarget: function (e) {
							var el = Ext.get(e.target);
							if (el && !el.hasClass('x-tree-node-el')) {el = el.parent('div.x-tree-node-el');}
							if (!el) {return false;}
							var treeNodeId = el.getAttribute('tree-node-id', 'ext');
							if (!treeNodeId) {return false;}
							var treeNode = FR.UI.tree.panel.getNodeById(treeNodeId);
							if (!treeNode) {return false;}
							if (['myfiles', 'sharedFolder'].indexOf(treeNode.attributes.section) != -1) {
								if (!treeNode.attributes.perms || treeNode.attributes.perms.upload) {
									return {el: el.dom, node: treeNode};
								}
							}
						},
						onDrop: function (e, target) {
							FR.UI.showUploadWindow({
								targetPath: target.node.getPath('pathname'),
								targetText: target.node.text,
								dropEvent: e
							});
						},
						scope: FR
					});
				}

				if (User.perms.alter) {
					this.on('nodedragover', function (e) {
						var a = e.target.attributes;
						if (
							FR.currentSection == 'trash' ||
							['myfiles', 'sharedFolder', 'collection'].indexOf(a.section) === -1 ||
							(e.dropNode && e.dropNode.attributes.readonly) ||
							(a.perms && (!a.perms.alter && !a.perms.upload)) ||
							(e.target.getPath('pathname') == FR.currentPath)
						) {
							e.cancel = true;
							return false;
						}
					});

					this.on('beforenodedrop', function (drop) {
						var p = drop.target.getPath('pathname');
						if (drop.target.attributes.section == 'collection') {
							FR.actions.addToCollection({targetPath: p});
						} else {
							FR.actions.move(drop, p);
						}
						return false;
					});
				}
			}
		}
	});
	t.getSelectionModel().on('beforeselect', function(selectionModel, treeNode) {
		if (treeNode.attributes.pathname === false) {return false;}
	});

	var r = new Ext.tree.TreeNode({pathname: 'ROOT'}),
		loader, node,
		asyncNode = FR.components.AsyncTreeNode,
		tNode = FR.components.TreeNode;

	r.appendChild(new tNode({
		text: FR.T('Recent'), sortInfo: 'server', hidden: !User.perms.file_history,
		iconCls: 'fa-clock-o', pathname: 'RECENT', section: 'recent'
	}));

	if (Settings.has_home_folder) {
		FR.UI.tree.homeFolderNode = r.appendChild(new asyncNode({
			text: FR.T('My Files'), pathname: 'HOME', section: 'myfiles', homefolder: true,
			pid: FR.homeFolderCfg.pid,
			allowDrag: false, allowDrop: !User.perms.read_only,
			custom: FR.homeFolderCfg.customAttr,
			loader: new FR.components.TreeLoader({
				dataUrl: this.getBaseURL + '&page=tree'
			})
		}));

		loader = new FR.components.TreeLoader({
			dataUrl: FR.baseURL + '/?module=collections&page=tree'
		});
		FR.UI.tree.collectionsNode = r.appendChild(new asyncNode({
			text: FR.T('Collections'), pathname: 'Collections', iconCls: 'fa-archive',
			allowDrag: false, allowDrop: false, section: 'collections',
			perms: {download: true, share: true}, hidden: (!Settings.ui_enable_collections || !User.perms.download),
			loader: loader, virtual: true
		}));

		if (Settings.media_folders_photos) {
			node = r.appendChild(new tNode({
				text: FR.T('Photos'), pathname: 'Photos', section: 'media',
				iconCls: 'fa-picture-o', viewMode: (FR.isMobile?'list':'thumbnails'), virtual: true,
				sortInfo: 'server'
			}));
			loader = new FR.components.TreeLoader({
				dataUrl: FR.baseURL + '/?module=photos&page=tree'
			});
			node.appendChild(new tNode({
				text: FR.T('Last taken'), leaf: true, perms: {alter: true, download: true, share: true},
				pathname: 'Latest', viewMode: 'photos', sortInfo: 'server'
			}));
			node.appendChild(new tNode({
				text: FR.T('Last uploaded'), leaf: true, perms: {alter: true, download: true, share: true},
				pathname: 'LatestUploads', viewMode: 'photos', sortInfo: 'server'
			}));
			node.appendChild(new asyncNode({
				text: FR.T('By date'), pathname: 'Date',
				allowDrag: false, allowDrop: false,
				viewMode: (FR.isMobile?'list':'thumbnails'), sortInfo: {field: 'modified', direction: 'DESC', forced: true},
				loader: loader, autoExpand: false, virtual: true
			}));
			node.appendChild(new asyncNode({
				text: FR.T('By tag'), pathname: 'Tags',
				leaf: false, allowDrag: false, allowDrop: false, readonly: true,
				viewMode: (FR.isMobile?'list':'thumbnails'), sortInfo: {field: 'nice_filesize', direction: 'DESC', forced: true},
				loader: loader, autoExpand: false, virtual: true
			}));
		}
		if (Settings.media_folders_videos) {
			loader = new FR.components.TreeLoader({
				dataUrl: FR.baseURL + '/?module=videos&page=tree'
			});
			node = r.appendChild(new tNode({
				text: FR.T('Videos'), iconCls: 'fa-video-camera',
				pathname: 'Videos', viewMode: (FR.isMobile ? 'list':'thumbnails'), section: 'media', virtual: true,
				sortInfo: 'server', perms: {alter: true, download: true, share: true}
			}));
			node.appendChild(new tNode({
				text: FR.T('Last taken'), leaf: true, perms: {alter: true, download: true, share: true},
				pathname: 'Latest', viewMode: 'videos', sortInfo: 'server'
			}));
			node.appendChild(new tNode({
				text: FR.T('Last uploaded'), leaf: true, perms: {alter: true, download: true, share: true},
				pathname: 'LatestUploads', viewMode: 'videos', sortInfo: 'server'
			}));
			node.appendChild(new asyncNode({
				text: FR.T('By date'), pathname: 'Date',
				allowDrag: false, allowDrop: false,
				viewMode: (FR.isMobile?'list':'thumbnails'), sortInfo: {field: 'modified', direction: 'DESC', forced: true},
				loader: loader, autoExpand: false, virtual: true
			}));
			node.appendChild(new asyncNode({
				text: FR.T('By tag'), pathname: 'Tags',
				leaf: false, allowDrag: false, allowDrop: false, readonly: true,
				viewMode: (FR.isMobile?'list':'thumbnails'), sortInfo: {field: 'nice_filesize', direction: 'DESC', forced: true},
				loader: loader, autoExpand: false, virtual: true
			}));
		}
		if (Settings.media_folders_music) {
			node = r.appendChild(new tNode({
				text: FR.T('Music'), iconCls: 'fa-music',
				pathname: 'Music', viewMode: (FR.isMobile?'list':'thumbnails'), virtual: true, section: 'media',
				sortInfo: 'server'
			}));
			node.appendChild(new tNode({
				text: FR.T('Last added'), leaf: true, pathname: 'Latest',
				viewMode: 'music', sortInfo: 'server', perms: {alter: true, download: true, share: true}
			}));
			loader = new FR.components.TreeLoader({
				dataUrl: FR.baseURL + '/?module=music&page=tree'
			});
			node.appendChild(new asyncNode({
				text: FR.T('By artist'), pathname: 'Artists', viewMode: (FR.isMobile?'list':'thumbnails'),
				leaf: false, allowDrag: false, allowDrop: false, readonly: true,
				loader: loader, autoExpand: false, virtual: true,
				sortInfo: 'server'
			}));
			node.appendChild(new asyncNode({
				text: FR.T('By album'), pathname: 'Albums', viewMode: (FR.isMobile?'list':'thumbnails'),
				leaf: false, allowDrag: false, allowDrop: false, readonly: true,
				loader: loader, autoExpand: false, virtual: true
			}));
			node.appendChild(new tNode({
				text: FR.T('Random'), leaf: true, pathname: 'Random',
				viewMode: 'music', sortInfo: 'server', perms: {alter: true, download: true, share: true}
			}));
		}
	}
	loader = new FR.components.TreeLoader({
		dataUrl: FR.getBaseURL+'&page=tree'
	});
	Ext.each(AnonShares, function(fld) {
		r.appendChild(new asyncNode(Ext.apply(fld, {
			readonly: true, allowDrag: false, allowDrop: fld.perms.upload,
			loader: loader, section: 'sharedFolder'
		})));
	});
	Ext.each(Sharing, function(usr) {
		r.appendChild(new asyncNode({
			text: usr.name, pathname: usr.id, section: 'userWithShares',
			uid: usr.id, iconCls: 'avatar',
			allowDrag: false, allowDrop: false,
			loader: loader
		}));
	});
	r.appendChild(new tNode({
		text: FR.T('Starred'), hidden: (User.perms.read_only || !User.perms.download),
		iconCls: 'fa-star', pathname: 'STARRED', section: 'starred'
	}));

	r.appendChild(new tNode({
		text: FR.T('Shared by me'), hidden: (!User.perms.share || !Settings.has_home_folder),
		iconCls: 'fa-user-plus', pathname: 'SHARES', section: 'shares'
	}));

	r.appendChild(new tNode({
		text: FR.T('Shared links'), hidden: !User.perms.weblink,
		iconCls: 'fa-link', pathname: 'WLINKED', section: 'webLinked'
	}));

	FR.UI.tree.trashNode = r.appendChild(new tNode({
		text: FR.T('Trash'), iconCls: 'fa-trash-alt', hidden: (!User.trashCount || User.perms.read_only),
		pathname: 'TRASH', section: 'trash', viewMode: 'list', trashfolder: true
	}));

	t.getSelectionModel().on('selectionchange', function(sm, node) {
		this.currentSelectedNode = node;
		if (!node) {return false;}
		FR.currentFolderPerms = Ext.value(node.attributes.perms, false);
		FR.previousSection = Ext.value(FR.currentSection);
		FR.currentSection = node.attributes.section;
		FR.currentSectionIsVirtual = Ext.isDefined(node.attributes.virtual);
		FR.currentPath = node.getPath('pathname');
		FR.UI.currentFolderTitle = node.text;
		FR.UI.title = node.text;
		document.title = node.text + ' - ' + Settings.title;

		FR.UI.navBar.build(node);

		var gridPanel = FR.UI.gridPanel;
		var a = FR.UI.actions;
		var hasSearch = false;
		if (['myfiles', 'sharedFolder'].indexOf(FR.currentSection) != -1) {
			hasSearch = true;
			if (gridPanel.dropZone) {gridPanel.dropZone.unlock();}
			if (User.perms.upload && (!FR.currentFolderPerms || FR.currentFolderPerms && FR.currentFolderPerms.upload)) {
				a.newItem.enable();
			} else {
				a.newItem.disable();
			}
		} else {
			a.newItem.disable();
			if (gridPanel.dropZone) {gridPanel.dropZone.lock();}
		}
		if (hasSearch) {
			a.searchBtn.enable();
		} else {
			if (gridPanel.view.searchMode) {
				FR.UI.searchPanel.close();
			}
			a.searchBtn.disable();
		}
		if (gridPanel.view.searchMode && hasSearch) {
			FR.UI.searchPanel.push2History();
		} else {
			FR.push2History(FR.currentPath);
		}
		gridPanel.view.changeMode(Ext.value(node.attributes.viewMode, gridPanel.view.defaultViewMode));
		gridPanel.reset();
		var customSortInfo = node.attributes.sortInfo;
		if (customSortInfo && (customSortInfo.forced || customSortInfo == 'server')) {
			gridPanel.store.initialSort = customSortInfo;
		}
		FR.UI.infoPanel.refresh();
		gridPanel.store.loadByPath(FR.currentPath);

		if (!Ext.isDefined(node.attributes.autoExpand) || node.attributes.autoExpand) {
			node.expand();
		}
	}, FR.UI.tree);
	t.on('contextmenu', FR.UI.tree.showContextMenu);

	t.setRootNode(r);

	FR.UI.tree.panel = t;
};

FR.UI.tree.reloadNode = function(node, callback) {
	node.loaded = false;
	node.collapse();
	node.expand(false, true, callback);
};

FR.UI.tree.updateIcon = function(treeNode) {
	treeNode.getUI().updateIcons();
};

FR.UI.tree.showContextMenu = function(node, e) {
	FR.UI.contextMenu.event({
		location: 'tree',
		target: node
	});
	if (e) {e.stopEvent();}
	return false;
};
FR.UI.tree.selectFirstVisible = function() {
	FR.UI.tree.panel.root.eachChild(function(node) {
		if (!node.hidden) {node.select();return false;}
	});
};

FR.components.TreeNode = Ext.extend(Ext.tree.TreeNode, {
	readonly: true, defaultUI: FR.components.TreeNodeCustomUI,
	leaf: false, allowDrag: false, allowDrop: false,
	constructor: function(config) {
		Ext.apply(config, {
			listeners: {
				'append': function(t, thisNode, childNode) {
					if (thisNode.attributes.section && !childNode.attributes.section) {
						childNode.attributes.section = thisNode.attributes.section;
					}
				}
			}
		});
		FR.components.TreeNode.superclass.constructor.call(this, config)
	}
});
Ext.tree.TreePanel.nodeTypes['filerun'] = FR.components.AsyncTreeNode;

FR.components.AsyncTreeNode = Ext.extend(Ext.tree.AsyncTreeNode, {
	defaultUI: FR.components.TreeNodeCustomUI
});
Ext.tree.TreePanel.nodeTypes['filerunAsync'] = FR.components.AsyncTreeNode;
FR.components.TreeLoader = Ext.extend(Ext.tree.TreeLoader, {
	baseAttrs: {uiProvider: FR.components.TreeNodeCustomUI, nodeType: 'filerunAsync', allowDrag: false},
	nodeParameter: null, root: 'items',
	listeners: {
		'beforeload': function(loader, node) {
			loader.baseAttrs.section = node.attributes.section;
			loader.baseParams.path = node.getPath('pathname');
		}
	},
	createNode: function(attr) {
		attr.pathname = Ext.value(attr.pathname, attr.text);
		return FR.components.TreeLoader.superclass.createNode.call(this, attr);
	}
});