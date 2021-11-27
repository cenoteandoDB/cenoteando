FR = {
	waiting: false,
	init: function () {
		this.viewport = new Ext.Viewport({
			layout: 'fit',
			items: {
				layout: 'fit',
				border: false,
				html: '<iframe id="editFrame" style="display:none;width:100%;height100%;" scrolling="no" width="100%" height="100%" frameborder="0"></iframe>'
			}
		});
		this.authenticate();
		this.popupChecker = new Ext.util.TaskRunner();
		this.popupChecker.start({
			run: function(){
				if (this.popup.closed) {
					if (this.waiting) {
						this.popupChecker.stopAll();
						this.retrieveFile(this.sendFileResults.data.id);
					} else {
						window.parent.FR.UI.popups[windowId].close();
					}
				}
			},
			scope: this,
			interval: 500
		});
	},
	openInPopup: function(args) {
		var width = 900;
		var height = 500;
		var left = ((screen.width / 2) - (width / 2));
		var top = (screen.height-height) / 4;
		return window.open(args.url, args.name, 'scrollbars=yes, width=' + width + ', height=' + height + ', top=' + top + ', left=' + left);
	},
	authenticate: function() {
		this.viewport.getEl().mask(FR.T('Signing into Google...<br>Please check the opened popup for proceeding to the editor.'));
		this.popup = this.openInPopup({url: URLRoot+'/?module=custom_actions&action=google&method=gauth', name: 'gEditPopup'});
	},
	sendFile: function() {
		this.viewport.getEl().mask(FR.T('Sending document data to Google...<br>Please wait.'));
		Ext.Ajax.request({
			url: URLRoot+'/?module=custom_actions&action=google&method=sendFile',
			params: {
				path: path,
				filename: filename
			},
			success: function(req) {
				this.viewport.getEl().unmask();
				try {
					this.sendFileResults = Ext.util.JSON.decode(req.responseText);
				} catch (er){return false;}

				if (this.sendFileResults.success) {
					if (this.sendFileResults.data.webViewLink) {
						this.popup.location.href = this.sendFileResults.data.webViewLink;
						this.viewport.getEl().mask(FR.T('Waiting for the editor to close...<br>If you close this window, your changes will not be saved to the document.'));
						this.waiting = true;
					}
				} else {
					this.popup.close();
					if (this.sendFileResults.msg) {window.parent.FR.UI.feedback(this.sendFileResults.msg);}
					window.parent.FR.UI.popups[windowId].close();
				}
			},
			scope: this
		});
	},
	retrieveFile: function(fileId) {
		this.viewport.getEl().mask(FR.T('Importing document from Google...'));
		Ext.Ajax.request({
			url: URLRoot+'/?module=custom_actions&action=google&method=retrieveFile',
			params: {
				path: path,
				filename: filename,
				fileId: fileId
			},
			success: function(req) {
				this.viewport.getEl().unmask();
				try {
					var rs = Ext.util.JSON.decode(req.responseText);
				} catch (er){return false;}
				if (rs.msg) {window.parent.FR.UI.feedback(rs.msg);}
				if (rs.success) {
					window.parent.FR.utils.reloadGrid(rs.filename);
					window.parent.FR.UI.popups[windowId].close();
				}
			},
			scope: this
		});
	}
}