Ext.getCmp('appTab').add(new FR.components.editForm({
	title: FR.T('Thumbnails and preview'),
	layout: 'form', bodyStyle: 'padding:10px;', labelWidth: 150,
	defaults: {
		xtype: 'fieldset',
		labelWidth: 250,
		width: 600,
		animCollapse: true
	}, autoScroll: true,
	items: [
		{
			title: FR.T('Thumbnail settings'),
			labelWidth: 260,
			defaults: {xtype: 'textfield'},
			items: [
				{
					xtype: 'textfield',
					fieldLabel: FR.T('Thumbnail size'), width: 50,
					name: 'settings[thumbnails_size]', value: FR.settings.thumbnails_size,
					helpText: FR.T('The default value is %.').replace('%', '170')+'<br>'+FR.T('Note that this setting starts affecting the actual resolution of the thumbnail images only when exceeding 400 pixels.')
				},
				{
					xtype: 'textfield',
					fieldLabel: FR.T('Thumbnail size for "Photos" display mode'), width: 50,
					name: 'settings[ui_photos_thumbnail_size]', value: FR.settings.ui_photos_thumbnail_size,
					helpText: FR.T('The default value is %.').replace('%', '200')
				},
				{
					fieldLabel: FR.T('Use as thumbnails photos smaller than'), width: 50,
					name: 'settings[thumbnails_filesize_limit_min]', value: FR.settings.thumbnails_filesize_limit_min,
					suffix: FR.T('Megabytes')
				},
				{
					xtype: 'checkbox', value: 1,
					fieldLabel: FR.T('Process even the small files, if their resolution is too high'),
					name: 'settings[thumbnails_small_filesize_check_res]', checked: parseInt(FR.settings.thumbnails_small_filesize_check_res),
					helpText: FR.T('Some JPG photos can have relatively small file sizes but be quite large in resolution. Using these files directly as thumbnails can slow down or even freeze a user\'s browser. Enabling this option will have FileRun generate small thumbnails even for these files.')
				}
			]
		},
		{
			title: FR.T('Preview settings'),
			labelWidth: 260,
			defaults: {width: 300},
			items: [
				{
					xtype: 'radiogroup', vertical: true, columns: 1,
					fieldLabel: FR.T('Preview resolution'), value: FR.settings.ui_preview_size,
					items: [
						{boxLabel: FR.T('Automatic')+' '+FR.T('(Default)'), name: 'settings[ui_preview_size]', inputValue: 'automatic'},
						{boxLabel: FR.T('Full')+' '+FR.T('(No processing)'), name: 'settings[ui_preview_size]', inputValue: 'full'},
						{boxLabel: FR.T('Large')+' (2480 x 1000)', name: 'settings[ui_preview_size]', inputValue: 'large'},
						{boxLabel: FR.T('Medium')+' (1860 x 750)', name: 'settings[ui_preview_size]', inputValue: 'medium'},
						{boxLabel: FR.T('Small')+' (1240 x 500)', name: 'settings[ui_preview_size]', inputValue: 'small'},
						{boxLabel: FR.T('Use the thumbnail'), name: 'settings[ui_preview_size]', inputValue: 'use_thumb'}
					]
				},
				{
					xtype: 'textfield',
					fieldLabel: FR.T('Open without processing photos smaller than'), width: 50,
					name: 'settings[ui_preview_filesize_limit_min]', value: FR.settings.ui_preview_filesize_limit_min,
					suffix: FR.T('Megabytes')
				},
				{
					xtype: 'checkbox', value: 1,
					fieldLabel: FR.T('Process even the small files, if their resolution is too high'),
					name: 'settings[ui_preview_small_filesize_check_res]', checked: parseInt(FR.settings.ui_preview_small_filesize_check_res),
					helpText: FR.T('Some JPG photos can have relatively small file sizes but be quite large in resolution. Opening these files directly can slow down or even freeze a user\'s browser. Enabling this option will have FileRun generate small previews even for these files.')
				}
			]
		},
		{

			title: FR.T('ImageMagick support'),
			defaults: {width: 300},
			items: [
				{
					xtype: 'radiogroup', vertical: true, columns: 1,
					fieldLabel: FR.T('Mode'), ref: 'thumbnails_imagemagick',
					items: [
						{boxLabel: FR.T('Off'), name: 'settings[thumbnails_imagemagick]', inputValue: '0', checked: (FR.settings.thumbnails_imagemagick)},
						{boxLabel: FR.T('IMagick PHP Extension'), name: 'settings[thumbnails_imagemagick]', inputValue: 'imagick', checked: (FR.settings.thumbnails_imagemagick == 'imagick'), helpText: FR.T('IMagick is a PHP extension which makes use of ImageMagick.')+'<br>'+FR.T('Read more about this <a href="%1" target="_blank">here</a>.').replace('%1', 'https://www.php.net/manual/en/book.imagick.php')},
						{boxLabel: FR.T('Direct exec'), name: 'settings[thumbnails_imagemagick]', inputValue: 'exec', checked: (FR.settings.thumbnails_imagemagick == 'exec'), helpText: FR.T('Download from %1').replace('%1', '<a href="https://imagemagick.org/script/download.php" target="_blank">https://imagemagick.org</a>')}
					]
				},
				{
					xtype: 'textfield', ref: 'impath',
					fieldLabel: FR.T('Path to "magick" or "convert" binary'),
					name: 'settings[thumbnails_imagemagick_path]', value: FR.settings.thumbnails_imagemagick_path
				},
				{
					xtype: 'panel', border: false, layout: 'hbox', width: 500,
					layoutConfig: {padding: 5}, bodyStyle: 'padding-left:250px',
					defaults:{margins:'0 0 0 0'},
					items: [
						{xtype: 'button', cls: 'fr-btn-default fr-btn-smaller fr-btn-nomargin', text: FR.T('Check version'), handler: function() {
							var par = {
								mode: this.ownerCt.ownerCt.thumbnails_imagemagick.items.first().getGroupValue(),
								path: this.ownerCt.ownerCt.impath.getValue()
							};
							var output = this.ownerCt.ownerCt.serverReply;
							output.show();
							FR.utils.getAjaxOutput(FR.URLRoot+'/?module=cpanel&section=settings&page=image_preview&action=checkImageMagick', par, output);
						}}
					]
				},
				{xtype: 'displayfield', ref: 'serverReply', value: 'test', style:'border:1px solid silver;padding:3px;overflow:auto', hidden: true},
				{
					xtype: 'textarea', height: 90,
					fieldLabel: FR.T('Use with the following file types'), spellcheck: false,
					name: 'settings[thumbnails_imagemagick_ext]', value: FR.settings.thumbnails_imagemagick_ext
				}
			]
		},
		{
			checkboxToggle: {tag: 'input', type: 'checkbox', id: 'settings[thumbnails_ffmpeg]'},
			checkboxName: 'settings[thumbnails_ffmpeg]',
			title: FR.T('Enable FFmpeg support.'),
			collapsed: !parseInt(FR.settings.thumbnails_ffmpeg),
			defaults: {width: 300},
			listeners: {'expand': function() {if (!this.layoutPatched) {this.doLayout(false, true);this.layoutPatched = true;}}},
			items: [
				{xtype: 'displayfield', width: 550, value: FR.T('Enables thumbnail generation for video files.')+'<br>'+FR.T('Download from %1').replace('%1', '<a href="https://ffmpeg.org/download.html" target="_blank">https://ffmpeg.org</a>'), style:'padding-bottom:10px', hideLabel: true},
				{
					xtype: 'textfield', ref: 'ffmpath',
					fieldLabel: FR.T('Path to FFmpeg binary'),
					name: 'settings[thumbnails_ffmpeg_path]', value: FR.settings.thumbnails_ffmpeg_path
				},
				{
					xtype: 'panel', border: false, layout: 'hbox', width: 500,
					layoutConfig: {padding: 5}, bodyStyle: 'padding-left:250px',
					defaults:{margins:'0 5 0 0'},
					items: [
						{xtype: 'button', cls: 'fr-btn-default fr-btn-smaller fr-btn-nomargin', text: FR.T('Check path'), handler: function() {
							var par = {path: this.ownerCt.ownerCt.ffmpath.getValue()};
							var output = this.ownerCt.ownerCt.serverReply; output.show();
							FR.utils.getAjaxOutput(FR.URLRoot+'/?module=cpanel&section=settings&page=image_preview&action=checkFFmpeg', par, output);
						}}
					]
				},
				{xtype: 'displayfield', ref: 'serverReply', value: 'test', style:'border:1px solid silver;padding:3px;overflow:auto', hidden: true},
				{
					xtype: 'textarea', spellcheck: false,
					fieldLabel: FR.T('Generate FFmpeg thumbnails for the following file types'),
					name: 'settings[thumbnails_ffmpeg_ext]', value: FR.settings.thumbnails_ffmpeg_ext
				}
			]
		},
		{
			checkboxToggle: {tag: 'input', type: 'checkbox', id: 'settings[thumbnails_libreoffice]'},
			checkboxName: 'settings[thumbnails_libreoffice]',
			title: FR.T('Enable LibreOffice support.')+' (v6.3+)',
			collapsed: !parseInt(FR.settings.thumbnails_libreoffice),
			defaults: {width: 300},
			listeners: {'expand': function() {if (!this.layoutPatched) {this.doLayout(false, true);this.layoutPatched = true;}}},
			items: [
				{xtype: 'displayfield', width: 550, value: FR.T('Enables thumbnail generation for Office documents.')+'<br>'+FR.T('Download from %1').replace('%1', '<a href="https://www.libreoffice.org/download/download/" target="_blank">https://www.libreoffice.org</a>'), style:'padding-bottom:10px', hideLabel: true},
				{
					xtype: 'textfield', ref: 'lopath',
					fieldLabel: FR.T('Path to LibreOffice binary'),
					name: 'settings[thumbnails_libreoffice_path]', value: FR.settings.thumbnails_libreoffice_path
				},
				{
					xtype: 'panel', border: false, layout: 'hbox', width: 500,
					layoutConfig: {padding: 5}, bodyStyle: 'padding-left:250px',
					defaults:{margins:'0 5 0 0'},
					items: [
						{xtype: 'button', cls: 'fr-btn-default fr-btn-smaller fr-btn-nomargin', text: FR.T('Check path'), handler: function() {
								var par = {path: this.ownerCt.ownerCt.lopath.getValue()};
								var output = this.ownerCt.ownerCt.serverReply; output.show();
								FR.utils.getAjaxOutput(FR.URLRoot+'/?module=cpanel&section=settings&page=image_preview&action=checkLibreOffice', par, output);
							}}
					]
				},
				{xtype: 'displayfield', ref: 'serverReply', value: 'test', style:'border:1px solid silver;padding:3px;overflow:auto', hidden: true},
				{
					xtype: 'textarea', spellcheck: false,
					fieldLabel: FR.T('Use with the following file types'),
					name: 'settings[thumbnails_libreoffice_ext]', value: FR.settings.thumbnails_libreoffice_ext
				}
			]
		},
		{
			checkboxToggle: {tag: 'input', type: 'checkbox', id: 'settings[thumbnails_stl]'},
			checkboxName: 'settings[thumbnails_stl]',
			title: FR.T('Enable stl-thumb support.'),
			collapsed: !parseInt(FR.settings.thumbnails_stl),
			defaults: {width: 300},
			listeners: {'expand': function() {if (!this.layoutPatched) {this.doLayout(false, true);this.layoutPatched = true;}}},
			items: [
				{xtype: 'displayfield', width: 550, value: FR.T('Enables thumbnail generation for STL 3D model files.')+'<br>'+FR.T('Download from %1').replace('%1', '<a href="https://github.com/unlimitedbacon/stl-thumb" target="_blank">https://github.com/unlimitedbacon/stl-thumb</a>'), style:'padding-bottom:10px', hideLabel: true},
				{
					xtype: 'textfield', ref: 'stlpath',
					fieldLabel: FR.T('Path to stl-thumb binary'),
					name: 'settings[thumbnails_stl_path]', value: FR.settings.thumbnails_stl_path
				},
				{
					xtype: 'panel', border: false, layout: 'hbox', width: 500,
					layoutConfig: {padding: 5}, bodyStyle: 'padding-left:250px',
					defaults:{margins:'0 5 0 0'},
					items: [
						{xtype: 'button', cls: 'fr-btn-default fr-btn-smaller fr-btn-nomargin', text: FR.T('Check path'), handler: function() {
								var par = {path: this.ownerCt.ownerCt.stlpath.getValue()};
								var output = this.ownerCt.ownerCt.serverReply; output.show();
								FR.utils.getAjaxOutput(FR.URLRoot+'/?module=cpanel&section=settings&page=image_preview&action=checkStlPath', par, output);
							}}
					]
				},
				{xtype: 'displayfield', ref: 'serverReply', value: 'test', style:'border:1px solid silver;padding:3px;overflow:auto', hidden: true}
			]
		},
		{
			checkboxToggle: {tag: 'input', type: 'checkbox', id: 'settings[thumbnails_pngquant]'},
			checkboxName: 'settings[thumbnails_pngquant]',
			title: FR.T('Enable pngquant support.'),
			collapsed: !parseInt(FR.settings.thumbnails_pngquant),
			defaults: {width: 300},
			listeners: {'expand': function() {if (!this.layoutPatched) {this.doLayout(false, true);this.layoutPatched = true;}}},
			items: [
				{xtype: 'displayfield', width: 550, value: FR.T('pngquant optimizes generated thumbnails in order to save disk space.')+'<br>'+FR.T('Download from %1').replace('%1', '<a href="https://pngquant.org/" target="_blank">https://pngquant.org</a>'), style:'padding-bottom:10px', hideLabel: true},
				{
					xtype: 'textfield', ref: 'pngquantPath',
					fieldLabel: FR.T('Path of the pngquant binary'),
					name: 'settings[thumbnails_pngquant_path]', value: FR.settings.thumbnails_pngquant_path
				},
				{
					xtype: 'panel', border: false, layout: 'hbox', width: 500,
					layoutConfig: {padding: 5}, bodyStyle: 'padding-left:250px',
					defaults:{margins:'0 0 0 0'},
					items: [
						{xtype: 'button', cls: 'fr-btn-default fr-btn-smaller fr-btn-nomargin', text: FR.T('Check path'), handler: function() {
							var par = {path: this.ownerCt.ownerCt.pngquantPath.getValue()};
							var output = this.ownerCt.ownerCt.serverReply;output.show();
							FR.utils.getAjaxOutput(FR.URLRoot+'/?module=cpanel&section=settings&page=image_preview&action=checkpngquant', par, output);
						}}
					]
				},
				{xtype: 'displayfield', ref: 'serverReply', value: 'test', style:'border:1px solid silver;padding:3px;', hidden: true}
			]
		}
	],
	tbar: [
		{
			text: FR.T('Save changes'), cls: 'fr-btn-primary',
			ref: 'saveBtn',
			handler: function() {
				var editForm = this.ownerCt.ownerCt;
				var params = editForm.form.getFieldValues();
				var extra = {};
				Ext.each([
					'thumbnails_ffmpeg',
					'thumbnails_libreoffice',
					'thumbnails_stl',
					'thumbnails_pngquant'
				], function(k) {
					extra['settings['+k+']'] = Ext.get('settings['+k+']').dom.checked ? 1:0;
				});
				Ext.apply(params, extra);
				var opts = {
					url: FR.URLRoot+'/?module=cpanel&section=settings&action=save',
					maskText: 'Saving changes...',
					params: params
				};
				editForm.submitForm(opts);
			}
		}
	]
}));
Ext.getCmp('appTab').doLayout();