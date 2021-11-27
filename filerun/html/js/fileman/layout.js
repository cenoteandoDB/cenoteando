FR.initLayout = function() {
	Ext.get(document).on('dragover', function(e) {
		e = e.browserEvent;
		e.dataTransfer.dropEffect = 'none';
	}, false, {stopEvent: true});
	Ext.get(document).on('drop', function(e) {}, false, {stopEvent: true});

	Ext.getBody().on('mousemove', function(e){FR.UI.xy = e.getXY();});
	Ext.getBody().on('contextmenu', function(e, el) {if (!Ext.fly(el).hasClass('x-form-field')) {e.stopEvent();}});

	var bodyWidth = Ext.getBody().getWidth();
	var treePanelWidth = 200;
	if (bodyWidth > 1024) {treePanelWidth = 230;}
	if (FR.isMobile) {treePanelWidth = 300;}

	FR.UI.gridPanel = new FR.components.gridPanel({
		id: 'FR-Grid-Panel',
		listeners: {
			'folderChange': function() {
				FR.UI.infoPanel.folderChange();
			}
		}
	});
	Ext.DomHelper.append(Ext.getBody(), {tag: 'div', id: 'explorer-shadow'});

	FR.UI.quotaIndicator = new Ext.Panel({
		region: 'south', height: 40, hidden: !(User.perms.space_quota_max > 0), bodyStyle: 'border-top: 1px solid #DFDFDF;text-align:center;padding:13px;font-size:11px;color:gray;',
		listeners: {'render': function(pb) {pb.mon(pb.getEl(), 'click', FR.UI.reloadStatusBar, this);}}
	});
	FR.UI.poweredBy = new Ext.Panel({
		region: 'south', height: 25, bodyStyle: 'padding:6px;font-size:11px;color:silver;',
		html: 'powered by <a href="https://filerun.com" target="_blank" style="color:silver">FileRun</a>'
	});
	FR.UI.searchPanel = new FR.components.SearchPanel({
		id: 'FR-SearchPanel', region: 'north', height: 100,
		animCollapse: false, stateful: false, collapsed: true
	});
	FR.UI.AudioPlayer = new FR.components.AudioPlayer({
		id: 'FR-AudioPlayer', region: 'south', height: 140,
		animCollapse: false, stateful: false, collapsed: true
	});

	FR.UI.explorerPanel = new Ext.Panel({
		region: 'center', layout: 'border',
		items: [
			{
				region: 'west', id: 'FR-Tree-Region', split: true, collapsed: FR.isMobile,
				width: treePanelWidth, layout: 'border', minWidth: 185, maxWidth: 600,
				stateful: !FR.isMobile,
				items: [
					FR.UI.tree.panel,
					(Settings.free_mode ? FR.UI.poweredBy : FR.UI.quotaIndicator)
				]
			},
			{
				layout: 'border', region: 'center', id: 'FR-Center-Region', split:true,
				tbar: FR.UI.gridToolbar,
				items: [
					FR.UI.searchPanel,
					FR.UI.gridPanel,
					FR.UI.AudioPlayer
				]
			},
			{region: 'north', height:0, unstyled: true, html:''}
		]
	});

	var infoPanelState = FR.localSettings.get('infoPanelState', bodyWidth < 900 ? 'collapsed' : 'expanded');

	var defaultInfoPanelWidth = bodyWidth < 1200 ? 270 : 350;
	if (FR.isMobile) {defaultInfoPanelWidth = 300;}
	var infoPanelWidth = FR.localSettings.get('infoPanelWidth', defaultInfoPanelWidth);

	FR.UI.infoPanel = new FR.components.infoPanel({
		region: 'east', width: infoPanelWidth, collapsed: (infoPanelState == 'collapsed'),
		split: true, id: 'FR-Info-Region', minWidth: 270, maxWidth: 350, collapseMode: 'mini',
		listeners: {
			'collapse': function() {
				FR.UI.actions.info.toggle(false, true);
			},
			'expand': function() {
				FR.UI.actions.info.toggle(true, true);
				this.refresh();
			}
		}
	});
	if (FR.isMobile || bodyWidth < 850) {
		FR.UI.actions.logo.hide();
	}
	FR.UI.window = new Ext.Viewport({
		layout: 'fit',
		items:  {
			layout: 'fit',
			tbar: FR.UI.headerTBar,
			items: {
				layout: 'border', region: 'center',
				items: [
					FR.UI.explorerPanel,
					FR.UI.infoPanel
				]
			}
		}
	});
	if (User.perms.space_quota_max) {FR.UI.updateQuotaStatus();}
};