FR.softwareUpdatePanel = new Ext.Panel({
	title: FR.T('Step 1:')+' '+FR.T('Check for updates'),
	layout: 'fit',
	cls: 'FREditForm', bodyCssClass: 'updateDetails',
	border: false, autoScroll: true,
	html: FR.T('Your current software version is %1').replace('%1', FR.currentVersion),
	tbar: [
		{
			id: 'updates-restart-btn',
			text: FR.T('Start again'),
			iconCls: 'fa fa-fw fa-reply',
			hidden: true,
			handler: function() {
				this.ownerCt.ownerCt.setTitle(FR.T('Step 1:')+' '+FR.T('Check for updates'));
				this.ownerCt.ownerCt.update('');
				this.hide();
				Ext.getCmp('updates-install-btn').hide();
				Ext.getCmp('updates-check-btn').show();
			}
		},
		{
			id: 'updates-check-btn',
			text: FR.T('Check for updates'),
			cls: 'fr-btn-primary',
			iconCls: 'fa fa-fw fa-refresh color-white',
			handler: function() {
				this.ownerCt.ownerCt.el.mask(FR.T('Loading...'));
				Ext.Ajax.request({
					url: FR.URLRoot+'/?module=software_update&section=cpanel&page=check',
					success: function(originalRequest) {
						this.el.unmask();
						var response = eval('('+originalRequest.responseText+')');
						this.update(response.msg);
						if (response.rs) {
							this.setTitle(FR.T('Step 2:')+' '+FR.T('Download update'));
							Ext.getCmp('updates-download-btn').show();
							Ext.getCmp('updates-check-btn').hide();
							FR.updateDownloadURL = response.url;
							FR.updateDownloadSize = response.size;
						}
					},
					failure: function() {},
					scope: this.ownerCt.ownerCt
				});
			}
		},
		{
			id: 'updates-download-btn',
			text: FR.T('Download update'),
			cls: 'fr-btn-primary',
			iconCls: 'fa fa-fw fa-download color-white',
			hidden: true,
			handler: function() {
				this.ownerCt.ownerCt.el.mask(FR.T('Loading...'));
				Ext.Ajax.request({
					url: FR.URLRoot+'/?module=software_update&section=cpanel&page=download',
					params: {
						downloadURL: FR.updateDownloadURL,
						downloadSize: FR.updateDownloadSize
					},
					success: function(originalRequest) {
						this.el.unmask();
						var response = eval('('+originalRequest.responseText+')');
						this.update(response.msg);
						if (response.success) {
							this.setTitle(FR.T('Step 3:')+' '+FR.T('Install update'));
							Ext.getCmp('updates-install-btn').show();
							Ext.getCmp('updates-download-btn').hide();
						}
					},
					failure: function() {},
					scope: this.ownerCt.ownerCt
				});
			}
		},
		{
			id: 'updates-install-btn',
			text: FR.T('Install update'),
			cls: 'fr-btn-primary',
			iconCls: 'fa fa-fw fa-flash color-white',
			hidden: true,
			handler: function() {
				this.ownerCt.ownerCt.el.mask(FR.T('Loading...'));
				Ext.getCmp('updates-restart-btn').show();
				Ext.Ajax.request({
					url: FR.URLRoot+'/?module=software_update&section=cpanel&page=install',
					success: function(originalRequest) {
						this.el.unmask();
						this.update('<pre>'+originalRequest.responseText+'</pre>');
					},
					failure: function() {},
					scope: this.ownerCt.ownerCt
				});
			}
		},
		'->',
		{
			iconCls: 'fa fa-fw fa-upload icon-silver',
			handler: function() {
				if (!this.flow) {
					this.flow = new Flow({
						target: '?module=software_update&section=cpanel&page=upload',
						singleFile: true, startOnSubmit: true, chunkSize: FR.uploadChunkSize, resumeLargerThan: 31457280, maxChunkRetries: 3,
						validateChunkResponse: function (status, message) {
							if (status != '200') {return 'retry';}
							try {
								var rs = Ext.util.JSON.decode(message);
							} catch (er) {return 'retry';}
							if (rs) {
								if (rs.success) {return 'success';} else {return 'error';}
							}
						}
					});
					this.flow.on('filesSubmitted', function() {
						FR.softwareUpdatePanel.update(FR.T('Upload starting...'));
					});
					this.flow.on('progress', function(flow) {
						var percent = Math.floor(flow.getProgress()*100);
						FR.softwareUpdatePanel.update(FR.T('Uploading...%1%').replace('%1', percent));
					});
					this.flow.on('fileSuccess', function (file, message) {
						try {
							var rs = Ext.util.JSON.decode(message);
						} catch (er) {
							FR.feedback('Unexpected server reply: ' + message);
						}
						if (rs && rs.msg) {
							FR.softwareUpdatePanel.update(rs.msg);
							if (rs.success) {
								FR.softwareUpdatePanel.setTitle(FR.T('Step 3:')+' '+FR.T('Install update'));
								Ext.getCmp('updates-check-btn').hide();
								Ext.getCmp('updates-install-btn').show();
							}
						}
					});
					this.flow.on('fileError', function (file, message) {
						try {
							var rs = Ext.util.JSON.decode(message);
						} catch (er) {
							FR.feedback('Unexpected server reply: ' + message);
						}
						if (rs && rs.msg) {
							FR.softwareUpdatePanel.update(rs.msg);
						}
					});
				}
				this.flow.removeAll();
				this.flow.browseFiles();
			}
		}
	]
});
Ext.getCmp('appTab').add(FR.softwareUpdatePanel);
Ext.getCmp('appTab').doLayout();