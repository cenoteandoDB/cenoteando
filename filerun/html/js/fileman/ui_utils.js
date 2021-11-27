FR.UI.reloadStatusBar = function() {
	if (!User.perms.space_quota_max) {return false;}
	FR.UI.quotaIndicator.getEl().mask();
	Ext.Ajax.request({
		url: FR.baseURL+'/?module=fileman&section=utils&page=status_bar',
		success: function(req) {
			FR.UI.quotaIndicator.getEl().unmask();
			try {
				var rs = Ext.util.JSON.decode(req.responseText);
			} catch (er){return false;}
			if (rs) {
				User.perms = Ext.apply(User.perms, rs);
				FR.UI.updateQuotaStatus();
			}
		}
	});
};
FR.UI.updateQuotaStatus = function() {
	FR.UI.quotaIndicator.update('%1 used (%2%)'.replace('%1', User.perms.space_quota_used).replace('%2', User.perms.space_quota_percent_used));
};
FR.UI.getViewIconCls = function(viewMode) {
	if (!viewMode) {viewMode = Settings.ui_default_view;}
	var icon = 'fa fa-fw ';
	if (viewMode == 'photos') {
		icon += 'fa-picture-o';
	} else if (viewMode == 'music') {
		icon += 'fa-music';
	} else if (viewMode == 'videos') {
		icon += 'fa-video-camera';
	} else if (viewMode == 'thumbnails') {
		icon += 'fa-th';
	} else {
		icon += 'fa-list';
	}
	return icon;
};
FR.UI.feedback = function(text, isError) {
	if (!text) {return false;}
	if (Ext.util.Format.stripTags(text).length > 100) {
		new Ext.Window({title: isError?FR.T('Problems'):null, modal: true, width: 350, height: 160, layout: 'fit', items: {bodyStyle: 'padding:5px', html: text, autoScroll: true}}).show();
		return false;
	}
	var delay = Math.max(text.length/15, 2);
	if (!FR.UI.feedbackCt) {
		FR.UI.feedbackCt = Ext.DomHelper.append(document.body, {style:'position:absolute;width:300px;z-index:9999999;'}, true);
	}
	var m = Ext.DomHelper.append(FR.UI.feedbackCt, {html:'<div class="fr-feedback-msg'+(isError?' error':'')+'">'+text+'</div>'}, true);
	FR.UI.feedbackCt.alignTo(Ext.getBody(), 'bl-bl');
	m.on('click', function(e, node) {node.remove();});
	m.slideIn('b').pause(delay).ghost('b', {remove: true});
};
FR.UI.popupCount = 0;
FR.UI.popup = function(args) {
	var id;
	if (args.id) {
		id = args.id;
	} else {
		args.autoDestroy = true;
		id = 'popups_'+(++this.popupCount);
	}
	var frameId = id+'-iframe';
	if (!args.noId) {
		args.src += '&_popup_id='+id;
	}
	var w = args.width;
	var h = args.height;
	args.draggable = true;
	if (!w || !h) {
		if (FR.isMobile) {
			args.maximized = true;
			args.resizable = false;
			args.draggable = false;
		} else {
			var bsize = Ext.getBody().getSize();
			w = Math.floor(bsize.width - 2 / 100 * bsize.width);
			h = Math.floor(bsize.height - 5 / 100 * bsize.height);
		}
	}
	var options = {
		id: id, stateful: false,
		autoDestroy: args.autoDestroy,
		closeAction: (args.autoDestroy ? 'close' : 'hide'),
		constrainHeader: true, layout: 'fit',
		width: w, height: h,
		title: args.title || false,
		tools: args.tools || false,
		resizable: args.resizable || false,
		collapsible: args.collapsible || false,
		maximizable: args.maximizable || false,
		maximized: args.maximized || false,
		draggable: args.draggable,
		constrain: args.constrain || false,
		iconCls: args.iconCls || false,
		closable: ((typeof args.closable == 'undefined') ? true : args.closable), plain: false, modal: (args.modal !== false),
		html: '<iframe src="'+(args.post ? 'about:blank' : args.src)+'" style="width:100%;height:100%;position:relative" marginheight="0" marginwidth="0" frameborder="0" id="'+frameId+'" name="'+id+'" allowfullscreen></iframe>'
	};
	var dialog = new Ext.Window(options);
	dialog.frameId = frameId;
	args.centerTo = args.centerTo || false;
	dialog.show(args.centerTo);
	if (args.align) {
		dialog.alignTo(args.align.el, args.align.pos, args.align.offset);
	}
	if (args.loadingMsg) {
		Ext.get(dialog.getLayout().container.body.dom).mask(FR.T(args.loadingMsg));
		Ext.get(frameId).on('load', function() {
			Ext.get(dialog.getLayout().container.body.dom).unmask();
		});
	}
	FR.UI.popups[id] = dialog;
	if (args.autoDestroy) {
		dialog.on('afterhide', function(dlg){
			dlg.destroy(true);
			delete FR.UI.popups[dlg.id];
		});
	}
	if (args.post) {
		FR.UI.postToTarget(args, id);
	}
	return dialog;
};

FR.UI.openInPopup = function(args) {
	var id = 'fr-tabs-'+Ext.id();
	var frameId = id+'-frame';
	args.src = args.src+'&_tab_id='+id;

	var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
	var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;
	var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
	var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;
	var w = Math.round(width-15/100*width);
	var h = Math.round(height-15/100*height);
	var left = ((width / 2) - (w / 2)) + dualScreenLeft;
	var top = ((height / 2) - (h / 2)) + dualScreenTop;
	var win = window.open(args.src, frameId, 'scrollbars=yes, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
	if (args.post) {
		FR.UI.postToTarget(args, frameId);
	}
	return win;
};

FR.UI.backgroundPost = function(path, url) {
	if (!path) {path = FR.UI.contextMenu.target[0].path;}
	var args = {
		src: url,
		post: [{name: 'path', value: path}]
	};
	FR.UI.postToTarget(args, FR.UI.createDisposableIFrame());
}

FR.UI.createDisposableIFrame = function() {
	var ifr = document.createElement('IFRAME');
	var iframeName = 'hidden-iframe-'+Ext.id();
	ifr.setAttribute('name', iframeName);
	ifr.setAttribute('style', 'width:0px;height:0px;position:absolute;top:-100px;left:-100px;');
	Ext.get('theBODY').appendChild(ifr);
	Ext.get(ifr).on('load', function() {
		Ext.get(ifr).remove();
	});
	return iframeName;
}

FR.UI.postToTarget = function(args, target) {
	var frm = document.createElement('FORM');
	frm.action = args.src;
	frm.method = 'POST';
	frm.target = target || '_blank';
	Ext.each(args.post, function(param) {
		var inpt = document.createElement('INPUT');
		inpt.type = 'hidden';
		inpt.name = param.name;
		inpt.value = param.value;
		frm.appendChild(inpt);
	});
	Ext.get('theBODY').appendChild(frm);
	frm.submit();
	Ext.get(frm).remove();
};

FR.UI.showUploadWindow = function(opts) {
	if (!FR.UI.uploadWindow) {
		var bsize = Ext.getBody().getSize();
		var height = Ext.min([Math.floor(bsize.height-20/100*bsize.height), 300]);
		var width = Ext.min([bsize.width, 750]);
		FR.UI.uploadWindow = new FR.components.uploadWindow({width: width, height: height});
	}
	//FR.UI.uploadWindow.show();
	var query = {path: opts.targetPath};
	if (opts.files) {
		FR.UI.uploadWindow.flow.addFiles(opts.files, false, query);
	} else {
		if (opts.dropEvent) {
			FR.UI.uploadWindow.flow.onDrop(opts.dropEvent, query);
		} else {
			FR.UI.uploadWindow.flow.browseFiles({
				entireFolder: opts.folder,
				query: query
			});
		}
	}
};

FR.UI.persistentWindow = function(args) {
	var win = FR.UI.popups[args.id];
	if (!win) {
		win = FR.UI.popup(args);
		//Ext.get(win.getLayout().container.body.dom).mask(args.initMsg);
	} else {
		win.setTitle(args.title);
		win.syncSize();
		win.show();
		Ext.get(win.frameId).dom.contentWindow.FR.update(args);
	}
};
FR.UI.showLoading = function(msg, onlyTreePane) {
	if (onlyTreePane) {
		this.tree.panel.el.mask(msg);
	} else {
		this.window.getEl().mask(msg, 'fr-absolute-mask-msg', 'ext-el-mask fr-absolute-mask');
	}
};
FR.UI.doneLoading = function() {
	this.tree.panel.el.unmask();
	this.window.getEl().unmask();
};
FR.UI.getTextLogo = function(text) {
	var logoCls = 'logo3d';
	if (Settings.ui_logo_link_url) {
		text = '<a href="'+Settings.ui_logo_link_url+'" draggable="false">'+text+'</a>';
	} else {
		logoCls += ' unselectable';
	}
	return '<div class="'+logoCls+'" unselectable="on">'+text+'</div>';
};
FR.UI.getImageLogo = function(URL) {
	var html = '<img src="'+URL+'" border="0" alt="" draggable="false" />';
	var cls = '';
	if (Settings.ui_logo_link_url) {
		html = '<a href="'+Settings.ui_logo_link_url+'" draggable="false">'+html+'</a>';
	} else {
		cls = 'unselectable';
	}
	return '<div id="logoContainer" class="'+cls+'" draggable="false">'+html+'</div>';
};

FR.UI.getFileIconURL = function(iconFilename) {
	var theme = Settings.ui_theme;
	if (theme == 'drive') {theme = 'blue';}
	if (theme == 'one') {theme = 'blank';}
	if (theme == 'zoho') {theme = 'green';}
	return 'images/fico/'+theme+'/'+iconFilename;
}

FR.UI.getThumbURL = function(itemData) {
	var path = itemData.path;
	var url = FR.baseURL+'/t.php?p='+FR.utils.encodeURIComponent(path);
	if (itemData.filesize) {
		url += '&s='+itemData.filesize;
	}
	if (itemData.modified) {
		var timestamp = new Date(itemData.modified).getTime()/1000;
		url += '&t='+timestamp;
	}
	if (itemData.extra) {
		url += '&'+itemData.extra;
	}
	return url;
};

FR.UI.preloadImage = function(src, callback, scope, remove) {
	var dom = Ext.get(Ext.DomHelper.createDom({tag: 'img'}));
	dom.on('load', function () {
		callback.createDelegate(scope, [true, this, src])();
		if (remove) {this.remove();}
	});
	dom.on('error', function () {
		callback.createDelegate(scope, [false, this, src])();
		if (remove) {this.remove();}
	});
	dom.set({src: src});
	return dom;
}
FR.UI.cancelPreloadImage = function(dom) {
	dom.set({src: Ext.BLANK_IMAGE_URL});
	dom.remove(true);
}

FR.UI.bestBgFit = function(imgW, imgH, cW, cH, style) {
	var w = imgW;
	var h = imgH;
	if (imgW >= cW || imgH >= cH) {
		var containerRatio = cW / cH;
		var shrinkedW = imgW * containerRatio;
		var shrinkedH = imgH * containerRatio;
		if (style == 'contain') {
			if (shrinkedW >= cW || shrinkedH >= cH) {
				return {size: 'contain', pos: 'center'};
			}
		} else {
			if (shrinkedW >= cW && shrinkedH >= cH) {
				return {size: 'cover', pos: 'top'};
			} else {
				return {size: 'contain', pos: 'center'};
			}
		}
	}
	return {size: w+'px'+' '+h+'px', pos: 'center'};
}
FR.UI.setImageToContainer = function(opts) {
	var bg = FR.UI.bestBgFit(opts.img.width, opts.img.height, opts.container.getWidth(), opts.container.getHeight(), opts.style);
	opts.container
		.setStyle('background-image', 'url(\''+opts.img.src+'\')')
		.setStyle('background-position', bg.pos)
		.setStyle('background-size', bg.size);
	return bg;
}

FR.UI.calculateSelectionSize = function(link) {
	var paths = FR.UI.gridPanel.getSelectedAttrs('path');
	if (paths.length == 0) {
		paths = [];
		FR.UI.gridPanel.store.each(function(row) {
			paths.push(row.data['path']);
		});
	}
	Ext.fly(link).parent().load({
		url: FR.getBaseURL+'&page=filesize',
		method: 'post',
		params: {'paths[]': paths}
	});
}