Ext.ns('FR');
var FR = {
	UI: {}, components:{}, selection: {}, trans: [],
	utils: {
		getAjaxOutput: function (url, params, loadingEl) {
			if (loadingEl.getAjaxOutputIsLoading) {return false;}
			loadingEl.getAjaxOutputIsLoading = true;
			loadingEl.setValue('<i class="fa fa-refresh fa-spin"></i>');
			if (FR.system.csrf_token) {params.csrf = FR.system.csrf_token;}
			Ext.Ajax.request({
				url: url,
				params: params,
				callback: function() {},
				success: function(req) {
					loadingEl.getAjaxOutputIsLoading = false;
					loadingEl.setValue(req.responseText);
				},
				failure: function(f) {FR.feedback(f.responseText);},
				scope: this
			});
		}
	}
};
Ext.onReady(function() {
	FR.modules = {
		users: {
			type: 'grid',
			title: FR.T('Users'),
			dblClickEdit: true,
			url: {
				list: '/?module=users&section=cpanel&page=list',
				edit: '/?module=users&section=cpanel&page=edit',
				add:  '/?module=users&section=cpanel&page=add'
			},
			loginAs: true, deActivate: true, viewLog: true,
			deActivateAction: function(sel) {
				var params = {'uid[]':[]};
				Ext.each(sel, function(item) {
					params['uid[]'].push(item.data.id);
				});
				params.csrf = FR.system.csrf_token;
				new Ext.ux.prompt({text: FR.T('Please confirm the user deactivation'), confirmHandler: function() {
					Ext.getCmp('gridTabPanel').el.mask('Deactivating users...');
					Ext.Ajax.request({
						url: FR.URLRoot+'/?module=users&section=cpanel&page=deactivate',
						method: 'POST', params: params,
						callback: function() {Ext.getCmp('gridTabPanel').el.unmask();},
						success: function(req) {
							try {
								var rs = Ext.util.JSON.decode(req.responseText);
							} catch (er){return false;}
							if (rs) {
								FR.feedback(rs.msg);
								if (rs.success) {
									FR.grid.panel.store.reload();
								}
							} else {FR.feedback(req.responseText);}
						},
						failure: function(f) {FR.feedback(f.responseText);}
					});
				}});
			},
			deleteAction: function(sel) {
				FR.deleteUsersDlg = new Ext.Window({
					title: FR.T('Delete users?'),
					resizable: false, constrain:true, constrainHeader: true,
					modal: true, buttonAlign: 'left', width:450,
					footer: true, layout: 'fit', bodyStyle: 'padding:0 0 15px 24px',
					items: [{ref: 'delHF', xtype: 'checkbox', boxLabel: FR.T('Permanently delete the users home folders.')}],
					buttons: [
						{text: FR.T('Delete'), cls: 'fr-btn-primary', handler: function() {
							var params = {'uid[]':[]};
							Ext.each(sel, function(item) {
								params['uid[]'].push(item.data.id);
							});
							if (FR.deleteUsersDlg.delHF.getValue()) {
								params.deleteHomeFolder = 1;
							}
							params.csrf = FR.system.csrf_token;
							FR.deleteUsersDlg.close();
							Ext.getCmp('gridTabPanel').el.mask('Deleting users...');
							Ext.Ajax.request({
								url: FR.URLRoot+'/?module=users&section=cpanel&page=delete',
								params: params,
								callback: function() {Ext.getCmp('gridTabPanel').el.unmask();},
								success: function(req) {
									try {
										var rs = Ext.util.JSON.decode(req.responseText);
									} catch (er){return false;}
									if (rs) {
										FR.feedback(rs.msg);
										if (rs.success) {
											FR.grid.panel.store.reload();
										}
									} else {FR.feedback(req.responseText);}
								},
								failure: function(f) {FR.feedback(f.responseText);}
							});

						}, scope: this},
						{text: FR.T('Cancel'), style: 'margin-left:10px', handler: function(){FR.deleteUsersDlg.close();}, scope: this}
					]
				}).show();
			}
		},
		roles: {
			type: 'grid',
			title: FR.T('Roles'),
			dblClickEdit: true, listUsersByRole: true,
			url: {
				list: '/?module=user_roles&section=cpanel&page=list',
				edit: '/?module=user_roles&section=cpanel&page=edit',
				add:  '/?module=user_roles&section=cpanel&page=add'
			}
		},
		groups: {
			type: 'grid',
			title: FR.T('Groups'),
			dblClickEdit: true,
			url: {
				list: '/?module=user_groups&section=cpanel&page=list',
				edit: '/?module=user_groups&section=cpanel&page=edit',
				add:  '/?module=user_groups&section=cpanel&page=add'
			}
		},
		openWith: {
			type: 'grid',
			title: FR.T('Plugins'),
			dblClickEdit: true,
			url: {
				list: '/?module=custom_actions&section=cpanel&page=list',
				edit: '/?module=custom_actions&section=cpanel&page=edit'
			}
		},
		defaultOpenWith: {
			type: 'grid',
			title: FR.T('Default "Open with.." options'),
			dblClickEdit: true,
			url: {
				list: '/?module=custom_actions&section=cpanel&page=defaults_list',
				edit: '/?module=custom_actions&section=cpanel&page=defaults_edit',
				add:  '/?module=custom_actions&section=cpanel&page=defaults_add'
			}
		},
		notifications: {
			type: 'grid',
			title: FR.T('E-mail notifications'),
			dblClickEdit: true,
			url: {
				list: '/?module=notifications&section=cpanel&page=list',
				edit: '/?module=notifications&section=cpanel&page=edit',
				add:  '/?module=notifications&section=cpanel&page=add'
			}
		},
        notif_logs: {
            type: 'grid',
            title: FR.T('E-mail notifications logs'),
            dblClickEdit: true,
            url: {
                list: '/?module=notifications&section=cpanel&page=logslist',
                view: '/?module=notifications&section=cpanel&page=logview'
            }
        },
		logs: {
			type: 'grid',
			title: FR.T('Activity logs'),
			url: {
				list: '/?module=logs&section=cpanel&page=list',
				search: '/?module=logs&section=cpanel&page=search'
			},
			archiveLogsAction: function() {
				new Ext.ux.prompt({text: FR.T('Please confirm the archiving and deletion of the activity logs.'), confirmHandler: function() {
					Ext.Ajax.request({
						url: FR.URLRoot+
						'/?module=logs&section=cpanel&page=archive&action=archive',
						method: 'GET',
						success: function(result) {
							try {
								var rs = Ext.util.JSON.decode(result.responseText);
							} catch(er) {return false;}
							if (rs) {
								if (rs.success) {
									FR.feedback(rs.msg);
									FR.grid.panel.store.reload();
								} else {
									FR.feedback(rs.msg);
								}
							}
						}
					});
				}});
			}
		},
		metadata_filetypes: {
			type: 'grid',
			title: FR.T('File types'),
			dblClickEdit: true,
			url: {
				list: '/?module=metadata&section=cpanel&page=list_filetypes',
				edit: '/?module=metadata&section=cpanel&page=edit_filetype',
				add:  '/?module=metadata&section=cpanel&page=add_filetype'
			}
		},
		metadata_fieldsets: {
			type: 'grid',
			title: FR.T('Field sets'),
			dblClickEdit: true,
			url: {
				list: '/?module=metadata&section=cpanel&page=list_fieldsets',
				edit: '/?module=metadata&section=cpanel&page=edit_fieldset',
				add:  '/?module=metadata&section=cpanel&page=add_fieldset'
			}
		},
		metadata_fields: {
			url: {
				edit: '/?module=metadata&section=cpanel&page=edit_field',
				add:  '/?module=metadata&section=cpanel&page=add_field',
				del:  '/?module=metadata&section=cpanel&page=delete_field'
			}
		},
		weblinks: {
			type: 'grid',
			title: FR.T('Web Links'),
			dblClickEdit: true, openWebLink: true,
			url: {
				list: '/?module=weblinks&section=cpanel&page=list'
			},
			deleteAction: function(sel) {
				var params = {'id[]':[]};
				Ext.each(sel, function(item) {
					params['id[]'].push(item.data.id);
				});
				params.csrf = FR.system.csrf_token;
				new Ext.ux.prompt({text: FR.T('Please confirm web link deletion'), confirmHandler: function() {
					Ext.getCmp('gridTabPanel').el.mask('Deleting web links...');
					Ext.Ajax.request({
						url: FR.URLRoot+'/?module=weblinks&section=cpanel&page=delete',
						method: 'POST', params: params,
						success: function(result) {
							Ext.getCmp('gridTabPanel').el.unmask();
							try {
								var rs = Ext.util.JSON.decode(result.responseText);
							} catch(er) {return false;}
							if (rs) {
								if (rs.success) {
									FR.feedback(rs.msg);
									FR.grid.panel.store.reload();
								} else {
									FR.feedback(rs.msg);
								}
							}
						}
					});
				}});
			}
		},
		oauth2_clients: {
			type: 'grid',
			title: FR.T('OAuth2 clients'),
			dblClickEdit: true,
			url: {
				list: '/?module=oauth&section=cpanel&page=client_list',
				edit: '/?module=oauth&section=cpanel&page=client_edit',
				add:  '/?module=oauth&section=cpanel&page=client_add'
			}
		}
	};

	Ext.QuickTips.init();
	FR.initGrid();
	FR.initTree();
	FR.initLayout();
	Ext.fly('loadMsg').fadeOut();

	if (FR.user.isSuperuser && !FR.user.hasHomeFolder) {
		new Ext.ux.prompt({
			title: FR.T('Welcome to FileRun!'),
			text: FR.T('To start, configure the Superuser account with a home folder.'),
			callback: function () {
				Ext.getCmp('gridTabPanel').el.mask('Loading...');
				FR.tempPanel.load({
					url: FR.URLRoot + FR.modules.users.url.edit,
					params: {id: 1}, scripts: true,
					callback: function () {
						Ext.getCmp('gridTabPanel').el.unmask();
						new Ext.ux.prompt({
							text: FR.T('You will find the option under the Permissions tab.')
						});
					}
				});
			}
		});
	}
	if (FR.user.isSuperuser) {
		Ext.Loader.load(FR.checkUpdatesURL);
	}
});