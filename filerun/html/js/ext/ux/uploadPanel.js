FR.components.uploadWindow = Ext.extend(Ext.Window, {
	bodyStyle: 'padding:0px 20px 0 20px', closable: false,
	buttonAlign: 'left',
	initComponent: function() {
		this.tools = [
			{
				id: 'minimize',
				handler: function() {
					if (!this.minimized) {
						this.minimize();
					} else {
						this.maximize();
					}
				}, scope: this,
				qtip: FR.T('Minimize')
			}
		];
		this.initialPanelTitle = this.title;
		this.initialDocumentTitle = document.title;
		this.filesToBeLoaded = [];
		this.lastServerError = false;
		this.initFlow();
		this.btns = {
			pauseFile: new Ext.Button({
				text: FR.T('Pause selected'),
				handler: this.pauseFileToggle, scope: this,
				iconCls: 'fa fa-fw fa-step-forward',
				disabled: true
			}),
			removeFile: new Ext.Button({
				text: FR.T('Remove selected'),
				handler: this.removeFile,
				scope: this,
				iconCls: 'fa fa-fw fa-remove',
				disabled: true
			}),
			locateFile: new Ext.Button({
				text: FR.T('Locate'),
				handler: this.locateFile,
				scope: this,
				iconCls: 'fa fa-fw fa-crosshairs',
				disabled: true
			}),
			pauseToggle: new Ext.Button({
				text: FR.T('Pause all'),
				handler: this.pauseToggle, scope: this,
				iconCls: 'fa fa-fw fa-pause'
			}),
			cancel: new Ext.Action({
				text: FR.T('Cancel all'),
				handler: this.cancel, scope: this, style: 'margin-left:10px',
				iconCls: 'fa fa-fw fa-remove icon-red'
			}),
			close: new Ext.Action({
				text: FR.T('Close'),
				handler: this.cancel, scope: this,
				iconCls: 'fa fa-fw fa-close', hidden: true
			})
		};
		this.statusText = new Ext.Toolbar.TextItem({style: 'color:gray'});
		this.pbar = new Ext.ProgressBar({animate: true, width:250});
		this.buttons = [
			this.btns.pauseFile, this.btns.removeFile, this.btns.locateFile, '->', this.btns.pauseToggle, this.btns.cancel, this.btns.close
		];
		this.grid = {};
		this.grid.store = new Ext.data.ArrayStore({
			autoDestroy: true, idIndex: 0,
			fields: [
				'id', 'name', 'size', 'progress',  'remaining',
				'status', 'lastServerReply', 'file'
				//'speed', 'completedBytes'
			]
		});
		this.grid.panel = new Ext.grid.GridPanel({
			tbar: [
				this.pbar, '->', this.statusText
			],
			layout: 'fit',
			store: this.grid.store, autoScroll: true,
			viewConfig: {
				headersDisabled: true, forceFit: true, scrollOffset: 20
			},
			autoExpandColumn: 'filename',
			sm: new Ext.grid.RowSelectionModel({
				singleSelect: true,
				listeners: {
					'selectionchange': function() {
						var sel = this.grid.panel.selModel.getSelected();
						if (!sel) {
							this.btns.pauseFile.disable();
							this.btns.removeFile.disable();
							this.btns.locateFile.disable();
							return true;
						}
						this.btns.removeFile.enable();
						if (sel.data.file.paused) {
							this.btns.pauseFile.setText(FR.T('Resume selected'))
								.setIconClass('fa fa-fw fa-play');
						} else {
							this.btns.pauseFile.setText(FR.T('Pause selected'))
								.setIconClass('fa fa-fw fa-pause')
								.enable();
						}
						if (sel.data.file.complete) {
							this.btns.pauseFile.disable();
							this.btns.locateFile.enable();
						} else {
							this.btns.pauseFile.enable();
							this.btns.locateFile.disable();
						}
					}, scope: this
				}
			}),
			colModel: new Ext.grid.ColumnModel({
				defaults: {sortable: false},
				columns: [
					{header: '&nbsp;', renderer: function(v) {
						var ext = FR.utils.getFileExtension(v);
						return '<img class="itemIcon" src="images/fico/ext2ico.php?theme='+Settings.ui_theme+'&ext='+ext+'" width="16" height="16" border="0" valign="middle" /> ';
					}, width: 36, align: 'center', dataIndex: 'name'},
					{header: FR.T('File name'), width: 220, dataIndex: 'name', id: 'filename'},
					{header: FR.T('Size'), width: 55, renderer: function(s){return Ext.util.Format.fileSize(s);}, dataIndex: 'size'},
					//{header: FR.T('Uploaded'), width: 80, dataIndex: 'completedBytes'},
					new Ext.ux.ProgressColumn({
						header: FR.T('Progress'), dataIndex: 'progress',
						width: 180, align: 'center',
						renderer: function(v, meta, record) {
							if (record.data.status == 'uploading') {
								if (v == 1) {
									return FR.T('Waiting (100%)');
								}
								return false;
							} else if (record.data.status == 'paused') {
								if (v == 0) {
									return '<span style="font-style:oblique">'+FR.T('Paused')+'</span>';
								} else if (v == 1) {
									return false;
								} else {
									return '<span style="font-style:oblique">'+FR.T('Paused (%1%)').replace('%1', Math.floor(v*100))+'</span>';
								}
							}
							return FR.T(record.data.status);
						}
					}),
					//{header: FR.T('Speed'), width: 80, dataIndex: 'speed'},
					{header: FR.T('Time remaining'), width: 140, dataIndex: 'remaining'}
				]
			})
		});
		Ext.apply(this, {
			layout: 'fit',
			items: this.grid.panel
		});
		FR.components.uploadWindow.superclass.initComponent.apply(this, arguments);
	},
	minimize: function() {
		if (this.minimized) {return false;}
		this.statusText.hide();
		this.setSize(290, 150);
		this.anchorTo(Ext.get('theBODY'), 'br-br', [-10,-10]);
		this.tools.minimize.replaceClass('x-tool-minimize', 'x-tool-maximize');
		this.minimized = true;
		this.btns.pauseFile.hide();
		this.btns.removeFile.hide();
		this.btns.locateFile.hide();
		//tool.setTooltip(FR.T('Maximize'));
	},
	maximize: function() {
		if (!this.minimized) {return false;}
		this.statusText.show();
		this.setSize(this.initialConfig.width, this.initialConfig.height);
		this.anchorTo(Ext.get('theBODY'), 'c-c');
		this.tools.minimize.replaceClass('x-tool-maximize', 'x-tool-minimize');
		this.minimized = false;
		this.btns.pauseFile.show();
		this.btns.removeFile.show();
		this.btns.locateFile.show();
		//tool.setTooltip(FR.T('Minimize'));
	},
	initFlow: function() {
		this.flow = new Flow({
			target: '?module=fileman&section=do&page=up',
			chunkSize: Settings.upload_chunk_size, progressCallbacksInterval: 100,
			maxChunkRetries: 3, resumeLargerThan: 10485760, maxSimultaneous: Settings.upload_max_simultaneous,
			validateChunkResponse: function(status, message) {
				if (status != '200') {return 'retry';}
				try {var rs = Ext.util.JSON.decode(message);} catch (er){return 'retry';}
				if (rs) {if (rs.success) {return 'success';} else {return 'error';}}
			}, validateChunkResponseScope: this
		});

		this.flow.on('fileAdded', this.onFileAdded.createDelegate(this));
		this.flow.on('filesSubmitted', this.onFilesSubmitted.createDelegate(this));
		this.flow.on('fileProgress', this.onFileProgress.createDelegate(this));
		this.flow.on('fileError', this.onFileError.createDelegate(this));
		this.flow.on('fileSuccess', this.onFileSuccess.createDelegate(this));
		this.flow.on('progress', this.onProgress.createDelegate(this));
		this.flow.on('complete', this.onComplete.createDelegate(this));
	},
	start: function() {
		this.btns.pauseToggle.setIconClass('fa fa-fw fa-pause')
			.setText(FR.T('Pause all'))
			.show();
		this.btns.cancel.show();
		this.btns.close.hide();
		this.flow.start();
	},
	cancel: function() {
		/*
		if (this.targetPath == FR.currentPath) {
			FR.UI.gridPanel.load(FR.currentPath);
		 */
		this.flow.removeAll();
		this.grid.store.removeAll();
		this.onProgress(this.flow);
		this.closeWindow();
	},
	closeWindow: function() {
		document.title = this.initialDocumentTitle;
		if (this.errPrompt) {
			this.errPrompt.close();
		}
		this.hide();
	},
	pauseToggle: function(btn) {
		if (this.flow.paused) {
			btn.setIconClass('fa fa-fw fa-pause');
			btn.setText(FR.T('Pause all'));
			this.flow.start();
			this.setTitle(this.initialPanelTitle);
		} else {
			btn.setIconClass('fa fa-fw fa-play');
			btn.setText(FR.T('Resume'));
			this.setTitle('Upload paused');
			this.flow.pause();
		}
	},
	pauseFileToggle: function() {
		var r = this.grid.panel.getSelectionModel().getSelected();
		if (r) {
			if (r.data.file.paused) {
				r.data.file.start();
				this.btns.pauseFile.setText(FR.T('Pause selected'))
									.setIconClass('fa fa-fw fa-pause');
			} else {
				r.data.file.pause();
				this.btns.pauseFile.setText(FR.T('Resume selected'))
									.setIconClass('fa fa-fw fa-play');
			}
		}
	},
	removeFile: function() {
		var record = this.grid.panel.getSelectionModel().getSelected();
		this.flow.removeFile(record.data.file);
		this.grid.store.remove(record);
		this.onProgress(this.flow);
		if (this.flow.files.length == 0) {
			this.closeWindow();
		}
	},
	locateFile: function() {
		var record = this.grid.panel.getSelectionModel().getSelected();
		this.minimize();
		var pathInfo = FR.utils.pathInfo(FR.utils.gluePath(record.data.path, record.data.name));
		FR.utils.locateItem(pathInfo.dirname, pathInfo.basename);
	},
	onFileAdded: function(file, event) {
		var name = file.name;
		if (Settings.upload_blocked_types.length > 0 && Settings.upload_blocked_types.indexOf(FR.utils.getFileExtension(file.name)) != -1) {
			FR.UI.feedback(FR.T('You are not allowed to upload the file "%1"').replace('%1', file.name));
			return false;
		}
		if (file.relativePath) {
			name = file.relativePath+name;
		}
		this.filesToBeLoaded.push(new Ext.data.Record(
			{
				id: file.uniqueIdentifier,
				name: name,
				path: file.query.path,
				size: file.size,
				progress: 0,
				status: FR.T('Queued'),
				file: file
			},
			file.uniqueIdentifier
		));
	},
	onFilesSubmitted: function() {
		if (!this.flow.files.length) {return false;}
		this.grid.store.suspendEvents();
		Ext.each(this.filesToBeLoaded, function(r) {
			this.grid.store.add(r);
		}, this);
		this.grid.store.resumeEvents();
		this.grid.store.fireEvent('datachanged', this.grid.store);
		this.filesToBeLoaded = [];

		this.show();
		this.maximize();
		this.start();
		this.onProgress(this.flow);
	},
	onComplete: function() {
		document.title = this.initialDocumentTitle;
		this.btns.pauseToggle.hide();
		this.btns.cancel.hide();
		this.btns.close.show();
		if (this.flow.completedFiles > 0) {
			this.setTitle(FR.T('Upload completed'));
			if (this.flow.lastCompletedFile) {
				var r = this.grid.store.getById(this.flow.lastCompletedFile.uniqueIdentifier);
				if (r) {
					var pathInfo = FR.utils.pathInfo(FR.utils.gluePath(r.data.path, r.data.name));
					if (pathInfo.dirname == FR.currentPath) {
						FR.utils.locateItem(pathInfo.dirname, pathInfo.basename);
						if (FR.UI.tree.currentSelectedNode.loading == false && FR.UI.tree.currentSelectedNode.loaded == true) {
							FR.UI.tree.reloadNode(FR.UI.tree.currentSelectedNode);
						}
						if (this.flow.files.length == 1) {
							this.cancel();
						}
					}
				}
			}
			FR.UI.reloadStatusBar();
		}
		if (this.errPrompt) {
			this.errPrompt.close();
		}
	},
	onProgress: function(flow) {
		var countFiles = flow.files.length;
		var completed = Ext.util.Format.fileSize(flow.completedBytes);
		var total = Ext.util.Format.fileSize(flow.size);
		var status = '';
		var title;
		var percent = 0;
		var nicePerc = '';
		if (countFiles > 0) {
			var remainingFiles = countFiles - flow.completedFiles;
			if (countFiles > 1 && remainingFiles > 0) {
				status += FR.T('%1 files left').replace('%1', remainingFiles) + ', ';
			}
			if (completed != total) {
				status += FR.T('%1 of %2').replace('%1', completed).replace('%2', total);
			}
			percent = flow.getProgress();
			nicePerc = Math.floor(percent*100)+'%';
			title = FR.T('Uploading.. %1').replace('%1', nicePerc);
		} else {
			title = FR.T('Add files to upload');
		}
		this.setTitle(title);
		this.statusText.update(status);
		this.pbar.updateProgress(percent, nicePerc);
		document.title = '['+nicePerc+'] ' + this.initialDocumentTitle;
	},
	onFileProgress: function(file) {
		var r = this.grid.store.getById(file.uniqueIdentifier);
		if (!r) {return false;}
		if (file.paused) {
			if (file.queuePaused) {
				r.data['status'] = '<span style="font-style:oblique">'+FR.T('[Skipped]')+'</span>';
			} else {
				r.data['status'] = 'paused';
			}
			r.data['speed'] = '';
		} else {
			if (file.uploadingChunk && file.uploadingChunk.retries > 0) {
				r.data['status'] = FR.T('Uploading (Retry #%1)...').replace('%1', file.uploadingChunk.retries);
			} else {
				r.data['status'] = 'uploading';
			}
			r.data['remaining'] = this.formatTime(file.timeRemaining());
		}
		r.data['progress'] = file.progress;
		/*
		if (file.completedBytes > 0) {
			if (file.averageSpeed >= 1) {
				r.data['speed'] = Ext.util.Format.fileSize(file.averageSpeed)+'/s';
			} else {
				r.data['speed'] = '';
			}
			//r.data['completedBytes'] = Ext.util.Format.fileSize(file.completedBytes);
		} else {
			r.data['speed'] = '';
			r.data['completedBytes'] = '';
		}
		 */
		r.commit();
	},
	onFileSuccess: function(file, message) {
		var r = this.grid.store.getById(file.uniqueIdentifier);
		try {
			var rs = Ext.util.JSON.decode(message);
		} catch (er){
			r.data['status'] = '<span style="color:red">'+FR.T('Server error')+'</span>';
			this.lastServerError = message;
		}
		if (rs) {
			if (!rs.success) {
				this.lastServerError = message;
				if (rs.msg) {
					r.data['status'] = rs.msg;
					this.lastServerError = rs.msg;
				} else {
					r.data['status'] = '<span style="color:red">'+FR.T('Server error')+'</span>';
				}
			} else {
				r.data['status'] = '<span style="color:green">'+rs.msg+'</span>';
			}
		} else {
			r.data['status'] = '<span style="color:red">'+FR.T('Server error')+'</span>';
			this.lastServerError = message;
		}
		r.commit();
		var index = this.grid.store.indexOfId(file.uniqueIdentifier);
		this.grid.panel.getView().focusRow(index);
		var selModel = this.grid.panel.selModel;
		if (r == selModel.getSelected()) {
			selModel.fireEvent('selectionchange')
		}
	},
	onFileError: function(file, message) {
		this.setTitle(FR.T('Failed'));
		var r = this.grid.store.getById(file.uniqueIdentifier);
		try {
			var rs = Ext.util.JSON.decode(message);
		} catch (er){
			r.data['status'] = '<span style="color:red">'+FR.T('Server error')+'</span>';
			this.lastServerError = message;
		}
		if (rs) {
			if (!rs.success) {
				this.lastServerError = message;
			}
			r.data['status'] = '<span style="color:red">'+FR.T('Failed')+'</span>';
			if (rs.msg) {
				r.data['status'] += ': '+rs.msg;
				this.lastServerError = rs.msg;
			}
		} else {
			r.data['status'] = '<span style="color:red">'+FR.T('Server error')+'</span>';
			this.lastServerError = message;
		}
		r.commit();
		this.maximize();
		this.btns.pauseToggle.setIconClass('fa fa-fw fa-play');
		this.btns.pauseToggle.setText(FR.T('Resume'));
		this.errorPrompt(r);
	},
	errorPrompt: function(r) {
		if (!this.errPrompt) {
			this.errPrompt = {
				tabPanel: new Ext.TabPanel({
					activeTab: 0, items: [],
					listeners: {
						'tabchange': function(tp, p) {
							if (p) {p.doLayout();}
						},
						'remove': function(tp, p) {
							if (tp.items.getCount() == 0) {
								this.errPrompt.win.hide();
							}
						}, scope: this
					}
				}),
				close: function() {this.win.close();}
			};
			this.errPrompt.win = new Ext.Window({
				title: FR.T('A problem has been encountered!'),
				width: 450, height: 240, resizable: false, layout: 'fit',
				items: this.errPrompt.tabPanel, closeAction: 'hide',
				buttons: [
					{
						text: FR.T('Try again'),
						iconCls: 'fa fa-fw fa-repeat', cls: 'fr-btn-default',
						handler: function() {
							this.errPrompt.tabPanel.remove(r.id, true);
							r.data.file.start();
							this.start();
						}, scope: this
					},
					{
						text: FR.T('Skip file'), cls: 'fr-btn-default', style: 'margin-left:15px',
						iconCls: 'fa fa-fw fa-step-forward', hidden: (this.grid.store.getCount() < 2),
						handler: function() {
							this.errPrompt.tabPanel.remove(r.id, true);
							r.data.file.pause(true);
							this.start();
						}, scope: this
					},
					{
						text: FR.T('Cancel all'), cls: 'fr-btn-default',
						iconCls: 'fa fa-fw fa-remove', style: 'margin-left:15px',
						handler: function() {
							this.cancel();
						}, scope: this
					}
				]
			});
		}
		this.errPrompt.win.show();
		var tab = this.errPrompt.tabPanel.getItem(r.id);
		if (!tab) {
			tab = new Ext.Panel({
				id: r.id, title: r.data.name, layout: 'fit',
				contentEl: Ext.DomHelper.append(Ext.get('theBODY'), {tag: 'IFRAME', frameborder: 0, height: '100%', width: '100%'})
			});
			this.errPrompt.tabPanel.add(tab);
		}
		tab.show();
		var messageArea = tab.contentEl;
		if (messageArea.contentDocument) {
			if (messageArea.contentDocument.document) {
				var frameDoc = messageArea.contentDocument.document;
			} else {
				var frameDoc = messageArea.contentDocument
			}
		} else {
			if (messageArea.contentWindow.document) {
				var frameDoc = messageArea.contentWindow.document
			}
		}
		frameDoc.open();
		frameDoc.write(
			'<style>' +
				'body {' +
					'background: white;' +
					'font: 13px \'Roboto\', Helvetica, sans-serif;' +
					'color: #000;' +
					'cursor: default;' +
				'}' +
			'</style>'
		);
		frameDoc.write(this.lastServerError);
		frameDoc.close();
	},
	formatTime: function(secs) {
		if (secs == Number.POSITIVE_INFINITY) {return '';}
		var hours = Math.floor(secs / (60 * 60));
		var divisor_for_minutes = secs % (60 * 60);
		var minutes = Math.floor(divisor_for_minutes / 60);
		var divisor_for_seconds = divisor_for_minutes % 60;
		var seconds = Math.ceil(divisor_for_seconds);
		var str = '';
		if (hours > 24) {
			return FR.T('too long');
		}
		if (hours > 0) {
			str += FR.T('%1 hours').replace('%1', hours);
		}
		if (minutes > 0) {
			if (str != '') {str += ', ';}
			str += FR.T('%1 minutes').replace('%1', minutes);
		}
		if (seconds > 0) {
			if (str != '') {str += ', ';}
			str += FR.T('%1 seconds').replace('%1', seconds);
		}
		return str;
	}
});