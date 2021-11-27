Ext.form.HtmlEditor = Ext.extend(Ext.form.Field, {

	enableFormat : true,
	enableFontSize : true,
	enableColors : true,
	enableAlignments : true,
	enableLists : true,
	enableSourceEdit : true,
	enableLinks : true,
	enableFont : true,
	createLinkText : 'Please enter the URL for the link:',
	defaultLinkValue : 'http:/'+'/',
	fontFamilies : [
		'Arial',
		'Courier New',
		'Tahoma',
		'Times New Roman',
		'Verdana'
	],
	defaultFont: 'tahoma',
	defaultValue: '&#8203;',

	actionMode: 'wrap',
	validationEvent : false,
	deferHeight: true,
	initialized : false,
	activated : false,
	sourceEditMode : false,
	onFocus : Ext.emptyFn,
	iframePad:3,
	hideMode:'offsets',
	defaultAutoCreate : {
		tag: "textarea",
		style:"width:100%;height:100%;",
		autocomplete: "off"
	},


	initComponent : function(){
		this.addEvents(

			'initialize',
			'activate',
			'beforesync',
			'beforepush',
			'sync',
			'push',
			'editmodechange'
		);
		Ext.form.HtmlEditor.superclass.initComponent.call(this);
	},


	createFontOptions : function(){
		var buf = [], fs = this.fontFamilies, ff, lc;
		for(var i = 0, len = fs.length; i< len; i++){
			ff = fs[i];
			lc = ff.toLowerCase();
			buf.push(
				'<option value="',lc,'" style="font-family:',ff,';"',
				(this.defaultFont == lc ? ' selected="true">' : '>'),
				ff,
				'</option>'
			);
		}
		return buf.join('');
	},


	createToolbar : function(editor){
		var items = [];
		var tipsEnabled = Ext.QuickTips && Ext.QuickTips.isEnabled();


		function btn(id, toggle, handler){
			return {
				itemId : id,
				cls : 'x-btn-icon',
				iconCls: 'x-edit-'+id,
				enableToggle:toggle !== false,
				scope: editor,
				handler:handler||editor.relayBtnCmd,
				clickEvent:'mousedown',
				tooltip: tipsEnabled ? editor.buttonTips[id] || undefined : undefined,
				overflowText: editor.buttonTips[id].title || undefined,
				tabIndex:-1
			};
		}


		if(this.enableFont){
			var fontSelectItem = new Ext.Toolbar.Item({
				autoEl: {
					tag:'select',
					cls:'x-font-select',
					html: this.createFontOptions()
				}
			});

			items.push(
				fontSelectItem,
				'-'
			);
		}

		if(this.enableFormat){
			items.push(
				btn('bold'),
				btn('italic'),
				btn('underline')
			);
		}

		if(this.enableFontSize){
			items.push(
				'-',
				btn('increasefontsize', false, this.adjustFont),
				btn('decreasefontsize', false, this.adjustFont)
			);
		}

		if(this.enableColors){
			items.push(
				'-', {
					itemId:'forecolor',
					cls:'x-btn-icon',
					iconCls: 'x-edit-forecolor',
					clickEvent:'mousedown',
					tooltip: tipsEnabled ? editor.buttonTips.forecolor || undefined : undefined,
					tabIndex:-1,
					menu : new Ext.menu.ColorMenu({
						allowReselect: true,
						focus: Ext.emptyFn,
						value:'000000',
						plain:true,
						listeners: {
							scope: this,
							select: function(cp, color){
								this.execCmd('forecolor', Ext.isWebKit || Ext.isIE ? '#'+color : color);
								this.deferFocus();
							}
						},
						clickEvent:'mousedown'
					})
				}, {
					itemId:'backcolor',
					cls:'x-btn-icon',
					iconCls: 'x-edit-backcolor',
					clickEvent:'mousedown',
					tooltip: tipsEnabled ? editor.buttonTips.backcolor || undefined : undefined,
					tabIndex:-1,
					menu : new Ext.menu.ColorMenu({
						focus: Ext.emptyFn,
						value:'FFFFFF',
						plain:true,
						allowReselect: true,
						listeners: {
							scope: this,
							select: function(cp, color){
								if(Ext.isGecko){
									this.execCmd('useCSS', false);
									this.execCmd('hilitecolor', color);
									this.execCmd('useCSS', true);
									this.deferFocus();
								}else{
									this.execCmd('backcolor', Ext.isWebKit || Ext.isIE ? '#'+color : color);
									this.deferFocus();
								}
							}
						},
						clickEvent:'mousedown'
					})
				}
			);
		}

		if(this.enableAlignments){
			items.push(
				'-',
				btn('justifyleft'),
				btn('justifycenter'),
				btn('justifyright')
			);
		}


		if(this.enableLinks){
			items.push(
				'-',
				btn('createlink', false, this.createLink)
			);
		}

		if(this.enableLists){
			items.push(
				'-',
				btn('insertorderedlist'),
				btn('insertunorderedlist')
			);
		}
		if(this.enableSourceEdit){
			items.push(
				'-',
				btn('sourceedit', true, function(btn){
					this.toggleSourceEdit(!this.sourceEditMode);
				})
			);
		}



		var tb = new Ext.Toolbar({
			renderTo: this.wrap.dom.firstChild,
			items: items
		});

		if (fontSelectItem) {
			this.fontSelect = fontSelectItem.el;

			this.mon(this.fontSelect, 'change', function(){
				var font = this.fontSelect.dom.value;
				this.relayCmd('fontname', font);
				this.deferFocus();
			}, this);
		}


		this.mon(tb.el, 'click', function(e){
			e.preventDefault();
		});

		this.tb = tb;
		this.tb.doLayout();
	},

	onDisable: function(){
		this.wrap.mask();
		Ext.form.HtmlEditor.superclass.onDisable.call(this);
	},

	onEnable: function(){
		this.wrap.unmask();
		Ext.form.HtmlEditor.superclass.onEnable.call(this);
	},

	setReadOnly: function(readOnly){

		Ext.form.HtmlEditor.superclass.setReadOnly.call(this, readOnly);
		if(this.initialized){
			if(Ext.isIE){
				this.getEditorBody().contentEditable = !readOnly;
			}else{
				this.setDesignMode(!readOnly);
			}
			var bd = this.getEditorBody();
			if(bd){
				bd.style.cursor = this.readOnly ? 'default' : 'text';
			}
			this.disableItems(readOnly);
		}
	},


	getDocMarkup : function(){
		var h = Ext.fly(this.iframe).getHeight() - this.iframePad * 2;
		return String.format('<html><head><style type="text/css">body{border: 0; margin: 0; padding: {0}px; height: {1}px; cursor: text}</style></head><body></body></html>', this.iframePad, h);
	},


	getEditorBody : function(){
		var doc = this.getDoc();
		return doc.body || doc.documentElement;
	},


	getDoc : function(){
		return Ext.isIE ? this.getWin().document : (this.iframe.contentDocument || this.getWin().document);
	},


	getWin : function(){
		return Ext.isIE ? this.iframe.contentWindow : window.frames[this.iframe.name];
	},


	onRender : function(ct, position){
		Ext.form.HtmlEditor.superclass.onRender.call(this, ct, position);
		this.el.dom.style.border = '0 none';
		this.el.dom.setAttribute('tabIndex', -1);
		this.el.addClass('x-hidden');
		if(Ext.isIE){
			this.el.applyStyles('margin-top:-1px;margin-bottom:-1px;');
		}
		this.wrap = this.el.wrap({
			cls:'x-html-editor-wrap', cn:{cls:'x-html-editor-tb'}
		});
		this.createToolbar(this);
		this.disableItems(true);
		this.tb.doLayout();
		this.createIFrame();

		if(!this.width){
			var sz = this.el.getSize();
			this.setSize(sz.width, this.height || sz.height);
		}
		this.resizeEl = this.positionEl = this.wrap;
	},

	createIFrame: function(){
		var iframe = document.createElement('iframe');
		iframe.name = Ext.id();
		iframe.frameBorder = '0';
		iframe.style.overflow = 'auto';
		iframe.style.width = '100%';
		iframe.src = Ext.SSL_SECURE_URL;

		this.wrap.dom.appendChild(iframe);
		this.iframe = iframe;

		this.monitorTask = Ext.TaskMgr.start({
			run: this.checkDesignMode,
			scope: this,
			interval:100
		});
	},

	initFrame : function(){
		Ext.TaskMgr.stop(this.monitorTask);
		var doc = this.getDoc();
		this.win = this.getWin();

		doc.open();
		doc.write(this.getDocMarkup());
		doc.close();

		this.readyTask = {
			run : function(){
				var doc = this.getDoc();
				if(doc.body || doc.readyState == 'complete'){
					Ext.TaskMgr.stop(this.readyTask);
					this.setDesignMode(true);
					this.initEditor.defer(10, this);
				}
			},
			interval : 10,
			duration:10000,
			scope: this
		};
		Ext.TaskMgr.start(this.readyTask);
	},


	checkDesignMode : function(){
		if(this.wrap && this.wrap.dom.offsetWidth){
			var doc = this.getDoc();
			if(!doc){
				return;
			}
			if(!doc.editorInitialized || this.getDesignMode() != 'on'){
				this.initFrame();
			}
		}
	},


	setDesignMode : function(mode){
		var doc = this.getDoc();
		if (doc) {
			if(this.readOnly){
				mode = false;
			}
			doc.designMode = (/on|true/i).test(String(mode).toLowerCase()) ?'on':'off';
		}

	},


	getDesignMode : function(){
		var doc = this.getDoc();
		if(!doc){ return ''; }
		return String(doc.designMode).toLowerCase();

	},

	disableItems: function(disabled){
		if(this.fontSelect){
			this.fontSelect.dom.disabled = disabled;
		}
		this.tb.items.each(function(item){
			if(item.getItemId() != 'sourceedit'){
				item.setDisabled(disabled);
			}
		});
	},


	onResize : function(w, h){
		Ext.form.HtmlEditor.superclass.onResize.apply(this, arguments);
		if(this.el && this.iframe){
			if(Ext.isNumber(w)){
				var aw = w - this.wrap.getFrameWidth('lr');
				this.el.setWidth(aw);
				this.tb.setWidth(aw);
				this.iframe.style.width = Math.max(aw, 0) + 'px';
			}
			if(Ext.isNumber(h)){
				var ah = h - this.wrap.getFrameWidth('tb') - this.tb.el.getHeight();
				this.el.setHeight(ah);
				this.iframe.style.height = Math.max(ah, 0) + 'px';
				var bd = this.getEditorBody();
				if(bd){
					bd.style.height = Math.max((ah - (this.iframePad*2)), 0) + 'px';
				}
			}
		}
	},


	toggleSourceEdit : function(sourceEditMode){
		var iframeHeight,
			elHeight;

		if (sourceEditMode === undefined) {
			sourceEditMode = !this.sourceEditMode;
		}
		this.sourceEditMode = sourceEditMode === true;
		var btn = this.tb.getComponent('sourceedit');

		if (btn.pressed !== this.sourceEditMode) {
			btn.toggle(this.sourceEditMode);
			if (!btn.xtbHidden) {
				return;
			}
		}
		if (this.sourceEditMode) {

			this.previousSize = this.getSize();

			iframeHeight = Ext.get(this.iframe).getHeight();

			this.disableItems(true);
			this.syncValue();
			this.iframe.className = 'x-hidden';
			this.el.removeClass('x-hidden');
			this.el.dom.removeAttribute('tabIndex');
			this.el.focus();
			this.el.dom.style.height = iframeHeight + 'px';
		}
		else {
			elHeight = parseInt(this.el.dom.style.height, 10);
			if (this.initialized) {
				this.disableItems(this.readOnly);
			}
			this.pushValue();
			this.iframe.className = '';
			this.el.addClass('x-hidden');
			this.el.dom.setAttribute('tabIndex', -1);
			this.deferFocus();

			this.setSize(this.previousSize);
			delete this.previousSize;
			this.iframe.style.height = elHeight + 'px';
		}
		this.fireEvent('editmodechange', this, this.sourceEditMode);
	},


	createLink : function() {
		var url = prompt(this.createLinkText, this.defaultLinkValue);
		if(url && url != 'http:/'+'/'){
			this.relayCmd('createlink', url);
		}
	},


	initEvents : function(){
		this.originalValue = this.getValue();
	},


	markInvalid : Ext.emptyFn,


	clearInvalid : Ext.emptyFn,


	setValue : function(v){
		Ext.form.HtmlEditor.superclass.setValue.call(this, v);
		this.pushValue();
		return this;
	},


	cleanHtml: function(html) {
		html = String(html);
		if(Ext.isWebKit){
			html = html.replace(/\sclass="(?:Apple-style-span|khtml-block-placeholder)"/gi, '');
		}


		if(html.charCodeAt(0) == this.defaultValue.replace(/\D/g, '')){
			html = html.substring(1);
		}
		return html;
	},


	syncValue : function(){
		if(this.initialized){
			var bd = this.getEditorBody();
			var html = bd.innerHTML;
			if(Ext.isWebKit){
				var bs = bd.getAttribute('style');
				var m = bs.match(/text-align:(.*?);/i);
				if(m && m[1]){
					html = '<div style="'+m[0]+'">' + html + '</div>';
				}
			}
			html = this.cleanHtml(html);
			if(this.fireEvent('beforesync', this, html) !== false){
				this.el.dom.value = html;
				this.fireEvent('sync', this, html);
			}
		}
	},


	getValue : function() {
		this[this.sourceEditMode ? 'pushValue' : 'syncValue']();
		return Ext.form.HtmlEditor.superclass.getValue.call(this);
	},


	pushValue : function(){
		if(this.initialized){
			var v = this.el.dom.value;
			if(!this.activated && v.length < 1){
				v = this.defaultValue;
			}
			if(this.fireEvent('beforepush', this, v) !== false){
				this.getEditorBody().innerHTML = v;
				if(Ext.isGecko){

					this.setDesignMode(false);
					this.setDesignMode(true);
				}
				this.fireEvent('push', this, v);
			}

		}
	},


	deferFocus : function(){
		this.focus.defer(10, this);
	},


	focus : function(){
		if(this.win && !this.sourceEditMode){
			this.win.focus();
		}else{
			this.el.focus();
		}
	},


	initEditor : function(){

		try{
			var dbody = this.getEditorBody(),
				ss = this.el.getStyles('font-size', 'font-family', 'background-image', 'background-repeat', 'background-color', 'color'),
				doc,
				fn;

			ss['background-attachment'] = 'fixed';
			dbody.bgProperties = 'fixed';

			Ext.DomHelper.applyStyles(dbody, ss);

			doc = this.getDoc();

			if(doc){
				try{
					Ext.EventManager.removeAll(doc);
				}catch(e){}
			}


			fn = this.onEditorEvent.createDelegate(this);
			Ext.EventManager.on(doc, {
				mousedown: fn,
				dblclick: fn,
				click: fn,
				keyup: fn,
				buffer:100
			});

			if(Ext.isGecko){
				Ext.EventManager.on(doc, 'keypress', this.applyCommand, this);
			}
			if(Ext.isIE || Ext.isWebKit){
				Ext.EventManager.on(doc, 'keydown', this.fixKeys, this);
			}
			doc.editorInitialized = true;
			this.initialized = true;
			this.pushValue();
			this.setReadOnly(this.readOnly);
			this.fireEvent('initialize', this);
		}catch(e){}
	},


	beforeDestroy : function(){
		if(this.monitorTask){
			Ext.TaskMgr.stop(this.monitorTask);
		}
		if(this.readyTask){
			Ext.TaskMgr.stop(this.readyTask);
		}
		if(this.rendered){
			Ext.destroy(this.tb);
			var doc = this.getDoc();
			Ext.EventManager.removeFromSpecialCache(doc);
			if(doc){
				try{
					Ext.EventManager.removeAll(doc);
					for (var prop in doc){
						delete doc[prop];
					}
				}catch(e){}
			}
			if(this.wrap){
				this.wrap.dom.innerHTML = '';
				this.wrap.remove();
			}
		}
		Ext.form.HtmlEditor.superclass.beforeDestroy.call(this);
	},


	onFirstFocus : function(){
		this.activated = true;
		this.disableItems(this.readOnly);
		if(Ext.isGecko){
			this.win.focus();
			var s = this.win.getSelection();
			if(!s.focusNode || s.focusNode.nodeType != 3){
				var r = s.getRangeAt(0);
				r.selectNodeContents(this.getEditorBody());
				r.collapse(true);
				this.deferFocus();
			}
			try{
				this.execCmd('useCSS', true);
				this.execCmd('styleWithCSS', false);
			}catch(e){}
		}
		this.fireEvent('activate', this);
	},


	adjustFont: function(btn){
		var adjust = btn.getItemId() == 'increasefontsize' ? 1 : -1,
			size = this.getDoc().queryCommandValue('FontSize') || '2',
			isPxSize = Ext.isString(size) && size.indexOf('px') !== -1;
		size = parseInt(size, 10);
		if (isPxSize){
            if (size <= 10) {
                size = 1 + adjust;
            } else if (size <= 13) {
                size = 2 + adjust;
            } else if (size <= 16) {
                size = 3 + adjust;
            } else if (size <= 18) {
                size = 4 + adjust;
            } else if (size <= 24) {
                size = 5 + adjust;
            } else {
                size = 6 + adjust;
            }
			size = size.constrain(1, 6);
		} else {
			if (Ext.isSafari) {
                adjust *= 2;
            }
			size = Math.max(1, size+adjust) + (Ext.isSafari ? 'px' : 0);
		}
		this.execCmd('FontSize', size);
	},

	onEditorEvent : function(e){
		this.updateToolbar();
	},

	updateToolbar: function(){
		if(this.readOnly){
			return;
		}
		if(!this.activated){
			this.onFirstFocus();
			return;
		}
		var btns = this.tb.items.map,
			doc = this.getDoc();

		if(this.enableFont){
			var name = (doc.queryCommandValue('FontName')||this.defaultFont).toLowerCase();
			if(name != this.fontSelect.dom.value){
				this.fontSelect.dom.value = name;
			}
		}
		if(this.enableFormat){
			btns.bold.toggle(doc.queryCommandState('bold'));
			btns.italic.toggle(doc.queryCommandState('italic'));
			btns.underline.toggle(doc.queryCommandState('underline'));
		}
		if(this.enableAlignments){
			btns.justifyleft.toggle(doc.queryCommandState('justifyleft'));
			btns.justifycenter.toggle(doc.queryCommandState('justifycenter'));
			btns.justifyright.toggle(doc.queryCommandState('justifyright'));
		}
		if(this.enableLists){
			btns.insertorderedlist.toggle(doc.queryCommandState('insertorderedlist'));
			btns.insertunorderedlist.toggle(doc.queryCommandState('insertunorderedlist'));
		}

		Ext.menu.MenuMgr.hideAll();
		this.syncValue();
	},

	relayBtnCmd : function(btn){
		this.relayCmd(btn.getItemId());
	},

	relayCmd : function(cmd, value){
		(function(){
			this.focus();
			this.execCmd(cmd, value);
			this.updateToolbar();
		}).defer(10, this);
	},

	execCmd : function(cmd, value){
		var doc = this.getDoc();
		doc.execCommand(cmd, false, value === undefined ? null : value);
		this.syncValue();
	},

	applyCommand : function(e){
		if(e.ctrlKey){
			var c = e.getCharCode(), cmd;
			if(c > 0){
				c = String.fromCharCode(c);
				switch(c){
					case 'b':
						cmd = 'bold';
						break;
					case 'i':
						cmd = 'italic';
						break;
					case 'u':
						cmd = 'underline';
						break;
				}
				if(cmd){
					this.win.focus();
					this.execCmd(cmd);
					this.deferFocus();
					e.preventDefault();
				}
			}
		}
	},

	insertAtCursor : function(text){
		if(!this.activated){
			return;
		}
		if(Ext.isIE){
			this.win.focus();
			var doc = this.getDoc(),
				r = doc.selection.createRange();
			if(r){
				r.pasteHTML(text);
				this.syncValue();
				this.deferFocus();
			}
		}else{
			this.win.focus();
			this.execCmd('InsertHTML', text);
			this.deferFocus();
		}
	},

	fixKeys : function(){
		if(Ext.isIE){
			return function(e){
				var k = e.getKey(),
					doc = this.getDoc(),
					r;
				if(k == e.TAB){
					e.stopEvent();
					r = doc.selection.createRange();
					if(r){
						r.collapse(true);
						r.pasteHTML('&nbsp;&nbsp;&nbsp;&nbsp;');
						this.deferFocus();
					}
				}else if(k == e.ENTER){
					r = doc.selection.createRange();
					if(r){
						var target = r.parentElement();
						if(!target || target.tagName.toLowerCase() != 'li'){
							e.stopEvent();
							r.pasteHTML('<br />');
							r.collapse(false);
							r.select();
						}
					}
				}
			};
		} else if (Ext.isWebKit){
			return function(e){
				var k = e.getKey();
				if(k == e.TAB){
					e.stopEvent();
					this.execCmd('InsertText','\t');
					this.deferFocus();
				}else if(k == e.ENTER){
					e.stopEvent();
					this.execCmd('InsertHtml','<br /><br />');
					this.deferFocus();
				}
			};
		}
	}(),

	getToolbar : function(){
		return this.tb;
	},

	buttonTips : {
		bold : {
			title: 'Bold (Ctrl+B)',
			text: 'Make the selected text bold.',
			cls: 'x-html-editor-tip'
		},
		italic : {
			title: 'Italic (Ctrl+I)',
			text: 'Make the selected text italic.',
			cls: 'x-html-editor-tip'
		},
		underline : {
			title: 'Underline (Ctrl+U)',
			text: 'Underline the selected text.',
			cls: 'x-html-editor-tip'
		},
		increasefontsize : {
			title: 'Grow Text',
			text: 'Increase the font size.',
			cls: 'x-html-editor-tip'
		},
		decreasefontsize : {
			title: 'Shrink Text',
			text: 'Decrease the font size.',
			cls: 'x-html-editor-tip'
		},
		backcolor : {
			title: 'Text Highlight Color',
			text: 'Change the background color of the selected text.',
			cls: 'x-html-editor-tip'
		},
		forecolor : {
			title: 'Font Color',
			text: 'Change the color of the selected text.',
			cls: 'x-html-editor-tip'
		},
		justifyleft : {
			title: 'Align Text Left',
			text: 'Align text to the left.',
			cls: 'x-html-editor-tip'
		},
		justifycenter : {
			title: 'Center Text',
			text: 'Center text in the editor.',
			cls: 'x-html-editor-tip'
		},
		justifyright : {
			title: 'Align Text Right',
			text: 'Align text to the right.',
			cls: 'x-html-editor-tip'
		},
		insertunorderedlist : {
			title: 'Bullet List',
			text: 'Start a bulleted list.',
			cls: 'x-html-editor-tip'
		},
		insertorderedlist : {
			title: 'Numbered List',
			text: 'Start a numbered list.',
			cls: 'x-html-editor-tip'
		},
		createlink : {
			title: 'Hyperlink',
			text: 'Make the selected text a hyperlink.',
			cls: 'x-html-editor-tip'
		},
		sourceedit : {
			title: 'Source Edit',
			text: 'Switch to source editing mode.',
			cls: 'x-html-editor-tip'
		}
	}
});
Ext.reg('htmleditor', Ext.form.HtmlEditor);