Ext.onReady(function() {
	new Ext.Viewport({
		layout: 'fit',
		items: [{
			xtype: 'filerun-cpanel-app',
			layout: 'fit',
			tbarItems: [
				{
					text: FR.T('Clear cache'),
					cls: 'fr-btn-primary',
					id: 'startBtn',
					handler: function(){
						this.ownerCt.ownerCt.load({
							url: URLRoot+'/?module=file_cpanel&page=clear_thumb_cache&action=clear',
							params: {path: FR.path},
							text: FR.T('Processing..')
						});
					}
				}
			],
			html: FR.T('This will remove all the thumbnails and previews that were generated for files located inside this folder and its subfolders.')
		}]
	});
});