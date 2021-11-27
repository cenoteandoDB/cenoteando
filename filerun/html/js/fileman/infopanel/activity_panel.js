FR.components.activityPanel = Ext.extend(Ext.ux.ListPanel, {
	path: false,
	paginated: true,
	locateOnSel: true,
	title: '<i class="fa fa-fw fa-globe"></i>',

	initComponent: function() {
		this.tabTip = FR.T('Activity');
		this.store = new Ext.data.JsonStore({
			url: '?module=filelog&section=ajax&page=all',
			root: 'records', totalProperty: 'totalCount',
			fields: [
				{name:'date_added', type:'date'},'time_ago','path','filename', 'filename_short','isFolder','icon','thumb','details','n'
			],
			listeners: {
				'load': function() {this.updateStatus(0);},
				'exception': function(p, t, a, opt, response) {
					var d = opt.reader.jsonData;
					if (d && d.msg) {FR.UI.feedback(d.msg, true);}
				},
				scope: this
			}
		});
		this.listViewCfg = {
			emptyText: FR.T('There are no activity records'),
			columns: [],
			itemSelector: 'div.eventItem',
			tpl: new Ext.XTemplate(
				'<tpl for="rows">' +
					'<div class="eventItem">' +
							'{[this.getIconHTML(values)]}' +
							'<div class="txt">' +
								'<div class="fn"><tpl if="n &gt; 0"><i class="fa fa-bolt icon-red new"></i></tpl> {filename}</div>' +
								'<div class="d">{details}</div>' +
								'<div><span class="t" title="{date_added}">{time_ago}</span></div>' +
							'</div>' +
					'</div>' +
				'</tpl>',
				{getIconHTML: this.getIconHTML}
			)
		};
		Ext.apply(this, {
			listeners: {
				'activate': function(p) {p.active = true;this.onInfoPanelRefresh();},
				'deactivate': function(p) {p.active = false;}
			}
		});
		FR.components.activityPanel.superclass.initComponent.apply(this, arguments);
	},
	updateStatus: function(newCount, add) {
		var alert;
		if (add) {newCount += this.titleNumber;}
		if (add || newCount > this.titleNumber && this.titleNumber > 0) {
			if (FR.localSettings.get('sound-notif', Settings.sound_notification ? 'enabled' : 'disabled') == 'enabled') {
				FR.audioNotification();
				alert = true;
			}
		}
		this.setTitleNumber(newCount, alert);
	},
	onInfoPanelRefresh: function() {
		if (!this.active) {return false;}
		var path;
		if (!this.infoPanel.item) {
			path = FR.currentPath;
		} else {
			path = this.infoPanel.item.data.path;
		}
		if (path == this.path) {return false;}
		this.path = path;

		this.store.removeAll(true);
		this.listView.refresh();

		this.store.setBaseParam('path', this.path);
		this.store.load();
	}
});