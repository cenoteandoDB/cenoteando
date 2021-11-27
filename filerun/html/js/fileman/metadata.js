Ext.onReady(function() {

	FR.baseURL = URLRoot+'/?module=metadata&_popup_id='+encodeURIComponent(FR.popupId)+'&path='+encodeURIComponent(FR.path);
	var fileTypeCombo = new Ext.form.ComboBox({
		fieldLabel: FR.T('File Type'),
		autoCreate:true, mode: 'local', width: 180,
		emptyText:FR.T('Select...'), value: 0,
		displayField:'filetype', valueField:'id', name: 'file_type_id', hiddenName:'file_type_id',
		editable: false, triggerAction:'all', disableKeyFilter: true, forceSelection:true,
		valueNotFoundText: FR.T('- File Type Not Found -'),
		store: new Ext.data.SimpleStore({
			fields: ['id', 'filetype'],
			data: FR.filetypes
		})
	});
	fileTypeCombo.on('select', function(){
		document.location.href = FR.baseURL+'&fileTypeId='+fileTypeCombo.getValue();
    });

    FR.form = new Ext.form.FormPanel({
	 	autoScroll: true, bodyStyle: 'padding:10px',
        labelAlign: 'right', labelWidth: 110,
		items: [
			{
	            xtype: 'fieldset',
				autoHeight: true,
	            items: [fileTypeCombo]
			}
		],
	    buttonAlign: 'left',
	    footerStyle: 'padding-top:15px;',
	    buttons: !FR.editable ? false : [
			{text: FR.T("Save"), cls: 'fr-btn-primary',
	        handler: function() {
				FR.viewPort.el.mask(FR.T('Saving data...'));
				Ext.Ajax.request({
					url: FR.baseURL+'&section=ajax&page=set',
					method: 'post',
					params: FR.form.getForm().getValues(),
					success: function(req){
						FR.viewPort.el.unmask();
						try {
							var rs = Ext.util.JSON.decode(req.responseText);
						} catch (er){return false;}
						if (rs.msg) {
							window.parent.FR.UI.feedback(rs.msg);
						}
						if (rs.success) {
							with (window.parent) {
								var iv = FR.UI.ImageViewer;
								var p;
								if (iv && iv.isVisible() && iv.infoPanel.isVisible()) {
									p = iv.infoPanel;
								} else if (FR.UI.infoPanel.isVisible()) {
									p = FR.UI.infoPanel;
								}
								if (p) {
									p.tabs.detailsPanel.loadMoreDetails();
								}
							}
							window.parent.FR.UI.popups[FR.popupId].close();
						}
					}
				});
	        }
		}]
    });

	Ext.each(FR.data, function(item){
		item.defaults = {width: '100%'};
		FR.form.add(item);
	});

	if (FR.selectedFileType) {
		fileTypeCombo.setValue(FR.selectedFileType);
	}
	FR.viewPort = new Ext.Viewport({
		layout: 'fit', items: FR.form
	});
});