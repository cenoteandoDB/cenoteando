FR.components.commentsPanel = Ext.extend(Ext.ux.ListPanel, {
	path: false,
	title: '<i class="fa fa-fw fa-comments-alt"></i>',
	layout: 'border',

	initComponent: function() {
		this.tabTip = FR.T('Comments');
		this.store = new Ext.data.JsonStore({
			url: URLRoot+'/?module=comments&section=ajax&page=load',
			root: 'comments', totalProperty: 'totalCount', id: 'id',
			fields: ['id', 'date_added', 'timer', 'uid', 'val', 'username', 'fullName', 'self', 'followup'],
			listeners: {
				'load': function(store) {
					var d = store.reader.jsonData;
					if (d.error) {
						this.listView.getTemplateTarget().update('<div class="x-list-message">'+d.error+'</div>');
					}
					FR.utils.applyFileUpdates(d.path, {comments: d.totalCount});
					this.listView.innerBody.parent().scroll('b', 10000, true);
				},
				scope: this
			}
		});

		var tpl = '<div class="comments">'+
			'<div class="x-clear"></div>' +
			'<tpl for="rows">'+
				'<div class="comment <tpl if="self">own</tpl> <tpl if="followup">followup</tpl>">'+
					'<tpl if="!uid"><div class="name">{fullName}</div></tpl>' +
					'<tpl if="uid"><div class="name">{fullName}</div></tpl>' +
					'<div class="x-clear"></div>'+
					'<tpl if="!followup"><div class="avatar" ext:qtip="{fullName}&lt;br&gt; {date_added:date("l, F jS, Y \\\\a\\\\t h:i A")}" style="background-image:url(a/?uid={uid})"></div></tpl>' +
					'<div class="text"><div class="inner">';
			if (User.perms.write_comments){
				tpl +=  '<div class="removeBtn"><a onclick="FR.UI.deleteComment(\''+this.id+'\', \'{id}\')"><i class="fa fa-close"></i></a></div>';
			}
				tpl +=  '{val}'+
					'</div></div>'+

				'</div>'+
				'<div class="x-clear"></div>'+
			'</tpl>'+
		'</div>'+
		'<div class="x-clear"></div>';

		this.listViewCfg = {
			emptyText: FR.T('No comments available for this item'),
			region: 'center',
			flex: 1, autoScroll: true, columns: [],
			tpl: tpl,
			listeners: {
				'containercontextmenu': this.print,
				scope: this
			}
		};
		this.inputBox = new Ext.form.TextArea({
			flex: 1,
			emptyText: FR.T('Write a comment...'), enableKeyEvents: true,
			listeners: {
				'keydown': function(field, e) {
					if (e.getKey() == e.ENTER) {if (!e.shiftKey) {this.addComment();}}
				}, scope: this
			}
		});
		this.writePanel = new Ext.Panel({
			region: 'south', layout: 'fit', cls: 'commentField',
			height: 64, layoutConfig: { align: "stretch" }, split:true,
			stateful: false,
			items: this.inputBox
		});
		this.extraItem = this.writePanel;
		Ext.apply(this, {
			listeners: {
				'activate': function(p) {
					p.active = true;
					p.inputBox.focus();
					p.onInfoPanelRefresh();
				},
				'deactivate': function(p) {p.active = false;}
			}
		});
		FR.components.commentsPanel.superclass.initComponent.apply(this, arguments);
	},
	onInfoPanelRefresh: function() {
		var path, cCount = 0;
		if (!this.infoPanel.item) {
			path = FR.currentPath;
		} else {
			path = this.infoPanel.item.data.path;
			cCount = this.infoPanel.item.data.comments;
		}
		this.setTitleNumber(cCount);
		if (path == this.path) {return false;}
		if (!this.active) {return false;}

		this.path = path;
		this.store.removeAll(true);
		this.listView.refresh();

		if (FR.utils.canAddComments()) {
			this.writePanel.show();
		} else {
			this.writePanel.hide();
		}
		this.doLayout(true);

		this.store.setBaseParam('path', path);
		this.store.load();
	},
	addComment: function() {
		var c = this.inputBox.getValue();
		if (c.length > 0) {
			this.action('add', {comment: c});
		}
	},
	print: function() {
		window.open(URLRoot+'/?module=comments&page=print&path='+encodeURIComponent(this.path));
	},
	deleteComment: function(cid) {
		new Ext.ux.prompt({
			text: FR.T('Are you sure you want to remove the comment?'),
			confirmHandler: function() {
				this.action('remove', {commentId: cid});
			}, scope: this
		});
	},
	action: function(action, params) {
		FR.actions.process({
			url: '/?module=comments&section=ajax&page='+action,
			params: Ext.apply(params, this.store.baseParams),
			loadMsg: 'Loading...',
			successCallback: function() {
				this.inputBox.reset();
				this.store.load();
			}, scope: this
		});
	}
});
FR.UI.deleteComment = function(panelId, cId) {Ext.getCmp(panelId).deleteComment(cId);};