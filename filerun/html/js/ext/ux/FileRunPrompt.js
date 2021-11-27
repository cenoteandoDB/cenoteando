Ext.ux.prompt = Ext.extend(Ext.Window, {
	modal: true, closable: false, confirmBtnLabel: false, cancelBtnLabel: false, defaultValue: null, allowEmpty: false, placeHolder: null, selectFilename: true,
	width: 350,
	initComponent: function() {
		var items = [];
		this.btnLabels = {
			confirm: this.confirmBtnLabel || FR.T('Ok'),
			cancel: this.cancelBtnLabel || FR.T('Cancel')
		};
		if (this.text) {
			this.textDisplayField = new Ext.form.DisplayField({value: this.text});
			items.push(this.textDisplayField);
		}
		var anchorTop;
		if (this.defaultValue !== null || this.placeHolder !== null) {
			this.input = new Ext.form.TextField({
				width: '100%', height: 30,
				value: this.defaultValue, allowBlank: this.allowEmpty
			});
			this.selectField = new Ext.util.DelayedTask(function(){
				this.input.focus(true);
				if (this.defaultValue) {
					if (this.selectFilename) {
						var dotpos = this.defaultValue.lastIndexOf(".");
						if (dotpos !== -1) {
							this.input.selectText(0, dotpos);
							return true;
						}
					}
					this.input.selectText();
				}
			}, this);
			items.push(this.input);
			if (Ext.isMobile) {anchorTop = true;}
		} else {
			if (!this.callback && this.confirmHandler) {
				this.btnLabels = {
					confirm: this.confirmBtnLabel || FR.T('Yes'),
					cancel: this.cancelBtnLabel || FR.T('No')
				};
			}
		}
		var buttons = [];
		buttons.push({
			text: this.btnLabels.confirm, cls: 'fr-btn-primary', style: 'margin-left: 0;',
			handler: function() {
				if (this.input && (!this.input.isValid() && !this.allowEmpty)) {
					return false;
				}
				this.doAction(this.confirmHandler ? this.confirmHandler : this.callback);
			}, scope: this
		});
		if (this.confirmHandler || this.cancelHandler) {
			buttons.push({text: this.btnLabels.cancel,  style:'margin-left:10px;', handler: function() {this.doAction(this.cancelHandler);}, scope: this});
		}
		Ext.apply(this, {
			items: {
				layout: 'form', bodyStyle: 'padding:'+(this.text ? '10px 0 20px 0' : '10px 0'), defaults: {hideLabel: true},
				items: items
			},
			buttons: buttons,
			buttonAlign: 'left',
			keys: [
				{
					'key': Ext.EventObject.ENTER,
					'fn': function() {
						if (this.input && (!this.input.isValid() && !this.allowEmpty)) {
							return false;
						}
						this.doAction(this.confirmHandler);
					},'scope': this
				},
				{
					'key': Ext.EventObject.ESC,
					'fn': function() {
						this.doAction(this.cancelHandler);
					},'scope': this
				}
			],
			listeners: {
				'afterrender': function() {
					if (this.placeHolder !== null) {
						this.input.el.set({'placeholder': this.placeHolder});
					}
				},
				'show': function() {if (this.input) {this.selectField.delay(200);}}
			}
		});
		Ext.ux.prompt.superclass.initComponent.apply(this, arguments);

		this.show();
		if (anchorTop) {
			this.alignTo(Ext.getBody(), 't-t', [0,10]);
		}
	},
	doAction: function(handler) {
		if (handler) {
			var scope = this.scope || this;
			var params = [];
			if (this.input) {
				params = [this.input.getValue(), this.defaultValue, this];
			}
			Ext.createDelegate(handler, scope, params)();
		}
		if (this.closeAction == 'hide') {
			this.hide();
		} else {
			this.close();
		}
	},
	setText: function(text) {
		this.textDisplayField.setValue(text);
	}
});