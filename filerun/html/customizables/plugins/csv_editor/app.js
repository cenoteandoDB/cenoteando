FR = {
	UI: {}, changesSaved: true,
	editor: false,
	init: function() {
		this.viewport = new Ext.Viewport({
			layout: 'fit',
			items: {
				layout: 'fit',
				html: '<div id="editor" style="position: absolute;top: 0;right: 0;bottom: 0;left: 0;"></div>',
				tbar: [
					{
						text: FR.T("Save"), cls: 'fr-btn-primary', style: !FR.settings.isClosable ? 'margin-left:5px': false, hidden: !FR.settings.isEditable,
						handler: function(){this.save(false);}, scope: this
					},
					{
						text: FR.T("Save and close"), cls: 'fr-btn-primary', style: 'margin-left:5px',  hidden: (!FR.settings.isEditable || !FR.settings.isClosable),
						handler: function(){this.save(true);}, scope: this
					},
					{
						text: FR.T("Close"), style: 'margin-left:5px', hidden: !FR.settings.isClosable,
						handler: function(){FR.closeWindow();}
					},
					{xtype: 'tbseparator', hidden: !FR.settings.isEditable},
					{
						text: FR.T("Insert new row"),
						cls: 'fr-btn-default',
						style: 'margin-left:5px', hidden: !FR.settings.isEditable,
						handler: function(){FR.editor.insertRow();}
					},
					{
						text: FR.T("Insert new column"),
						cls: 'fr-btn-default',
						style: 'margin-left:5px', hidden: !FR.settings.isEditable,
						handler: function(){FR.editor.insertColumn();}
					},
					{
						xtype: 'tbtext', id: 'status', text: '', style: 'margin-left:10px;'
					}
				]
			},
			listeners: {
				'afterrender': function() {
					FR.editor = jspreadsheet(document.getElementById('editor'), {
						csv: FR.settings.fileURL,
						csvHeaders:true,
						lazyLoading:true,
						loadingSpin:true,
						fullscreen: true,
						allowExport: false,
						defaultColWidth: 150,
						includeHeadersOnDownload: true,
						onchange: FR.onChange
					});
				}
			}
		});
		window.onbeforeunload = function() {
			if (!FR.changesSaved) return FR.T('Discard the changes made?');
		};

	},
	onChange: function() {
		FR.changesSaved = false;
		Ext.getCmp('status').setText('<span class="colorRed">' + FR.T('Unsaved changes') + '</span>');
	},
	closeWindow: function() {
		if (!FR.changesSaved) {
			new Ext.ux.prompt({text: FR.T('Discard the changes made?'),
				confirmHandler: function() {
					window.parent.FR.UI.popups[FR.settings.windowId].close();
				}});
			return false;
		}
		window.parent.FR.UI.popups[FR.settings.windowId].close();
	},
	save: function(close) {
		this.closeAfterSave = close;
		this.viewport.getEl().mask(FR.T('Saving...'));
		Ext.Ajax.request({
			url: FR.settings.actionURL+'&method=saveChanges',
			params: {
				path: FR.settings.path,
				filename: FR.settings.filename,
				csvHeaders: JSON.stringify(FR.editor.getHeaders(true)),
				textContents: JSON.stringify(FR.editor.getJson())
			},
			success: function(req) {
				this.viewport.getEl().unmask();
				try {
					var rs = Ext.util.JSON.decode(req.responseText);
				} catch (er){return false;}

				if (rs.success) {
					FR.changesSaved = true;
					Ext.getCmp('status').setText('');
				} else {
					FR.changesSaved = false;
				}
				if (rs.msg) {
					if (FR.settings.windowId) {
						window.parent.FR.UI.feedback(rs.msg);
					} else {
						Ext.getCmp('status').setText(rs.msg);
					}
				}
				if (rs.success && this.closeAfterSave) {
					this.closeWindow();
				}
			},
			scope: this
		});
	}
};