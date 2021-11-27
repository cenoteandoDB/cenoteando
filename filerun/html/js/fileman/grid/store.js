FR.components.gridStore = Ext.extend(Ext.data.Store, {
	loadParams: {}, initialSort: false,
	constructor: function(config) {
		var cols = [
			{name: 'uniqid', mapping: 'id'},
			{name: 'pid'},
			{name: 'isFolder', mapping: 'dir'},
			{name: 'objectType', mapping: 'ot', convert: function(v, r) {return v || (r.dir ? 'folder':'file');}},
			{name: 'filename', mapping: 'n',
				convert: function(v, r) {
					if (!r.dir) {
						var split = FR.utils.splitNameAndExt(v);
						r.filenameWithoutExt = split.namePart;
						r.ext = split.ext;
					}
					return v;
				},
				sortFunction: function(r1, r2) {
					return compareAlphaNum(r1.data.filename, r2.data.filename);
				}
			},
			{name: 'filenameWithoutExt'},
			{name: 'ext'},
			{name: 'filetype', mapping: 'ft'},
			{name: 'trash_deleted_from', mapping: 'tdf'},
			{name: 'filesize', mapping: 's'},
			{name: 'nice_filesize', mapping: 'ns', sortFunction: function(r1, r2) {
				var v1 = Ext.data.SortTypes.asInt(r1.get('filesize'));
				var v2 = Ext.data.SortTypes.asInt(r2.get('filesize'));
				return (v1 > v2 ? 1 : (v1 < v2 ? -1 : 0));
			}},
			{name: 'icon', mapping: 'i'},
			{name: 'type', mapping: 't'},
			{name: 'thumb', mapping: 'th'},
			{name: 'meta_filetype', mapping: 'mf'},
			{name: 'modified', mapping: 'm', type:'date', dateFormat:'m/d/Y h:i'},
			{name: 'modifiedHuman', mapping: 'mh'},
			{name: 'created', mapping: 'c', type:'date', dateFormat:'m/d/Y h:i'},
			{name: 'createdHuman', mapping: 'ch'},
			{name: 'deleted', mapping: 'd', type:'date', dateFormat:'m/d/Y h:i'},
			{name: 'deletedHuman', mapping: 'dh'},
			{name: 'taken', mapping: 'dt', type: 'int'},
			{name: 'isNew', mapping: 'new'},
			{name: 'hasWebLink', mapping: 'hW'},
			{name: 'share', mapping: 'sh'},
			{name: 'notInfo', mapping: 'fn'},
			{name: 'comments', mapping: 'cc'},
			{name: 'label', mapping: 'l', convert: function(v, r) {
				if (!v) {return false;}
				var s = v.split('|');
				return {
					color: s[1],
					text: s[0],
					html: '<div class="FRLabel"'+(s[1] ? 'style="background-color: '+s[1]+';"' : '')+'>'+s[0]+'</div>'
				};
			}, sortFunction: function(r1, r2) {
				var l1 = r1.get('label'), l2 = r2.get('label');
				if (!l1) {return -1;}
				if (!l2) {return 1;}
				return compareAlphaNum(l2.text.toLowerCase(), l1.text.toLowerCase());
			}},
			{name: 'tags', mapping: 'tg'},
			{name: 'rating', mapping: 'r'},
			{name: 'star', mapping: 'st'},
			{name: 'path', mapping: 'p', convert: function(v, r) {return v || FR.currentPath+'/'+r.n;}},
			{name: 'lockInfo', mapping: 'lI'},
			{name: 'version', mapping: 'v'},
			{name: 'random', convert: function(v, r) {return Math.floor(Math.random() * 1000);}}
		];
		Ext.each(FR.UI.grid.customColumns, function(col) {
			cols.push({name: col.dataIndex});
		}, this);
		config = Ext.apply({
			proxy: new Ext.data.HttpProxy({url: FR.getBaseURL + '&page=grid'}),
			reader: new Ext.data.JsonReader({root: 'files', totalProperty: 'count', id: 'id'}, cols)
		}, config);
		FR.components.gridStore.superclass.constructor.call(this, config);
	},
	loadByPath: function(path) {
		path = Ext.value(path, FR.currentPath);
		var url = FR.baseURL;
		var sendPath = true;
		if (path == '/ROOT/TRASH') {
			url += '/?module=trash&section=ajax&page=grid';
			sendPath = false;
		} else if (path == '/ROOT/STARRED') {
			url += '/?module=stars&page=grid';
			sendPath = false;
		} else if (path.indexOf('/ROOT/Photos') == 0) {
			url += '/?module=photos&page=grid';
		} else if (path.indexOf('/ROOT/Videos') == 0) {
			url += '/?module=videos&page=grid';
		} else if (path.indexOf('/ROOT/Music') == 0) {
			url += '/?module=music';
		} else if (path == '/ROOT/WLINKED') {
			url += '/?module=weblinks&section=ajax&page=grid';
			sendPath = false;
		} else if (path == '/ROOT/SHARES') {
			url += '/?module=share&section=ajax&page=grid';
			sendPath = false;
		} else if (path == '/ROOT/RECENT') {
			url += '/?module=filelog&page=recent';
			sendPath = false;
		} else if (path.indexOf('/ROOT/Collections') == 0) {
			url += '/?module=collections&page=grid';
		} else {
			if (FR.UI.gridPanel.view.searchMode) {
				url += '/?module=search&section=ajax&page=grid';
			} else {
				url = FR.getBaseURL + '&page=grid';
			}
		}
		this.proxy.conn.url = url;

		if (sendPath) {
			this.loadParams.path = path;
		} else {
			delete this.loadParams.path;
		}

		this.load({params: this.loadParams});
	},
	applySort: function() {
		if (!this.sortInfo) {this.sortInfo = {field: 'filename', direction: 'ASC'};}
		if (this.initialSort) {
			this.sortInfo = this.initialSort;
			this.initialSort = false;
		}
		this.multiSortInfo = {
			sorters: [
				{field: 'isFolder', direction: 'DESC'}
			],
			direction: 'DESC'
		};
		this.hasMultiSort = true;
		if (this.sortInfo == 'server') {
			this.sortInfo = false;
		} else {
			this.multiSortInfo.sorters.push({field: this.sortInfo.field, direction: this.sortInfo.direction});
			this.multiSortInfo.direction = this.sortInfo.direction;
		}
		FR.components.gridStore.superclass.applySort.apply(this, arguments);
	}
});