FR = {
	UI: {},
	init: function() {
		this.pbar = new Ext.ProgressBar({animate: true, width:480, hidden: true});
		this.viewport = new Ext.Viewport({
			layout: 'card', activeItem: 0,
			items: [
				{
					contentEl: 'selectFormat',
					autoScroll: true
				},
				{
					autoScroll: true,
					html: '<div id="status"></div>',
					tbar: [this.pbar]
				}
			],
			listeners: {
				'afterrender': function() {
					Ext.each(Ext.query('div.format'), function(el) {
						Ext.get(el).on('click', function() {
							FR.requestConvertion(this.dom.dataset.format);
						});
					});
				}, scope: this
			}
		});
	},
	requestConvertion: function(format) {
		this.viewport.getLayout().setActiveItem(1);
		this.log(FR.T('Requesting conversion...'));
		Ext.Ajax.request({
			url: URLRoot+'/?module=custom_actions&action=cloudconvert&method=requestConversion',
			params: {
				path: path,
				format: format
			},
			callback: function(opts, succ, req) {
				try {
					var rs = Ext.util.JSON.decode(req.responseText);
				} catch (er){return false;}
				if (rs.msg) {
					window.parent.FR.UI.feedback(rs.msg);
					FR.statusURL = rs.url;
					this.log(rs.msg);
					this.pbar.show();
					window.setTimeout(function(){FR.getStatus();}, 2000);
				}
			},
			scope: this
		});
	},
	getStatus: function() {
		var progress = 0;
		Ext.Ajax.request({
			url: URLRoot+'/?module=custom_actions&action=cloudconvert&method=getStatus',
			params: {
				path: path,
				statusURL: FR.statusURL
			},
			callback: function(opts, succ, req) {
				try {
					var rs = Ext.util.JSON.decode(req.responseText);
				} catch (er){return false;}
				if (rs.msg) {
					this.log(rs.msg);
					if (rs.step == 'downloaded') {
						window.parent.FR.UI.feedback(rs.msg);
						progress = 1;
						window.parent.FR.utils.reloadGrid(rs.newFileName);
						window.parent.FR.UI.popups[windowId].close();
					} else {
						if (rs.step == 'error') {
							progress = 0;
						} else {
							progress = rs.percent/100;
							window.setTimeout(function(){FR.getStatus();}, 3000);
						}
					}
					this.pbar.updateProgress(progress, FR.T(rs.msg));
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