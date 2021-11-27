FR = {
	currentSelectedFile: '', currentPath: false, previousPath: false, components: {}, actions: {}, tmp: {}, ext: [], customActions: {}, copyingPaths: [], isMobile: false, filePicker: false,
	UI: {title: '', xy: [], popups: [], tree: {}, changePassWindow: '', grid: {}, uploadWindow: false},
	localSettings: {
		get: function(s, def) {
			var v = Ext.state.Manager.getProvider().get('settings-'+s);
			return def ? (v ? v : def) : v;
		},
		set: function(s, v) {
			Ext.state.Manager.getProvider().set('settings-'+s, v);
		}
	},
	labels: new Ext.util.MixedCollection(),
	audioNotification: function() {
		var audio = Ext.DomHelper.append(Ext.getBody(), {tag: 'audio', src:'sounds/new.mp3', preload: 'auto'});
		if (audio.canPlayType) {audio.play();}
	},
	getPathFromHash: function() {
		var p;
		try {
			p = document.location.hash.substring(1);
			p = decodeURIComponent(p);
		} catch (er) {return false;}
		if (p.substring(0, 1) != '/') {
			p = '/HOME';
			if (!Settings.has_home_folder) {return false;}
		}
		return '/ROOT' + p;
	},
	push2History: function(path) {
		if (FR.pushState) {
			if (typeof window.history.pushState !== 'undefined') {
				window.history.pushState({path: path}, '', '#' + path.substring(5));
			}
		}
		FR.pushState = true;
	},
	handleHistoryPath: function(p) {
		var qPos = p.indexOf('?');
		if (qPos != -1) {
			var searchParams = p.substring(qPos+1);
			try {
				searchParams = Ext.decode(searchParams, true);
			} catch (er) {}
			if (typeof searchParams != 'object') {
				FR.utils.browseToPath(p);
				return false;
			}
			p = p.substring(0, qPos);
			FR.utils.locateItem(p, false, function(found) {
				if (found) {
					FR.UI.searchPanel.doSearch(searchParams);
				}
			});
		} else {
			if (FR.UI.gridPanel.view.searchMode) {
				FR.UI.searchPanel.close(true);
			}
			var pos = p.indexOf('|');
			if (pos != -1) {
				var folderPath = p.substring(0, pos);
				var fileName = p.substring(pos+1);
				FR.utils.locateItem(folderPath, fileName);
			} else {
				FR.utils.browseToPath(p);
			}
		}
	}
};
Ext.onReady(function() {
	FR.UI.title = Settings.title;

	FR.baseURL = URLRoot;
	FR.doBaseURL = URLRoot+'/?module=fileman&section=do';
	FR.getBaseURL = URLRoot+'/?module=fileman&section=get';
	FR.logoutURL = Settings.logoutURL || URLRoot + '/?module=fileman&page=logout';

	FR.isMobile = Ext.isMobile;

	if (!FR.isMobile) {
		Ext.QuickTips.init();
	}

	var GET = Ext.urlDecode(document.location.search.substring(1));
	FR.filePicker = GET.picker || false;

	FR.initToolbar();
	FR.initTree();
	FR.initLayout();

	if (User.perms.file_history && Settings.enablePusher) {
		var pusher = new Pusher(Settings.pusherAppKey, {
			authEndpoint: '?module=fileman&section=utils&page=pusher_auth',
			cluster: Settings.pusherCluster, encrypted: true
		});
		var notifications = pusher.subscribe('private-'+User.id);
		notifications.bind('notifications', function(data) {
			if (data.action == 'comment_added') {if (!User.perms.read_comments) {return false;}}
			if (data.msg) {FR.UI.feedback(data.msg);}
			FR.UI.infoPanel.tabs.activityPanel.updateStatus(1, true);
		});
		pusher.subscribe('presence-channel');
	}

	FR.pushState = true;
	window.onpopstate = function (event) {
		if (event.state == null) {return;}
		if (event.state.path) {
			FR.pushState = false;
			FR.handleHistoryPath(event.state.path);
		}
	};
	window.onhashchange = function() {
		var p = FR.getPathFromHash();
		if (p) {
			FR.handleHistoryPath(p);
		}
	};
	var p = FR.getPathFromHash();
	if (p) {
		FR.handleHistoryPath(p);
	} else {
		FR.UI.tree.selectFirstVisible();
	}

	if (User.requiredToChangePass) {
		new Ext.ux.prompt({
			text: FR.T('You are required to change your password.'),
			callback: FR.actions.openAccountSettings
		});
	}
	if (Settings.welcomeMessage.length > 0) {
		new Ext.ux.prompt({text: '<div style="max-height:300px;overflow:auto">'+FR.T(Settings.welcomeMessage)+'</div>'});
	}
	Ext.getDoc().on('paste', FR.actions.handlePaste);
	Ext.fly('loadMsg').fadeOut();

	if (!Settings.has_home_folder && User.isAdmin) {
		FR.actions.openControlPanel();
	}
});