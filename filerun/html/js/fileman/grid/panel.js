FR.components.gridPanel = Ext.extend(Ext.grid.GridPanel, {
	highlightOnDisplay: false, highlightOnLoadCallback: false, region: 'center',

	initComponent: function() {
		this.initStore();

		var listeners = {
			'afterrender': function() {
				this.view.scroller.on('scroll', function() {this.loadThumbs.delay(300, false, this);}, this);
				this.setMetaCols();
			},
			'resize': function(grid, width) {
				FR.UI.navBar.setWidth(width-170);
				this.loadThumbs.delay(300, false, this);
			},
			'render': function (grid) {
				if (FR.isMobile) {return false;}

				if (User.perms.alter) {
					this.view.dragZone.onStartDrag = function() {
						Ext.each(this.dragData.selections, function(item) {
							var rowIdx = grid.store.indexOfId(item.id);
							var row = grid.view.getRow(rowIdx);
							Ext.fly(row).addClass('dragging');
						});
					};
					this.view.dragZone.endDrag = function() {
						Ext.each(this.dragData.selections, function(item) {
							var rowIdx = grid.store.indexOfId(item.id);
							var row = grid.view.getRow(rowIdx);
							Ext.fly(row).removeClass('dragging');
						});
					};
					if (User.perms.upload) {
						this.dropZone = new Ext.dd.DropZone(grid.getView().scroller, {
							ddGroup: grid.ddGroup,
							getTargetFromEvent: function (e) {
								var target = e.getTarget(grid.getView().rowSelector);
								if (target) {
									var rowIndex = grid.getView().findRowIndex(target);
									var r = grid.getStore().getAt(rowIndex);
									if (r.data.isFolder) {
										return {rowIndex: rowIndex, record: r};
									}
								}
							},
							onNodeEnter: function (target) {
								Ext.fly(grid.getView().getRow(target.rowIndex)).addClass('dragged-over');
							},
							onNodeOut: function (target) {
								Ext.fly(grid.getView().getRow(target.rowIndex)).removeClass('dragged-over');
							},
							onNodeOver: function (target, dz, e, dropData) {
								if (target.record.data.isFolder) {
									return Ext.dd.DropZone.prototype.dropAllowed;
								}
							},
							onNodeDrop: function (target, dz, e, dropData) {
								var p = target.record.data.path;
								if (FR.currentSection == 'collections') {
									FR.actions.addToCollection({targetPath: p});
								} else {
									if (target.record.data.isFolder) {
										FR.actions.move({data: dropData}, p);
									}
								}
								return true;
							}
						});
					}
				}

				if (User.perms.upload) {
					FlowUtils.DropZoneManager.add({
						domNode: this.getView().scroller.dom, overClass: 'dragged-over',
						findTarget: function(e) {
							if (['myfiles', 'sharedFolder'].indexOf(FR.currentSection) == -1) {
								return false;
							}
							if (FR.currentFolderPerms && !FR.currentFolderPerms.upload) {
								return false;
							}
							var cls,
								p = FR.UI.gridPanel,
								el = Ext.get(e.target);
							if (p.getView().viewMode == 'list') {
								cls = 'x-grid3-row';
							} else {
								cls = 'tmbItem';
							}
							if (el && !el.hasClass(cls)) {el = el.parent('div.'+cls);}
							if (!el) {
								return {el: this.getView().scroller.dom};
							}
							var rowIndex = p.getView().findRowIndex(el.dom);
							var r = p.getStore().getAt(rowIndex);
							if (r.data.isFolder) {
								return {el: el.dom, record: r};
							} else {
								return {el: this.getView().scroller.dom};
							}
						},
						onDrop: function (e, target) {
							var path, folderName;
							if (!target.record) {
								if (
									(FR.currentFolderPerms && !FR.currentFolderPerms.upload) ||
									(FR.currentSection != 'myfiles' && FR.currentSection != 'sharedFolder')
								) {return false;}
								path = FR.currentPath;
								folderName = FR.UI.tree.currentSelectedNode.text;
							} else {
								var r = target.record;
								path = r.data.path;
								folderName = r.data.filename;
							}
							FR.UI.showUploadWindow({
								targetPath: path,
								targetText: folderName,
								dropEvent: e
							});
						},
						scope: this
					});
				}
			},
			scope: this
		};


		listeners.rowtap = function(grid, rowIndex, e) {
			var item = grid.store.getAt(rowIndex);
			if (item) {this.openItem(item);}
			if (FR.isMobile) {
				Ext.getCmp('FR-Tree-Region').collapse();
				Ext.menu.MenuMgr.hideAll();
			}
		};
		if (FR.isMobile) {
			listeners.containertouchend = function(grid, e) {
				Ext.getCmp('FR-Tree-Region').collapse();
				if (e.browserEvent.cancelable) {
					e.stopEvent();
					Ext.menu.MenuMgr.hideAll();
				}
			};
		} else {
			listeners.rowdblclick = function (grid, rowIndex, e) {
				var item = grid.store.getAt(rowIndex);
				if (item) {this.openItem(item);}
				e.stopEvent();
				return false;
			};
			listeners.containercontextmenu = function(p, e) {
				this.selModel.clearSelections();
				this.showContextMenu();
				e.stopEvent();
			};
			listeners.rowcontextmenu = function (grid, rowIndex, e) {
				if (!this.selModel.isSelected(rowIndex)) {
					this.selModel.clearSelections();
					this.selModel.selectRow(rowIndex);
					this.countSel = 1;
					FR.currentSelectedFile = this.store.getAt(rowIndex);
				}
				if (this.countSel > 0) {
					this.showContextMenu();
				}
				e.stopEvent();
			};
			listeners.containermousedown = function(grid, e) {
				//grid.view.focusEl.focus();
				this.selModel.clearSelections();
			};
		}

		Ext.apply(this, {
			stateful: true, stateId: 'files-grid-v2',
			stateEvents: ['columnresize', 'columnmove', 'sortchange'],
			ddGroup : 'TreeDD', ds: this.store,
			cm: new FR.components.gridColumnModel(),
			enableDragDrop: !FR.isMobile,
			stripeRows: false, trackMouseOver: false, enableColLock:false,
			selModel: new Ext.grid.RowSelectionModel({
				listeners: {
					'selectionchange': function() {this.onSelectionChange.delay(150, false, this);}, scope: this
				}
			}),
			keys: [
				{
					key: [10, Ext.EventObject.ENTER], stopEvent: true,
					fn: function() {
						var item = FR.currentSelectedFile;
						if (!item) {return false;}
						this.openItem(item);
					}, scope: this
				},
				{
					key: [Ext.EventObject.DELETE], ctrl: false,
					fn: function(k, e) {
						var cm = FR.UI.contextMenu;
						cm.location = 'grid';
						cm.target = this.getSelectedFiles();
						if (cm.target.length == 0) {return false;}
						FR.contextMenuActions.remove(cm, false, e);
					}, scope: this
				},
				{
					key: [Ext.EventObject.F2], fn: function() {
						var cm = FR.UI.contextMenu;
						cm.location = 'grid';
						cm.target = this.getSelectedFiles();
						if (cm.target.length != 1) {return false;}
						FR.contextMenuActions.rename(cm);
					}, scope: this
				},
				{
					key: [
						Ext.EventObject.ZERO,
						Ext.EventObject.ONE,
						Ext.EventObject.TWO,
						Ext.EventObject.THREE,
						Ext.EventObject.FOUR,
						Ext.EventObject.FIVE,
					], fn: function(k) {
						var cm = FR.UI.contextMenu;
						cm.location = 'grid';
						cm.target = this.getSelectedFiles();
						if (cm.target.length != 1) {return false;}
						var map = {};
						map[Ext.EventObject.ZERO] = 0;
						map[Ext.EventObject.ONE] = 1;
						map[Ext.EventObject.TWO] = 2;
						map[Ext.EventObject.THREE] = 3;
						map[Ext.EventObject.FOUR] = 4;
						map[Ext.EventObject.FIVE] = 5;
						FR.actions.setMetadata({
							params: {
								path: cm.target[0].path,
								'fields[rating]': map[k]
							},
							successCallback: function(rs, opts) {
								var dp = FR.UI.infoPanel.tabs.detailsPanel;
								var ratingValue = opts.params['fields[rating]'];
								dp.ratingField.setValue(ratingValue);
								dp.updateCachedDetails(opts.params.path, 'rating', ratingValue);
							}
						});
					}, scope: this
				},
				{
					key: [Ext.EventObject.N], fn: function() {
						FR.UI.actions.createNewFolder.execute();
					}
				}
			],
			autoExpandColumn: 'filename',
			view: new FR.components.gridView({
				sortAscText: FR.T('Sort Ascending'),
				sortDescText: FR.T('Sort Descending'),
				columnsText: FR.T('Columns')
			}),
			plugins: FR.isMobile ? false : [new Ext.ux.GridDragSelector({dragSafe:true})],
			listeners: listeners
		});
		this.addEvents(['folderChange']);
		FR.components.gridPanel.superclass.initComponent.apply(this, arguments);
	},
	openItem: function(item) {
		if (FR.currentSection == 'trash') {return false;}
		var path = item.data.path;
		if (item.data.isFolder) {
			return FR.utils.browseToPath(path);
		}
		var ext = item.data.ext;
		var ca = FR.UI.contextActions[FR.ext[ext]];
		if (FR.ext[ext] && ca) {
			return FR.actions.customAction(ca.settings, item.data.path, item.data.filename);
		}
		if (User.perms.download) {
			if (Settings.ui_double_click == 'download') {
				return FR.actions.download(path);
			} else if (Settings.ui_double_click == 'downloadb') {
				return FR.actions.openFileInBrowser(path);
			}
		}
		if (Settings.ui_double_click == 'showmenu') {
			return this.showContextMenu();
		}
		if (User.perms.preview) {
			FR.utils.showPreview();
		}
	},
	getDragDropText: function() {
		var count = this.selModel.getCount();
		if (count == 1) {
			return  FR.T('One item');
		}
		return  FR.T('%1 items').replace('%1', count);
	},
	initStore: function() {
		this.store = new FR.components.gridStore();
		this.store.on('exception', function(p, t, a, opt, response) {
			this.view.mainBody.update('');
			var d = opt.reader.jsonData;
			if (d && d.authError) {
				new Ext.ux.prompt({
					title: FR.T('Error'),
					text: d.msg,
					confirmBtnLabel: FR.T('Refresh'),
					callback: function() {document.location.reload();}
				});
			}
			var msg = FR.T('Failed to load file list.');
			if (response.status == 200) {
				FR.lastGridServerResponse = response.responseText;
				msg += '<br>'+FR.T('<a href="%1">The data</a> recevied from the server contains errors.').replace('%1', 'javascript:alert(FR.lastGridServerResponse)');
			} else if (response.status == 500) {
				msg += '<br>'+FR.T('There is a server internal error (HTTP code 500).<br>The administrator should check the appropriate server error logs for related information.');
			} else if (response.status == 0) {
				msg += '<br>'+FR.T('Please check your network connection.');
			} else {
				msg += '<br>'+FR.T('The server HTTP response code is '+response.status);
			}
			this.body.mask(msg);
		}, this);

		this.store.on('beforeload', function(store) {
			var i = FR.UI.ImageViewer;
			if (i && i.isVisible()) {i.hide();}
			store.removeAll(true);
			store.totalLength = 0;
			this.selModel.clearSelections(true);
			FR.UI.actions.refresh.items[0].el.addClass('fa-spin');
			this.view.mainBody.update('');
		}, this);

		this.store.on('load', function(store) {
			FR.UI.actions.refresh.items[0].el.removeClass('fa-spin');
			FR.lastGridServerResponse = false;
			var data = store.reader.jsonData;
			if (this.body.isMasked()) {
				this.body.unmask();
			}
			if (data.error) {
				this.view.mainBody.update('');
				new Ext.ux.prompt({title: FR.T('Error'), text: data.error});
			} else {
				this.fireEvent('folderChange', this, store);
				this.onSelectionChange.delay(0, false, this);
				if (this.highlightOnDisplay) {
					this.highlight(this.highlightOnDisplay, this.highlightOnLoadCallback);
					this.highlightOnDisplay = false;
					this.highlightOnLoadCallback = false;
				}
				if (store.reader.jsonData.countNewEvents) {
					FR.UI.infoPanel.tabs.activityPanel.updateStatus(parseInt(data.countNewEvents));
				}
				FR.UI.infoPanel.tabs.detailsPanel.setReadMe(data.readme);
			}
		}, this);
	},
	setMetaCols: function() {
		this.store.loadParams['metadata[]'] = this.colModel.getMetaCols();
	},
	getSelectedFiles: function() {
		var s = this.selModel.getSelections();
		var list = [];
		for(var i = 0, len = s.length; i < len; i++){
			var data = s[i].data;
			data.id = s[i].id;
			list.push(data);
		}
		return list;
	},
	selectionHasFolders: function() {
		return (this.getSelectedAttrs('isFolder').indexOf(1) != -1);
	},
	getSelectedAttrs: function(attr) {
		var list = [];
		Ext.each(this.selModel.getSelections(), function(row) {
			list.push(row.data[attr]);
		});
		return list;
	},
	getOneSel: function() {
		var selection = this.selModel.getSelections();
		return selection[0];
	},
	countSelected: function() {
		return this.selModel.getCount();
	},
	getByPath: function(path) {
		var rowIdx = this.store.findBy(function(r) {
			if (r.data.path == path) {return true;}
		});
		return (rowIdx != -1) ? this.store.getAt(rowIdx) : false;
	},
	highlight: function(filename, callback) {
		var rowIdx = this.store.findBy(function(record) {
			if (record.data.filename == filename) {return true;}
		});
		if (rowIdx == -1) {
			if(callback) {callback(false);}
			return false;
		}
		this.selModel.selectRow(rowIdx);
		this.getView().focusRow(rowIdx);
		if(callback) {callback(true, this.store.getAt(rowIdx));}
		return true;
	},
	highlightByRecord: function(record) {
		var rowIdx = this.store.findBy(function(r) {
			if (r == record) {return true;}
		});
		if (rowIdx > -1) {
			this.selModel.selectRow(rowIdx);
			this.getView().ensureVisible(rowIdx, 0, false);
		}
	},
	load: function(path) {this.store.loadByPath(path);},
	onSelectionChange: new Ext.util.DelayedTask(function(){
		this.countSel = this.countSelected();
		this.view.el.dom.classList.toggle('withSelection', this.countSel > 0);
		if (this.countSel == 0) {
			FR.currentSelectedFile = false;
		} else  {
			if (this.countSel == 1) {
				FR.currentSelectedFile = this.getOneSel();
			}
		}
		if (FR.UI.ImageViewer && !FR.UI.ImageViewer.hidden) {
			if (!FR.isMobile) {
				FR.UI.ImageViewer.infoPanel.refresh();
			}
		} else {
			FR.UI.infoPanel.refresh();
		}
		this.showTopMenu();
	}, this),
	showTopMenu: function() {
		if (FR.isMobile) {return false;}
		Ext.iterate(['filePick', 'download', 'weblink', 'shareWithUsers', 'preview', 'remove', 'refresh'], function (k) {
			FR.UI.actions[k].hide();
		});
		var a = FR.UI.actions;
		if (FR.currentPath.length) {a.refresh.show();}
		if (this.countSel == 0) {return false;}
		var p = User.perms;
		var s = FR.currentSection;
		var hasVirtualContent = FR.currentSectionIsVirtual;
		var folderPerms = FR.currentFolderPerms;
		var canDownload = false;
		if (p.download && (!folderPerms || (folderPerms && folderPerms.download))) {
			if (s != 'trash') {
				if (!hasVirtualContent) {
					canDownload = true;
					a.download.show();
				} else {
					if (s == 'collections') {
						a.download.show();
					}
				}
			}
		}
		if (hasVirtualContent) {return false;}
		if (this.countSel > 1) {return false;}
		var isFile = !FR.currentSelectedFile.data.isFolder;
		if (canDownload) {
			var canWeblink = false;
			if (p.weblink && ((!folderPerms || (folderPerms && folderPerms.share)))) {
				a.weblink.show();
				canWeblink = true;
			}
			if (isFile) {
				if (canWeblink && FR.filePicker) {
					a.filePick.show();
				}
			}
			if (p.share) {
				if (['trash', 'sharedFolder', 'userWithShares',
					'recent' //can be from a share
				].indexOf(s) == -1) {
					a.shareWithUsers.show();
				}
			}
		}
		if (isFile && p.preview) {
			a.preview.show();
		}
		if (!p.read_only && (!folderPerms || (folderPerms && folderPerms.alter))) {
			if (['userWithShares'].indexOf(s) == -1) {
				a.remove.show();
			}
		}
	},
	showContextMenu: function(alignTo) {
		FR.UI.contextMenu.event({
			location: 'grid',
			target: this.getSelectedFiles(),
			alignTo: alignTo
		});
	},
	loadThumbs: new Ext.util.DelayedTask(function() {
		if (this.view.isListViewStyle() && !Settings.ui_thumbs_in_detailed) {return false;}
		var scroller = this.view.scroller.dom;
		var scrollerRect = scroller.getBoundingClientRect();
		this.store.each(function(item) {
			if (!item.data.thumb) {return true;}
			if (item.data.thumbLoading) {return true;}
			if (item.data.thumbLoadingError) {return true;}
			if (item.data.thumbLoaded) {return true;}
			var idx = this.store.indexOfId(item.id);
			if (idx == -1) {return true;}
			var el = this.view.getRow(idx);
			if (!el) {return true;}
			if (!FR.utils.elementInView(el.getBoundingClientRect(), scrollerRect, 2)) {return true;}
			var iconEl;
			if (this.view.viewMode == 'photos') {
				iconEl = Ext.get(el);
			} else {
				iconEl = Ext.get('itemIcon_'+item.data.uniqid + item.data.filesize);
			}
			if (!iconEl) {return true;}
			if (!item.data.thumbURL) {
				item.data.thumbURL = FR.UI.getThumbURL(Ext.copyTo({extra: 'noIcon=true'}, item.data, 'path,filesize,modified'));
			}
			item.data.thumbLoading = true;
			FR.UI.preloadImage(item.data.thumbURL, function(success, img) {
				item.data.thumbLoading = false;
				if (success) {
					item.data.thumbLoaded = true;
					if (!iconEl.dom) {return false;}
					iconEl.addClass('tmbLoaded');
					item.data.thumbBestFit = FR.UI.setImageToContainer({
						img: img.dom, container: iconEl, style: (this.view.viewMode != 'photos') ? 'cover' : 'contain'
					});
				} else {
					item.data.thumbLoadingError = true;
				}
			}, this, true);
		}, this);
	}),
	reset: function () {
		this.store.removeAll(true);
		this.store.totalLength = 0;
		this.view.refresh();
		return this;
	}
});