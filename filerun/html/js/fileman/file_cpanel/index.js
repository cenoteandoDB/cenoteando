FR.init = function() {
	this.tree = {};
	this.tree.panel = new Ext.tree.TreePanel({
		autoScroll: true, containerScroll: true, rootVisible: false, trackMouseOver: false,
		listeners: {
			//'contextmenu': function (tree, e) {e.stopEvent();return false;},
			'beforecollapsenode': function() {return false;},
			'afterrender': function() {
				this.getRootNode().findChild('page', 'details').select();
			}
		},
		root: {
			expanded: true,
			id: 'root',
			children: [
				{
					text: FR.T('Details'),
					iconCls: 'fa fa-fw fa-info-circle',
					page: 'details'
				},
				{
					text: FR.T('Users with direct access'),
					iconCls: 'fa fa-fw fa-users',
					page: 'users'
				},
				{
					text: FR.T('Shares'),
					iconCls: 'fa fa-fw fa-user-plus',
					page: 'shares'
				},
				{
					text: FR.T('Web Links'),
					iconCls: 'fa fa-fw fa-link',
					page: 'weblinks'
				},
				{
					text: FR.T('Maintenance'),
					iconCls: 'fa fa-fw fa-tools',
					cls: 'sysConfMenuItem',
					expanded: true, hidden: !FR.isFolder,
					children: [
						{
							text: FR.T('Index file names'),
							iconCls: 'fa fa-fw fa-search',
							page: 'index_filenames'
						},
						{
							text: FR.T('Index file metadata'),
							iconCls: 'fa fa-fw fa-search',
							src: URLRoot+'/?module=metadata&section=index'
						},
						{
							text: FR.T('Clear preview cache'),
							iconCls: 'fa fa-fw fa-images',
							page: 'clear_thumb_cache'
						}
					]
				},
				{
					text: FR.T('Troubleshoot'),
					iconCls: 'fa fa-fw fa-bug',
					expanded: true, hidden: FR.isFolder,
					children: [
						{
							text: FR.T('Thumbnail generation'),
							iconCls: 'fa fa-fw fa-image',
							page: 'troubleshoot_thumb'
						},
						{
							text: FR.T('Preview generation'),
							iconCls: 'fa fa-fw fa-eye',
							page: 'troubleshoot_preview'
						},
						{
							text: FR.T('Metadata extraction'),
							iconCls: 'fa fa-fw fa-info-square',
							page: 'troubleshoot_metadata'
						},
						{
							text: FR.T('Searching'),
							iconCls: 'fa fa-fw fa-search',
							expanded: true,
							children: [
								{
									text: FR.T('Content extraction'),
									page: 'troubleshoot_content_extraction'
								},
								{
									text: FR.T('Content indexing'),
									page: 'troubleshoot_content_indexing'
								}
							]
						}
					]
				}
			]
		}
	});

	this.tree.panel.getSelectionModel().on('beforeselect', function(selectionModel, treeNode) {
		var a = treeNode.attributes;
		if (!a.page && !a.src) {return false;}
	});
	this.tree.panel.getSelectionModel().on('selectionchange', function(selectionModel, treeNode) {
		var url = FR.baseURL;
		if (treeNode.attributes.src) {
			url = treeNode.attributes.src+'&path='+encodeURIComponent(FR.path);
		} else {
			url += '&page='+encodeURIComponent(treeNode.attributes.page);
		}
		Ext.get('displayFrame').dom.src = url;
	});



	FR.viewPort = new Ext.Viewport({
		layout: 'border',
		items: [
			{
				region: 'west', layout: 'fit', split: true, width: 220,
				id: 'FR-Tree-Region', stateful: false,
				items: FR.tree.panel
			},
			{
				region: 'center', layout: 'card',
				id: 'displayArea',
				activeItem: 0,
				html: '<iframe style="width: 100%;height: 100%;border: 0;" id="displayFrame"></iframe>'
			}
		]
	});
};

Ext.onReady(function() {
	FR.baseURL = URLRoot+'/?module=file_cpanel&_popup_id='+encodeURIComponent(FR.popupId)+'&path='+encodeURIComponent(FR.path);
	FR.init();
});