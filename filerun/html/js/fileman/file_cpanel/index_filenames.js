Ext.onReady(function() {
	new Ext.Viewport({
		layout: 'fit',
		items: [{
			xtype: 'filerun-cpanel-app',
			layout: 'fit',
			tbarItems: [
				{
					text: FR.T('Run'),
					cls: 'fr-btn-primary',
					id: 'startBtn',
					handler: function(){
						this.ownerCt.ownerCt.load({
							url: URLRoot+'/?module=file_cpanel&page=index_filenames&action=index',
							params: {path: FR.path},
							text: FR.T('Processing..')
						});
					}
				}
			],
			autoScroll: true,
			html: FR.T('If the folder contains files that were added from outside FileRun, this action will make the files names searchable.')
		}]
	});
});