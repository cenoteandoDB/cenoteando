FR.components.gridView = Ext.extend(Ext.grid.GridView, {
	defaultViewMode: false, searchMode: false,
	viewMode: false, previousState: false, previousViewMode: false,
	filters: [],
	getDefaultViewMode: function() {
		return (FR.isMobile ? 'list' : Settings.ui_default_view)
	},
	init: function(grid) {
		this.defaultViewMode = this.getDefaultViewMode();
		grid.colModel.on('hiddenchange', function(cm, idx, hideCol) {
			if (cm.getColumnAt(idx).custom) {
				this.grid.setMetaCols();
				if (!hideCol) {
					this.grid.load(FR.currentPath);
				}
			}
		}, this);
		FR.components.gridView.superclass.init.call(this, grid);
	},
	resetMode: function() {
		this.changeMode(this.defaultViewMode);
	},
	setMode: function(mode) {
		this.viewMode = mode;
	},
	configureForAudioPlayer: function() {
		this.previousState = this.grid.getState();
		var cm = this.cm;
		cm.suspendEvents();
		cm.setColumnWidth(cm.getIndexById('icon'), 40);
		if (User.perms.metadata) {
			cm.setHidden(cm.getIndexById('filename'), true);
			cm.setHidden(cm.getIndexById('extension'), true);
			cm.setHidden(cm.getIndexById('nice_filesize'), true);
			cm.setHidden(cm.getIndexById('icons'), true);
			cm.setHidden(cm.getIndexById('modified'), true);
			cm.setHidden(cm.getIndexById('label'), true);
			cm.setHidden(cm.getIndexById('meta_' + FR.specialMetaFields.album), false);
			var titleIndex = cm.getIndexById('meta_' + FR.specialMetaFields.title);
			cm.setHidden(titleIndex, false);
			cm.moveColumn(titleIndex, 3);
			var artistIndex = cm.getIndexById('meta_' + FR.specialMetaFields.artist);
			cm.setHidden(artistIndex, false);
			cm.moveColumn(artistIndex, 4);
			if (!FR.isMobile) {
				var durationIndex = cm.getIndexById('meta_' + FR.specialMetaFields.duration);
				cm.setHidden(durationIndex, false);
				this.grid.autoExpandColumn = 'meta_' + FR.specialMetaFields.title;
			}
			this.grid.setMetaCols();
		}
		this.syncFocusEl(0);
		cm.resumeEvents();
		this.grid.stateful = false;
	},
	restoreAfterAudioPlayer: function() {
		this.grid.autoExpandColumn = 'filename';
		if (this.previousState) {
			var cm = this.cm;
			cm.suspendEvents();
			this.grid.applyState(this.previousState);
			cm.resumeEvents();
		}
		this.grid.stateful = true;
	},
	changeMode: function(mode, persist) {
		if (mode == this.viewMode) {return;}
		this.previousViewMode = this.viewMode;
		if (mode == 'music') {
			this.configureForAudioPlayer();
			this.showAudioPanel();
		} else {
			if (this.previousViewMode == 'music') {
				var ap = FR.UI.AudioPlayer;
				if (ap.app) {ap.app.pause();}
				ap.collapse();
				this.restoreAfterAudioPlayer();
			}
		}
		this.viewMode = mode;
		this.refresh(true);
		if (persist) {
			Settings.ui_default_view = mode;
			this.defaultViewMode = mode;
		}
	},
	prepareData: function(r) {
		r.data.thumbLoaded = false;
		r.data.thumbLoading = false;

		var icons = [];
		if (r.data.isNew) {
			icons.push('<i class="fa fa-bolt" ext:qtip="'+FR.T('This item has recent changes')+'"></i>');
		}
		if (r.data.comments == 1) {
			icons.push('<i class="fa fa-comment-alt"></i>');
		} else if (r.data.comments > 1) {
			icons.push('<i class="fa fa-comments-alt"></i>');
		}
		if (r.data.lockInfo) {
			icons.push('<i class="fa fa-lock" ext:qtip="'+FR.T('This file is locked by %1.').replace('%1', r.data.lockInfo)+'"></i>');
		}
		if (r.data.star) {
			icons.push('<i class="fa fa-star-o"></i>');
		}
		if (r.data.share) {
			icons.push('<i class="fa fa-user-plus"></i>');
		}
		if (r.data.hasWebLink) {
			icons.push('<i class="fa fa-link"></i>');
		}
		if (r.data.notInfo) {
			icons.push(' <i class="fa fa-bell-o"></i>');
		}
		r.data.icons = icons.join('');
		var iconsHolder = '<div class="iconsHolder">'+r.data.icons+'</div>';
		var cls;
		var itemId = 'itemIcon_'+ r.data.uniqid + r.data.filesize;
		var img = FR.UI.getFileIconURL(r.data.icon);
		var folderIconCls = r.data.icon ? r.data.icon : 'fa-folder';
		var checkboxSelector = '<div class="grid-row-checkbox chkbx"><i class="grid-row-checkbox fa fa-fw fa-check"></i></div>';

		if (this.isListViewStyle()) {
			if (r.data.isFolder) {
				r.data.iconHTML = '<i class="gridFolderIcon fa '+folderIconCls+'"></i>';
			} else {
				if (Settings.ui_thumbs_in_detailed) {
					r.data.iconHTML = '<div id="' + itemId + '" class="gridTmb" style="background-image:url(\'' + img + '\');"></div>';
				} else {
					r.data.iconHTML = '<img src="'+img+'" width="32" height="32" />';
				}
			}
			r.data.iconHTML += checkboxSelector;
			return true;
		}
		var html;
		var labelHTML = '';
		if (r.data.label) {
			labelHTML = '<div class="label">'+r.data.label.html+'</div>';
		}
		if (r.data.isFolder) {
			cls = 'thumbFolder';
			if (r.data.label) {
				cls += ' labeled';
			}
			html = labelHTML +
				'<table class="'+cls+'" cellspacing="0"><tr>' +
					'<td class="icon"><i class="gridFolderIcon fa fa-lg '+folderIconCls+'"></i></td>' +
					'<td><div class="name" ext:qtip="'+r.data.filename+'">' +
						r.data.filename +
					'</div></td>'+
				'</tr></table>'+ iconsHolder + checkboxSelector;
		} else {
			var iconStyle = 'background-image:url(\''+img+'\')';
			if (this.viewMode == 'thumbnails' || this.viewMode == 'videos') {
				cls = r.data.label ? ' labeled' : '';
				if (r.data.thumb) {cls += ' bgTrans';}
				html =
					'<div class="tmbItem">' +
						labelHTML +
						'<div class="tmbInner'+cls+'" id="'+itemId+'" style="'+iconStyle+'">'+
							checkboxSelector +
							'<div class="extLabel">'+r.data.ext.toUpperCase()+'</div>' + iconsHolder +'<div class="selOverlay"></div></div>' +
							'<div class="name" ext:qtip="'+r.data.filename+'&lt;br&gt; '+r.data.nice_filesize+'">'+r.data.filenameWithoutExt+'</div>' +
					'</div>';
			} else {
				html = '<div class="tmbItem" style="'+iconStyle+'" ext:qtip="'+r.data.filename+'">'+ labelHTML + checkboxSelector + '</div>';
			}
		}
		if (r.data.isFolder) {
			html = '<div class="tmbItem typeFolder">'+html+'</div>';
		}
		return html;
	},
	getRows : function() {
		return this.hasRows() ? this.mainBody.query(this.rowSelector) : [];
	},
	doRender : function(cs, rs, ds, startRow, colCount, stripe) {
		if (this.isListViewStyle()) {
			Ext.each(rs, function(r) {this.prepareData(r);}, this);
			return FR.components.gridView.superclass.doRender.apply(this, arguments);
		}
		var bufFolders ='', bufFiles = '', html ='', ret = '';
		Ext.each(rs, function(r) {
			html = this.prepareData(r);
			if (r.data.isFolder) {
				bufFolders += html;
			} else {
				bufFiles += html;
			}
		}, this);
		if (bufFolders.length > 0) {
			ret += bufFolders;
			ret += '<div style="clear:left"></div><div class="typeSeparator"></div></div>';
		}
		ret += bufFiles;
		return ret + '<div style="clear:both;"></div>';
	},
	refresh: function(headersToo) {
		if (!this.viewMode) {this.viewMode = this.getDefaultViewMode();}
		FR.UI.actions.toggleViewList.setIconClass(FR.UI.getViewIconCls(this.viewMode));
		if (this.isListViewStyle()) {
			this.selectedRowClass = "x-grid3-row-selected";
			this.el.removeClass(['thumbMode', 'photoMode']);
			this.rowSelector = 'div.x-grid3-row';
			this.mainHd.setStyle('display', 'block');
			FR.UI.actions.sortItems.hide();
		} else {
			FR.UI.actions.sortItems.show();
			this.rowSelector = 'div.tmbItem';
			this.selectedRowClass = "tmbItemSel";
			if (this.viewMode == 'photos') {
				this.el.removeClass('thumbMode').addClass('photoMode');
			} else {
				this.el.removeClass('photoMode').addClass('thumbMode');
			}
			if (!FR.UI.actions.sortItems.pressed) {
				this.mainHd.setStyle('display', 'none');
			}
		}

		this.filters = [];
		if (this.viewMode == 'photos') {
			this.filters.push(function(r){return (r.data.thumb && (r.data.filetype == 'img' || r.data.filetype == 'raw'));});
		} else if (this.viewMode == 'videos') {
			this.filters.push(function (r) {return (r.data.filetype == 'wvideo' || r.data.filetype == 'video');});
		} else if (this.viewMode == 'music') {
			this.filters.push(function (r) {return (r.data.filetype == 'mp3');});
		}

		var s = this.grid.getStore();
		if (this.filters.length > 0) {
			s.suspendEvents();
			s.filterBy(function(r) {
				var rs = false;
				Ext.each(this.filters, function (f) {
					if (f(r)) {
						rs = true;
						return false;
					}
				});
				return rs;
			}, this);
			s.resumeEvents();
		} else {
			if (s.isFiltered()) {s.clearFilter(true);}
		}
		FR.components.gridView.superclass.refresh.apply(this, arguments);
		this.grid.loadThumbs.delay(0, false, this.grid);
	},
	showAudioPanel: function() {
		FR.UI.AudioPlayer.expand();
	},
	closeAudioPanel: function() {
		var persist = false;
		var mode = this.defaultViewMode;
		if (this.defaultViewMode == 'music') {
			mode = 'list';
			persist = true;
		}
		this.changeMode(mode, persist);
	},
	showSearchPanel: function() {
		FR.UI.searchPanel.expand();
		this.searchMode = true;
	},
	closeSearchPanel: function() {
		FR.UI.searchPanel.collapse();
		this.searchMode = false;
	},
	updateAllColumnWidths: function(){
		if (this.isListViewStyle()) {
			return FR.components.gridView.superclass.updateAllColumnWidths.apply(this);
		}
		var tw = this.getTotalWidth();
		var clen = this.cm.getColumnCount();
		var ws = [];
		for(var i = 0; i < clen; i++){
			ws[i] = this.getColumnWidth(i);
		}
		this.innerHd.firstChild.firstChild.style.width = tw;
		for(i = 0; i < clen; i++){
			var hd = this.getHeaderCell(i);
			hd.style.width = ws[i];
		}
		this.onAllColumnWidthsUpdated(ws, tw);
	},
	updateColumnWidth : function(col, width){
		if (this.isListViewStyle()) {
			return FR.components.gridView.superclass.updateColumnWidth.apply(this, arguments);
		}
		var w = this.getColumnWidth(col);
		var tw = this.getTotalWidth();
		this.innerHd.firstChild.firstChild.style.width = tw;
		var hd = this.getHeaderCell(col);
		hd.style.width = w;
		this.onColumnWidthUpdated(col, w, tw);
	},
	updateColumnHidden : function(col, hidden){
		if (this.isListViewStyle()) {
			return FR.components.gridView.superclass.updateColumnHidden.apply(this, arguments);
		}
		var tw = this.getTotalWidth();
		this.innerHd.firstChild.firstChild.style.width = tw;
		var display = hidden ? 'none' : '';
		var hd = this.getHeaderCell(col);
		hd.style.display = display;
		this.onColumnHiddenUpdated(col, hidden, tw);
		delete this.lastViewWidth;
		this.layout();
	},
	applyEmptyText : function() {
		var t;
		var iconCls,
			color = 'silver',
			text = 'This folder is empty',
			style = 'simple';

		if (this.searchMode) {
			iconCls = 'fa-search';
			text = 'No file was found matching your search criteria.';
		} else {
			if (FR.currentSection == 'starred') {
				iconCls = 'fa-star';
				text = 'There are no starred files or folders';
			} else if (FR.currentSection == 'recent') {
				iconCls = 'fa-clock-o';
				text = 'There are no recently accessed files';
			} else if (FR.currentSection == 'shares') {
				iconCls = 'fa-user-plus';
				text = 'There are no shared files or folders';
			} else if (FR.currentSection == 'webLinked') {
				iconCls = 'fa-link';
				text = 'There are no shared links';
			} else if (FR.currentSection == 'collections') {
				iconCls = 'fa-archive';
				text = 'There are no collections';
			} else {
				if (FR.utils.currentFolderAllowsUpload() && !FR.isMobile) {
					style = 'upload';
				}
			}
			if (this.viewMode == 'photos') {
				iconCls = 'fa-picture-o';
				text = 'There are no photos in here';
				style = 'simple';
			} else if (this.viewMode == 'videos') {
				iconCls = 'fa-video-camera';
				text = 'There are no videos in here';
				style = 'simple';
			} else if (this.viewMode == 'music') {
				text = 'There are no audio files in here';
				style = 'simple';
			}
		}
		var count = this.ds.getTotalCount();
		if (count == 1) {
			text += '<br>'+FR.T('There is one other item');
			text += '<br>(<a href="javascript:;" onclick="FR.UI.gridPanel.view.changeMode(\'list\')" style="pointer-events:auto">'+FR.T('Show the item')+'</a>)';
		} else if (count > 1) {
			text += '<br>'+FR.T('There are %1 other items').replace('%1', count);
			text += '<br>(<a href="javascript:;" onclick="FR.UI.gridPanel.view.changeMode(\'list\')" style="pointer-events:auto">'+FR.T('Show all items')+'</a>)';
		}

		if (style == 'simple') {
			t = '<div style="text-align:center;">';
			if (iconCls) {
				t += '<div style="margin-bottom:10px;"><i class="fa ' + iconCls + ' fa-5x" style="color:' + color + '"></i></div>';
			}
			t += '<div>' + FR.T(text) + '</div></div>';
		} else {
			t = '<div class="dropIcon"><i class="fa fa-reply fa-rotate-270 fa-5x"></i></div>' +
				'<div style="float:left;">' +
				'<div style="font-size:26px;">' + FR.T('Drop files here') + '</div>' +
				'<div style="font-size:13px;margin-top:10px;">' + FR.T('or use the "NEW" button') + '</div>' +
				'</div>';
		}
		this.emptyText = t;
		FR.components.gridView.superclass.applyEmptyText.apply(this, arguments);
	},
	layout: function() {
		FR.components.gridView.superclass.layout.apply(this);
		this.mainBody.setStyle('width', 'auto');
		this.mainBody.setStyle('height', '100%');
	},
	isListViewStyle: function() {
		return (['list', 'music'].indexOf(this.viewMode) != -1);
	}
});