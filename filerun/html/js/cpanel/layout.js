FR.tempPanel = new Ext.Panel({html:''});
FR.feedback = function(text) {
	if (!text) {return false;}
	if (Ext.util.Format.stripTags(text).length > 100) {
		new Ext.Window({
			width: 350, height: 160, layout: 'fit', items: {bodyStyle: 'padding:5px', html: text, autoScroll: true}
		}).show();
		return false;
	}
	var delay = Math.max(text.length/15, 2);
	if (!FR.UI.feedbackCt) {
		FR.UI.feedbackCt = Ext.DomHelper.append(document.body, {style:'position:absolute;width:300px;z-index:9999999'}, true);
	}
	var m = Ext.DomHelper.append(FR.UI.feedbackCt, {html:'<div class="fr-feedback-msg">'+text+'</div>'}, true);
	FR.UI.feedbackCt.alignTo(Ext.getBody(), 'br-br', [5, 0]);
	m.slideIn('b').pause(delay).ghost('b', {remove: true});
};

FR.regionNorth = {region: 'north', height: 0, items: FR.tempPanel};
if (Ext.isMobile) {
	FR.regionNorth = {
		region: 'north', height: 1, items: FR.tempPanel, bodyStyle: 'border-bottom:1px solid #E1E1E1',
		tbar: [
			{
				iconCls: 'fa fa-lg fa-fw fa-bars',
				style: 'margin-right:5px;',
				toggleHandler: function () {
					Ext.getCmp('FR-Tree-Region').toggleCollapse();
				},
				enableToggle: true, pressed: true
			}
		]
	};
}

FR.initLayout = function() {
	FR.viewPort = new Ext.Viewport({
		id: 'viewport',
		layout: 'border',
		items: [
			FR.regionNorth,
			{
				region: 'west', layout: 'border', split: true, width: 195,
				id: 'FR-Tree-Region', stateful: false,
				items: FR.tree.panel
			},
			{
				region: 'center', layout: 'card',
				id: 'cardDisplayArea',
				activeItem: 0,
				items: [
					{
						xtype: 'tabpanel',
						id: 'gridTabPanel',
						activeItem: 0,
						items: [
							FR.grid.panel
						],
						listeners: {
							'tabchange': function(tp, tab) {
								if (tab.form) {FR.thisFormPanel = tab;}
							}
						}
					},
					{id: 'appTab', html: '', layout: 'fit'}
				]
			}
		]
	})
};