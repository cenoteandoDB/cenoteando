FR.editGroup = {};
FR.editGroup.formPanel = new FR.components.editForm({
	title: FR.T('Edit group')+' "'+FR.groupInfo.name+'"',
	layout: 'form', bodyStyle: 'padding:10px;', autoScroll: true,
	defaults: {width: 250},
	items: [
		{
			xtype: 'hidden',
			name: 'id',
			value: FR.groupInfo.id
		},
		{
			xtype: 'textfield',
			fieldLabel: FR.T('Group name'),
			name: 'name',
			value: FR.groupInfo.name
		},{
			xtype: 'textarea',
			fieldLabel: FR.T('Description'),
			name: 'description',
			value: FR.groupInfo.description
		},
		{
			xtype: 'userslistfield', only: 'users',
			value: FR.groupInfo.users, showSelf: true,
			fieldLabel: FR.T('Users'),
			addHandler: function(data) {
				var params = {gid: FR.groupInfo.id, 'uids[]':[]};
				Ext.each(data.users, function(user) {
					params['uids[]'].push(user.uid);
				});
				FR.editGroup.formPanel.bwrap.mask(FR.T('Please wait...'));
				var usersListCmp = this;
				Ext.Ajax.request({
					url: FR.URLRoot+'/?module=user_groups&section=cpanel&page=add_users',
					method: 'POST', params: params,
					success: function(result) {
						FR.editGroup.formPanel.bwrap.unmask();
						try {
							var rs = Ext.util.JSON.decode(result.responseText);
						} catch(er) {
							FR.feedback(FR.T('Error: Unexpected server response!'));
							return false;
						}
						if (rs) {
							if (rs.success) {
								Ext.each(data.users, function(user) {
									if (rs.uidsAdded.indexOf(user.uid) != -1) {
										usersListCmp.addItemToList({id: user.uid, name: user.name, type: 'user'});
									}
								});
							}
							if (rs.msg) {FR.feedback(rs.msg);}
						}
					}
				});
			},
			removeHandler: function(usersListCmp, selected) {
				var data = selected.attributes;
				new Ext.ux.prompt({
					text: FR.T('Are you sure you wish to remove %1 from the %2 group?').replace('%1', '<strong>'+data.text+'</strong>').replace('%2', '<strong>'+FR.groupInfo.name+'</strong>')+
						'<br>'+
						FR.T('The user will no longer have access to files that might be shared with this group.'),
					confirmHandler: function() {
						FR.editGroup.formPanel.bwrap.mask(FR.T('Please wait...'));
						Ext.Ajax.request({
							url: FR.URLRoot+'/?module=user_groups&section=cpanel&page=remove_user',
							method: 'POST', params: {
								uid: data.extra.id,
								gid: FR.groupInfo.id
							},
							success: function(result) {
								FR.editGroup.formPanel.bwrap.unmask();
								try {
									var rs = Ext.util.JSON.decode(result.responseText);
								} catch(er) {
									FR.feedback(FR.T('Error: Unexpected server response!'));
									return false;
								}
								if (rs) {
									if (rs.success) {
										usersListCmp.tree.root.removeChild(selected);
									}
									if (rs.msg) {FR.feedback(rs.msg);}
								}
							}
						});
					}
				});
			},
			tcfg: {height: 200, width: 250}
		}
	],
	tbar: [
		{
			text: FR.T('Save changes'),
			cls: 'fr-btn-primary',
			ref: 'saveBtn',
			handler: function() {
				var editForm = this.ownerCt.ownerCt;
				var opts = {
					url: FR.URLRoot+'/?module=user_groups&section=cpanel&page=edit&action=save',
					maskText: 'Saving changes...'
				};
				editForm.submitForm(opts);
			}
		},
		'->',
		{
			text: FR.T('Delete group'),
			iconCls: 'fa fa-fw fa-remove colorRed',
			handler: function(){FR.editGroup.deleteHandler();}
		}
	]
});
FR.editGroup.deleteHandler = function() {
	new Ext.ux.prompt({
		text: FR.T('Please confirm group deletion.'),
		confirmHandler: function() {
			var opts = {
				url: FR.URLRoot+'/?module=user_groups&section=cpanel&page=delete&id='+FR.groupInfo.id,
				maskText: 'Please wait...'
			};
			FR.editGroup.formPanel.deleteAction(opts);
		}
	});
};
Ext.getCmp('gridTabPanel').add(FR.editGroup.formPanel);
FR.editGroup.formPanel.show();