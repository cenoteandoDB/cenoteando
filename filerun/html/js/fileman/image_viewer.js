FR.components.ImageViewer = Ext.extend(Ext.Window, {
	unstyled: true, closable: false, layout: 'border', UI: {}, maximized: true, monitorResize: true, direction: false,
	cls: 'image-viewer', image: false, zoomed: false, restoreInfoPanel: false, lastIndex: false, previewFrame: false,
	files: new Ext.util.MixedCollection(), cached: new Ext.util.MixedCollection(),
	initComponent: function() {
		this.UI.icon = new Ext.Toolbar.Item({cls: 'fr-prv-tbar-icon'});
		this.UI.filename = new Ext.Toolbar.TextItem({cls: 'fr-prv-tbar-filename'});
		this.UI.extension = new Ext.Toolbar.TextItem({cls: 'fr-prv-tbar-extension'});
		this.UI.status = new Ext.Toolbar.TextItem({cls: 'fr-prv-tbar-status'});
		this.UI.zoomSlider = new Ext.Slider({
			width: 110, minValue: 0, maxValue: 100, value: 0, hidden: true, cls: 'fr-prv-tbar-slider',
			listeners: {
				'change': function (s, v) {
					this.applyZoom.cancel();
					this.applyZoom.delay(50, false, this, [v]);
				},
				scope: this
			}
		});
		this.UI.rotateBtn = new Ext.Button({
			iconCls: 'fa fa-fw fa-redo',
			handler: function () {
				var r = parseInt(this.imageWrap.dom.dataset.rotation);
				if (!r || r == 360) {r = 0;}
				r = r+90;
				this.imageWrap.setStyle('transform', 'rotate('+r+'deg)');
				this.imageWrap.dom.dataset.rotation = r;
			}, scope: this, tooltip: FR.T('Rotate')
		});
		if (FR.isMobile) {
			this.UI.zoomToggle = new Ext.Button({
				iconCls: 'fa fa-fw fa-search-plus',
				handler: function () {window.open(this.getFullResURL());}, scope: this
			});
		} else {
			this.UI.zoomToggle = new Ext.Button({
				iconCls: 'fa fa-fw fa-search-plus',
				enableToggle: true,
				toggleHandler: function (b, pressed) {
					if (pressed) {
						this.initZoom();
					} else {
						this.cancelZoom();
					}
				}, scope: this, tooltip: FR.T('Zoom'),
				menu: [this.UI.zoomSlider]
			});
		}

		var detailsBtnCfg = {
			iconCls: 'fa fa-fw fa-info-circle',
			tooltip: FR.T('Info'),
			scope: this
		};
		if (FR.isMobile) {
			detailsBtnCfg.handler = this.showDetails;
		} else {
			detailsBtnCfg.toggleHandler = this.toggleDetails;
			detailsBtnCfg.enableToggle = true;
		}
		this.detailsBtn = new Ext.Button(detailsBtnCfg);
		this.downloadBtn = new Ext.Button({
			iconCls: 'fa fa-fw fa-download',
			handler: function() {
				FR.actions.download([this.file.data.path]);
			}, scope: this, hidden: (!this.canDownload()),
			tooltip: FR.T('Download')
		});
		this.fullScreenBtn = new Ext.Button({
			iconCls: 'fa fa-fw fa-expand',
			toggleHandler: function(btn, toggled) {
				var frame = this.previewFrame ? this.previewFrame.dom : document.documentElement;
				if (!toggled) {
					if (document.exitFullscreen) {document.exitFullscreen();}
				} else {
					if (!frame.requestFullscreen) {return false;}
					frame.requestFullscreen();
				}
			}, scope: this, enableToggle: true,
			tooltip: FR.T('Fullscreen')
		});
		this.editBtn = new Ext.Button({
			iconCls: 'fa fa-fw fa-edit',
			handler: function() {
				FR.contextMenuActions.edit(this.file);
			}, scope: this, hidden: true,
			tooltip: FR.T('Edit')
		});
		this.moreBtn = new Ext.Button({
			iconCls: 'fa fa-fw fa-ellipsis-v',
			tooltip: FR.T('More actions'),
			handler: function() {FR.UI.gridPanel.showContextMenu(this.el);return false;}
		});
		this.closeBtn = {
			iconCls: 'fa fa-fw fa-arrow-left',
			handler: function(){
				this.cancelPreloading();
				this.hide();
			}, scope: this,
			tooltip: FR.T('Close')
		};
		var bbar;
		var tbarItems;

		if (FR.isMobile) {
			tbarItems = [
				this.closeBtn,
				'->',
				this.UI.rotateBtn,
				this.UI.zoomToggle,
				this.moreBtn,
				this.detailsBtn,
				this.fullScreenBtn
			];
			bbar = new Ext.Toolbar({
				autoCreate: {cls: 'fr-prv-tbar'},
				items: [
					'<div style="width:5px"></div>',
					this.UI.icon,
					this.UI.filename,
					this.UI.extension,
					'->',
					this.UI.status
				]
			});
		} else {
			bbar = false;
			tbarItems = [
				this.closeBtn,
				this.UI.icon,
				this.UI.filename,
				this.UI.extension,
				this.UI.status,
				'->',
				this.UI.rotateBtn,
				this.UI.zoomSlider,
				this.UI.zoomToggle,
				this.editBtn,
				this.fullScreenBtn,
				this.downloadBtn,
				this.moreBtn,
				this.detailsBtn,
				'<div style="width:5px"></div>'
			];
		}

		var tbar = new Ext.Toolbar({
			autoCreate: {cls: 'fr-prv-tbar top'},
			items: tbarItems
		});

		if (FR.isMobile) {
			this.infoPanel = new FR.components.infoPanel({
				detailsPanelOptions: {hidePreview: true},
				listeners: {
					'afterrender': function(p) {
						new Ext.Button({
							iconCls: 'fa fa-lg fa-close',
							tooltip: FR.T('Hide details'),
							renderTo: p.header.createChild({cls: 'closeButton'}),
							handler: this.hideDetails,
							scope: this
						});
					}, scope: this
				}
			});
			this.infoWindow = new Ext.Window({
				closeAction: 'hide', layout: 'fit',
				items: this.infoPanel, monitorResize: true,
				maximized: true, unstyled: true
			});
		} else {
			this.infoPanel = new FR.components.infoPanel({
				region: 'east', id: 'ImageViewerInfoPanel',
				detailsPanelOptions: {hidePreview: true},
				width: 350, collapseMode: 'mini', collapsed: true,
				listeners: {
					'expand': function () {
						this.infoPanel.refresh();
					}, scope: this
				}
			});
		}

		this.items = [
			{
				region: 'center', unstyled: true,
				tbar: tbar, bbar: bbar, ref: 'canvas', bodyCssClass: 'canvas'
			}
		];
		if (!FR.isMobile) {
			this.items.push(this.infoPanel);
		}
		Ext.apply(this, {
			listeners: {
				'afterrender': function() {
					this.spinner = this.canvas.body.createChild({
						tag: 'img', src: 'images/loading.svg', cls: 'spinner'
					});
					this.initNav();
					this.setupKeys();
					if (FR.isMobile) {this.el.addClass('mobile');}
				},
				'show': function() {
					this.nav.enable();
					if (!FR.UI.infoPanel.collapsed) {
						FR.UI.infoPanel.collapse();
						this.restoreInfoPanel = true;
					}
				},
				'hide': function() {
					this.imageWrap.update('');
					this.imageWrap.setStyle('background-image', 'none');
					this.fullScreenBtn.toggle(false, true);
					this.files.clear();
					this.cached.clear();
					this.nav.disable();
					if (this.restoreInfoPanel) {
						FR.UI.infoPanel.expand();
					}
				}
			}, scope: this
		});
		FR.components.ImageViewer.superclass.initComponent.apply(this, arguments);
	},
	canDownload: function() {
		return (User.perms.download && FR.currentSection != 'trash');
	},
	initNav: function() {
		this.UI.navLeftWrap = Ext.DomHelper.append(this.canvas.body.dom, {tag: 'div', cls: 'fr-prv-nav-left-wrap x-unselectable'}, true);
		this.UI.navLeft = Ext.DomHelper.append(this.UI.navLeftWrap, {tag: 'div', cls: 'fr-prv-nav-btn', html: '<i class="fa fa-fw fa-chevron-left"></i>'}, true);
		this.UI.navLeft.on('click', this.previous, this);
		this.UI.navLeft.addClassOnOver('fr-prv-nav-btn-hover');
		this.imageWrap = this.canvas.body.createChild({
			tag: 'div', cls: 'centered activeImage'
		});
		this.UI.navRightWrap = Ext.DomHelper.append(this.canvas.body.dom, {tag: 'div', cls: 'fr-prv-nav-right-wrap x-unselectable'}, true);
		this.UI.navRight = Ext.DomHelper.append(this.UI.navRightWrap, {tag: 'div', cls: 'fr-prv-nav-btn ', html: '<i class="fa fa-fw fa-chevron-right"></i>'}, true);
		this.UI.navRight.on('click', this.next, this);
		this.UI.navRight.addClassOnOver('fr-prv-nav-btn-hover');
		if (!FR.isMobile) {
			new Ext.ToolTip({
				target: this.UI.navRight, showDelay: 250,
				html: FR.T('Next'), anchor: 'left',
				baseCls: 'headerTbar-btn-tooltip'
			});
			new Ext.ToolTip({
				target: this.UI.navLeft, showDelay: 250,
				html: FR.T('Previous'), anchor: 'right',
				baseCls: 'headerTbar-btn-tooltip'
			});
		}
		this.canvas.body.on('contextmenu', function() {
			FR.UI.gridPanel.showContextMenu();return false;
		});
	},
	setupKeys: function() {
		var keys = {
			'left': function() {
				this.UI.navLeft.addClass('fr-prv-nav-btn-hover');
				this.previous();
				(function() {
					this.UI.navLeft.removeClass('fr-prv-nav-btn-hover');
				}).defer(150, this);
			},
			'right': function() {
				this.UI.navRight.addClass('fr-prv-nav-btn-hover');
				(function() {
					this.UI.navRight.removeClass('fr-prv-nav-btn-hover');
				}).defer(150, this);
				this.next();
			},
			'space': function(){
				this.next();
			},
			'up': function() {this.previous();},
			'down': function() {this.next();},
			'esc': function() {this.hide();},
			scope: this
		};
		if (this.canDownload()) {
			keys['enter'] =  function(){
				FR.actions.download([this.file.data.path]);
			};
		}
		this.nav = new Ext.KeyNav(this.focusEl, keys);
		this.canvas.bwrap.on('click', function() {this.focus();}, this);/* needed for key nav */
	},
	toggleDetails: function(btn, toggled) {
		if (toggled) {
			this.showDetails();
		} else {
			this.hideDetails();
		}
	},
	showDetails: function() {
		if (FR.isMobile) {
			this.infoWindow.show();
			this.infoPanel.refresh();
		} else {
			this.infoPanel.expand();
		}
	},
	hideDetails: function () {
		if (FR.isMobile) {
			this.infoWindow.hide();
		} else {
			this.infoPanel.collapse();
		}
	},
	initZoom: function() {
		this.loadHiRes.cancel();
		if (this.zoomed) {return false;}
		this.spinner.show();
		FR.UI.preloadImage(this.getFullResURL(), function(success, img, src) {
			this.spinner.hide();
			if (!success) {return false;}

			this.UI.zoomSlider.show();
			this.zoomed = true;

			var w = this.imageWrap.getWidth();
			var h = this.imageWrap.getHeight();
			this.imgDrag = new Ext.dd.DD(this.imageWrap.id, false, {moveOnly: true, scroll: false});
			this.imageWrap.setStyle('background-size', '');
			this.imageWrap.removeClass('centered').addClass('dragging-zoom').setHeight(h).setWidth(w).center();

			var nHeight = img.dom.naturalHeight;
			var nWidth = img.dom.naturalWidth;

			var min = Math.min(w, h);
			var max = Math.max(nHeight, nWidth);

			var current = min+((max-min)/4);
			this.UI.zoomSlider.setMinValue(min);
			this.UI.zoomSlider.setMaxValue(max);
			this.UI.zoomSlider.setValue(current);
			this.imageWrap.setStyle('background-image', 'url(\''+img.dom.src+'\')');
		}, this);
	},
	applyZoom: new Ext.util.DelayedTask(function(v) {
		this.imageWrap.setHeight(v).setWidth(v).center();
	}),
	resetRotation: function() {
		this.imageWrap.dom.dataset.rotation = '';
		this.imageWrap.setStyle('transform', 'rotate(0deg)');
	},
	cancelZoom: function() {
		if (!this.zoomed) {return false;}
		this.imgDrag.destroy();
		this.imageWrap.removeClass('dragging-zoom').addClass('centered')
			.setStyle('width', null)
			.setStyle('height', null)
			.setStyle('top', null)
			.setStyle('left', null);
		this.UI.zoomSlider.suspendEvents();
		this.UI.zoomSlider.setValue(0);
		this.UI.zoomSlider.resumeEvents();
		this.UI.zoomSlider.hide();
		this.UI.zoomToggle.toggle(false, true);
		this.zoomed = false;
	},
	preloadFollowingHiRes: new Ext.util.DelayedTask(function() {
		var followingIndex = this.getFollowingIndex();
		if (followingIndex === false) {return false;}
		var followingFile = this.files.itemAt(followingIndex);
		if (!followingFile) {return false;}
		if (this.hasNonImagePreview(followingFile)) {return false;}
		var highResSrc = this.getHighResURL(followingFile);
		if (this.isCached(highResSrc)) {return false;}
		if (this.direction == 'right') {
			this.UI.navRight.setStyle('color', 'orange');
		} else {
			this.UI.navLeft.setStyle('color', 'orange');
		}
		this.prepareImage(followingFile, function(thumbImg) {
			if (!thumbImg || (thumbImg.dom.width < this.imageWrap.getWidth() && thumbImg.dom.height < this.imageWrap.getHeight())) {
				FR.UI.preloadImage(highResSrc, function (success, img, src) {
					if (success) {
						if (this.direction == 'right') {
							this.UI.navRight.setStyle('color', '');
						} else {
							this.UI.navLeft.setStyle('color', '');
						}
						this.cached.add(src, img.dom);
					}
				}, this);
			}
		});
	}),
	onHiResLoad: function(img) {
		FR.UI.setImageToContainer({
			img: img,
			container: this.imageWrap,
			style: 'contain'
		});
		this.preloadFollowingHiRes.delay(300, false, this);
	},
	hasNonImagePreview: function(file) {
		return (['img', 'raw', 'img2'].indexOf(file.data.filetype) == -1);
	},
	loadHiRes: new Ext.util.DelayedTask(function(highResSrc) {
		if (this.hasNonImagePreview(this.file)) {
			this.spinner.show();
			var action = FR.baseURL + '/?module=fileman&section=utils&page=file_preview&context=viewer';
			//action = highResSrc;
			var frameName = 'preview-frame-'+Ext.id();
			this.imageWrap.setStyle('background-image', 'none');
			this.previewFrame = this.imageWrap.createChild({
				tag: 'iframe', name: frameName, width:'100%', style: 'height:100%;border:0;'+(Ext.isMobile?'':'width:calc(100% - 120px)'), allowtransparency: 'true'
			});
			this.previewFrame.on('load', function(){
				try {
					if (this.dom.contentDocument.contentType == 'application/json') {
						var rs = Ext.util.JSON.decode(this.dom.contentDocument.body.textContent);
						if (rs && rs.hasOwnProperty('msg')) {
							new Ext.ux.prompt({
								text: rs.msg,
								confirmBtnLabel: FR.T('Refresh'),
								closable: true,
								callback: function() {document.location.reload();}
							});
						}
					}
				} catch(er) {}
			});
			var post = [{name: 'path', value: this.file.data.path}];
			if (FR.isMobile) {post.push({name: 'mobile', value: '1'});}
			FR.UI.postToTarget({src: action, post: post}, frameName);
			this.spinner.hide();
			return true;
		}
		this.previewFrame = false;
		var cachedImg = this.isCached(highResSrc);
		if (cachedImg) {
			this.onHiResLoad(cachedImg);
			return true;
		}
		this.spinner.show();
		this.changed = false;
		this.preloading = FR.UI.preloadImage(highResSrc, function(success, img, highResSrc) {
			if (this.changed) {return false;}
			this.spinner.hide();
			if (!success) {return false;}
			if (!img.dom) {return false;}
			this.onHiResLoad(img.dom);
			this.cached.add(highResSrc, img.dom);
			this.preloading = false;
		}, this);
	}),
	cancelPreloading: function() {
		if (this.preloading) {
			FR.UI.cancelPreloadImage(this.preloading);
			this.preloading = false;
		}
	},
	cancelHiResLoad: function() {
		this.loadHiRes.cancel();
		this.cancelPreloading();
		this.spinner.hide();
	},
	getFullResURL: function() {
		return URLRoot+'/?module=custom_actions&action=open_in_browser&path='+encodeURIComponent(this.file.data.path);
	},
	getHighResURL: function(file) {
		var w = this.imageWrap.getWidth();
		var h = this.imageWrap.getHeight();
		if (window.devicePixelRatio >= 1.3) {
			w = w*2;
			h = h*2;
		}
		return FR.UI.getThumbURL({
			path: file.data.path,
			filesize: file.data.filesize,
			extra: '&type=preview&width='+w+'&height='+h
		});
	},
	loadFile: function(item) {
		this.changed = true;
		this.cancelHiResLoad();
		var r = item.data;
		this.resetRotation();
		this.cancelZoom();
		this.UI.zoomToggle.hide();
		this.UI.rotateBtn.hide();
		this.editBtn.hide();
		this.UI.icon.update('<img src="'+FR.UI.getFileIconURL(r.icon)+'" width="30" />');
		this.UI.filename.setText(r.filenameWithoutExt);
		this.UI.extension.setText('.'+r.ext);
		this.file = item;
		if (this.imgDrag) {this.imgDrag.destroy();}
		this.imageWrap.update('');
		this.imageWrap.setStyle('background-image', 'none');
		var highResSrc = this.getHighResURL(this.file);
		var highResIsCached = this.isCached(highResSrc);
		if (r.filetype == 'img') {
			this.UI.rotateBtn.show();
			this.UI.zoomToggle.show();
		}
		if (FR.utils.isEditable(r)) {
			this.editBtn.show();
		}
		if (highResIsCached) {
			this.loadHiRes.delay(0, false, this, [highResSrc]);
			return true;
		}
		this.prepareImage(r, function(thumbImg) {
			if (!thumbImg) {
				this.loadHiRes.delay(0, false, this, [highResSrc]);
			} else {
				FR.UI.setImageToContainer({
					img: thumbImg.dom,
					container: this.imageWrap,
					style: 'contain'
				});
				if (this.hasNonImagePreview(this.file) ||
					(thumbImg.dom.width < this.imageWrap.getWidth() && thumbImg.dom.height < this.imageWrap.getHeight())
				) {
					this.loadHiRes.delay(1000, false, this, [highResSrc]);
				}
			}
		});
	},
	prepareImage: function(r, callback) {
		if (!r.thumbURL || !r.thumbLoaded) {
			callback.createDelegate(this, [false])();
		} else {
			if (!r.thumbURL) {
				r.thumbURL = FR.UI.getThumbURL(Ext.copyTo({extra: 'noIcon=true'}, r, 'path,filesize,modified'));
			}
			FR.UI.preloadImage(r.thumbURL, function (success, loaded, src) {
				if (success) {
					callback.createDelegate(this, [loaded])();
				}
			}, this);
		}
	},
	isCached: function(url) {
		return this.cached.item(url);
	},
	setFile: function(index, direction) {
		this.direction = (direction || false);
		this.currentIndex = index;
		var record = this.files.itemAt(index);
		var count = this.files.getCount();
		if (count > 1 && index != count-1) {
			this.UI.navRightWrap.show();
		} else {
			this.UI.navRightWrap.hide();
		}
		if (count > 1 && index != 0) {
			this.UI.navLeftWrap.show();
		} else {
			this.UI.navLeftWrap.hide();
		}


		var status = '&nbsp;';
		if (count > 1) {
			 status = FR.T('%1 / %2').replace('%1', this.currentIndex+1).replace('%2', count);
		}
		this.UI.status.setText(status);
		this.loadFile(record);
		FR.UI.gridPanel.highlightByRecord(record);
	},
	previous: function() {
		var index = this.files.getCount()-1;
		if (this.currentIndex > 0) {
			index = this.currentIndex-1;
		}
		this.setFile(index, 'left');
	},
	getFollowingIndex: function() {
		var count = this.files.getCount();
		if (this.direction == 'right') {
			if (this.currentIndex < count-1) {
				return this.currentIndex+1;
			}
			return 0;
		} else if (this.direction == 'left') {
			if (this.currentIndex > 0) {
				return this.currentIndex-1;
			}
			return count-1;
		}
		return false;
	},
	next: function() {
		var index = 0;
		if (this.currentIndex < this.files.getCount()-1) {
			index = this.currentIndex+1;
		}
		this.setFile(index, 'right');
	},
	open: function(selectedFile) {
		this.collectFiles(selectedFile);
		this.show();
		this.setFile(this.startIndex);
	},
	collectFiles: function(startFile) {
		this.files.clear();
		FR.UI.gridPanel.store.each(function(file) {
			if (FR.utils.supportsImageViewer(file)) {
				var c = this.files.getCount();
				this.files.add(c, file);
				if (startFile == file) {
					this.startIndex = c;
				}
			}
		}, this);
	}
});