Ext.ux.StatusBar = Ext.extend(Ext.Toolbar, {
	cls : 'x-statusbar',
	busyIconCls : 'x-status-busy',
	busyText : 'Loading...',
	autoClear : 5000,
	emptyText : '&nbsp;',
	activeThreadId : 0,
	initComponent : function(){
		if(this.statusAlign=='right'){
			this.cls += ' x-status-right';
		}
		Ext.ux.StatusBar.superclass.initComponent.call(this);
	},
	afterRender : function(){
		Ext.ux.StatusBar.superclass.afterRender.call(this);

		var right = this.statusAlign == 'right';
		this.currIconCls = this.iconCls || this.defaultIconCls;
		this.statusEl = new Ext.Toolbar.TextItem({
			cls: 'x-status-text ' + (this.currIconCls || ''),
			text: this.text || this.defaultText || ''
		});

		if(right){
			this.add('->');
			this.add(this.statusEl);
		}else{
			this.insert(0, this.statusEl);
			this.insert(1, '->');
		}
		this.doLayout();
	},
	setStatus : function(o){
		o = o || {};

		if(typeof o == 'string'){
			o = {text:o};
		}
		if(o.text !== undefined){
			this.setText(o.text);
		}
		if(o.iconCls !== undefined){
			this.setIcon(o.iconCls);
		}

		if(o.clear){
			var c = o.clear,
				wait = this.autoClear,
				defaults = {useDefaults: true, anim: true};

			if(typeof c == 'object'){
				c = Ext.applyIf(c, defaults);
				if(c.wait){
					wait = c.wait;
				}
			}else if(typeof c == 'number'){
				wait = c;
				c = defaults;
			}else if(typeof c == 'boolean'){
				c = defaults;
			}

			c.threadId = this.activeThreadId;
			this.clearStatus.defer(wait, this, [c]);
		}
		return this;
	},
	clearStatus : function(o){
		o = o || {};

		if(o.threadId && o.threadId !== this.activeThreadId){
			return this;
		}

		var text = o.useDefaults ? this.defaultText : this.emptyText,
			iconCls = o.useDefaults ? (this.defaultIconCls ? this.defaultIconCls : '') : '';

		if(o.anim){
			this.statusEl.el.fadeOut({
				remove: false,
				useDisplay: true,
				scope: this,
				callback: function(){
					this.setStatus({
						text: text,
						iconCls: iconCls
					});

					this.statusEl.el.show();
				}
			});
		}else{
			this.statusEl.hide();
			this.setStatus({
				text: text,
				iconCls: iconCls
			});
			this.statusEl.show();
		}
		return this;
	},
	setText : function(text){
		this.activeThreadId++;
		this.text = text || '';
		if(this.rendered){
			this.statusEl.setText(this.text);
		}
		return this;
	},
	getText : function(){
		return this.text;
	},
	setIcon : function(cls){
		this.activeThreadId++;
		cls = cls || '';

		if(this.rendered){
			if(this.currIconCls){
				this.statusEl.removeClass(this.currIconCls);
				this.currIconCls = null;
			}
			if(cls.length > 0){
				this.statusEl.addClass(cls);
				this.currIconCls = cls;
			}
		}else{
			this.currIconCls = cls;
		}
		return this;
	},
	showBusy : function(o){
		if(typeof o == 'string'){
			o = {text:o};
		}
		o = Ext.applyIf(o || {}, {
			text: this.busyText,
			iconCls: this.busyIconCls
		});
		return this.setStatus(o);
	}
});
Ext.reg('statusbar', Ext.ux.StatusBar);
