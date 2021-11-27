FR.components.editForm = Ext.extend(Ext.form.FormPanel, {
	layout: 'fit', cls: 'FREditForm', closable: true,
	submitForm: function(opts) {
		this.bwrap.mask(FR.T(opts.maskText));
		if (!opts.params) {opts.params = this.form.getValues();}
		if (opts.params.username_fake) {
			delete opts.params.username_fake;
		}
		if (opts.params.password_fake) {
			delete opts.params.password_fake;
		}
		if (FR.system.csrf_token) {opts.params.csrf = FR.system.csrf_token;}
		Ext.Ajax.request({
			url: opts.url,
			params: opts.params,
			callback: function() {this.bwrap.unmask();},
			success: function(req) {
				try {
					var rs = Ext.util.JSON.decode(req.responseText);
				} catch (er){return false;}
				if (rs) {
					if (rs.success) {
						FR.feedback(rs.msg);
						if (FR.grid.panel.store.proxy.url != '/') {
							FR.grid.panel.store.reload();
						}
					} else {
						FR.feedback(rs.msg);
						this.form.markInvalid(rs.errors);
					}
				} else {FR.feedback(req.responseText);}
			},
			failure: function(f, a) {FR.feedback(f.responseText);},
			scope: this
		});
	},
	deleteAction: function(opts) {
		this.bwrap.mask(FR.T(opts.maskText));
		if (!opts.params) {opts.params = this.form.getValues()}
		if (opts.extraParams) {Ext.apply(opts.params, opts.extraParams);}
		if (FR.system.csrf_token) {opts.params.csrf = FR.system.csrf_token;}
		Ext.Ajax.request({
			url: opts.url,
			params: opts.params,
			callback: function() {if (this.bwrap){this.bwrap.unmask();}},
			success: function(req) {
				try {
					var rs = Ext.util.JSON.decode(req.responseText);
				} catch (er){return false;}
				if (rs) {
					if (rs.success) {
						this.destroy();
						FR.feedback(rs.msg);
						FR.grid.panel.store.reload();
					} else {
						FR.feedback(rs.msg);
					}
				} else {FR.feedback(req.responseText);}
			},
			failure: function(f, a) {FR.feedback(f.responseText);},
			scope: this
		});
	}
});