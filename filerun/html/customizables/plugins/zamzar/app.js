FR = {
	UI: {},
	init: function() {
		this.viewport = new Ext.Viewport({
			layout: 'card', activeItem: 0,
			items: [
				{
					contentEl: 'selectFormat',
					autoScroll: true
				},
				{
					autoScroll: true,
					html: '<div id="status"></div>'
				}
			],
			listeners: {
				'afterrender': function() {
					Ext.each(Ext.query('div.format'), function(el) {
						Ext.get(el).on('click', function() {
							FR.format = this.dom.dataset.format;
							FR.requestConvertion();
						});
					});
				}, scope: this
			}
		});
	},
	requestConvertion: function() {
		this.viewport.getLayout().setActiveItem(1);
		this.log(FR.T('Uploading file to Zamzar...'));
		Ext.Ajax.request({
			url: URLRoot+'/?module=custom_actions&action=zamzar&method=requestConversion',
			params: {
				path: path,
				format: FR.format
			},
			callback: function(opts, succ, req) {
				try {
					var rs = Ext.util.JSON.decode(req.responseText);
				} catch (er){return false;}
				if (rs.msg) {
					window.parent.FR.UI.feedback(rs.msg);
					this.log(rs.msg);
					if (rs.success) {
						FR.jobId = rs.jobId;
						window.setTimeout(function () {
							FR.getStatus();
						}, 3000);
					}
				}
			},
			scope: this
		});
	},
	getStatus: function() {
		Ext.Ajax.request({
			url: URLRoot+'/?module=custom_actions&action=zamzar&method=getStatus',
			params: {
				path: path,
				jobId: FR.jobId
			},
			callback: function(opts, succ, req) {
				try {
					var rs = Ext.util.JSON.decode(req.responseText);
				} catch (er){return false;}
				if (rs.msg) {
					this.log(rs.msg);
					if (rs.status == 'successful') {
						window.parent.FR.UI.feedback(rs.msg);
						FR.downloadConverted(rs.fileId);
					} else {
						if (rs.status == 'failed') {
						} else {
							window.setTimeout(function(){FR.getStatus();}, 5000);
						}
					}
				}
			},
			scope: this
		});
	},
	downloadConverted: function(fileId) {
		this.log('Downloading converted file...');
		Ext.Ajax.request({
			url: URLRoot+'/?module=custom_actions&action=zamzar&method=downloadConverted',
			params: {
				path: path,
				fileId: fileId,
				format: FR.format
			},
			callback: function(opts, succ, req) {
				try {
					var rs = Ext.util.JSON.decode(req.responseText);
				} catch (er){return false;}
				if (rs.success) {
					window.parent.FR.utils.reloadGrid(rs.newFileName);
					window.parent.FR.UI.popups[windowId].close();
				}
			},
			scope: this
		});
	},
	log: function(txt) {
		Ext.DomHelper.append('status', {tag: 'div', html: txt});
	}
}
Ext.onReady(FR.init, FR);