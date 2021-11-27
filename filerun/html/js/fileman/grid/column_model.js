FR.components.gridColumnModel = Ext.extend(Ext.grid.ColumnModel, {
	constructor: function(config) {
		var columns = [
			{
				id: 'icon', header: '<a href="javascript:FR.utils.toggleGridSelection();" ext:qtip="'+FR.T('Select All')+'"><i class="fa fa-fw fa-check-circle fa-lg"></i></a>', renderer: function(v, m, r) {return r.data.iconHTML;},
				width: (FR.isMobile ? 40 : 50), align:'center', resizable: false, hideable: false, menuDisabled: true, sortable: false
			}, {
				id: 'filename', hideable: false,
				header: FR.T("Name"), renderer: function(v, m, r) {
					if (r.data.isFolder) {return v;}
					return r.data.filenameWithoutExt;
				},
				dataIndex: 'filename', width:220
			},{
				id: 'extension', hideable: false,
				header: '&nbsp;',
				dataIndex: 'ext', width:52
			},{
				id:'icons',
				header: '&nbsp;', renderer: function(v, m, r) {return r.data.icons;},
				width: (FR.isMobile ? 60 : 55), hideable: false, menuDisabled: true
			},{
				id: 'label', dataIndex: 'label', hidden: (!User.perms.read_comments || FR.isMobile),
				header: FR.T("Label"), width: 70,
				renderer: function(v) {if (v) {return v.html;}}
			},{
				id: 'nice_filesize', dataIndex: 'nice_filesize',
				header: FR.T("Size"), width: (FR.isMobile ? 90 : 75)
			},{
				id: 'type', dataIndex: 'type', hidden: true,
				header: FR.T("Type")
			},{
				id: 'meta_filetype', dataIndex: 'meta_filetype', custom: 'filetype', hidden: true,
				header: FR.T("Meta Type")
			},{
				id: 'modified', dataIndex: 'modified', hidden: FR.isMobile,
				header: FR.T("Modified"),
				renderer: function(v, col, row) {
					if (Settings.grid_short_date) {
						return row.data.modifiedHuman;
					}
					return Ext.util.Format.date(v, FR.T('Date Format: Files'));
				}
			},{
				id: 'created', dataIndex: 'created', hidden:true,
				header: FR.T("Created"),
				renderer: function(v, col, row) {
					if (Settings.grid_short_date) {
						return row.data.createdHuman;
					}
					return Ext.util.Format.date(v, FR.T('Date Format: Files'));
				}
			},{
				id: 'deleted', dataIndex: 'deleted', hidden:true,
				header: FR.T("Date deleted"),
				renderer: function(v, col, row) {
					if (Settings.grid_short_date) {
						return row.data.deletedHuman;
					}
					return Ext.util.Format.date(v, FR.T('Date Format: Files'));
				}
			},{
				id: 'trash_deleted_from', dataIndex: 'trash_deleted_from', hidden: true,
				header: FR.T("Deleted from"), width: 180
			},{
				id: 'path', dataIndex: 'path', hidden: true,
				header: FR.T("Location"), width: 180,
				renderer: FR.utils.humanFilePath
			},{
				dataIndex: 'comments', hidden:true,
				header: FR.T("Comments count"), width: 50,
				renderer: function(val) {return val>0?val:'';}
			},{
				dataIndex: 'tags', hidden:true, custom: 'tags',
				header: FR.T("Tags")
			},{
				dataIndex: 'rating', hidden:true, custom: 'rating', width: 90,
				header: FR.T("Rating"), renderer: function(v) {
					var s = '<ul class="rating-star">';
					s += '<li class="fa filledstar"></li>'.repeat(v);
					s += '</ul>';
					return s;
				}
			},{
				dataIndex: 'star', hidden:true,
				header: FR.T("Star"), width: 50,
				renderer: this.renderers.YesNo
			},{
				dataIndex: 'share', hidden:true,
				header: FR.T("Shared"), width: 60,
				renderer: this.renderers.YesNo
			},{
				dataIndex: 'hasWebLink', hidden:true,
				header: FR.T("Web Link"), width: 50,
				renderer: this.renderers.YesNo
			},{
				dataIndex: 'lockInfo', hidden:true,
				header: FR.T("Locked by"), width: 50,
				renderer: function(v) {return v ? v : '';}
			},{
				dataIndex: 'version', hidden:true,
				header: FR.T("Version"), width: 40,
				renderer: function(v) {return (v && v != '1') ? v : '';}
			},{
				dataIndex: 'isNew', hidden:true,
				header: FR.T("Is new"), width: 40,
				renderer: this.renderers.YesNo
			},
			{id: 'random', dataIndex: 'random', hidden: true, hideable: false, menuDisabled: true}
		];
		Ext.each(FR.UI.grid.customColumns, function(col) {
			if (col.custom == FR.specialMetaFields.title) {
				col.renderer = function(v, col, row) {
					if (!v) {return row.data.filename;}
					return v;
				};
			}
			columns.push(col);
		}, this);
		config = Ext.apply({
			defaults: {sortable: true, width: 120},
			columns: columns
		}, config);
		FR.components.gridColumnModel.superclass.constructor.call(this, config);
	},
	getMetaCols: function() {
		var cols = [];
		this.getColumnsBy(function(col, indx) {
			if (col.custom && !col.hidden) {
				cols.push(col.custom);
				return true;
			}
		}, this);
		return cols;
	},
	renderers: {
		YesNo: function(v) {return v ? FR.T('Yes') : '';}
	}
});