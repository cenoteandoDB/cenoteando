ScriptLoader = function() {
	this.timeout = 30;
	this.scripts = [];
	this.disableCaching = false;
};

ScriptLoader.prototype = {
	processSuccess : function(response) {
		this.scripts[response.argument.url] = true;
		window.execScript ? window.execScript(response.responseText) : window.eval(response.responseText);
		if (response.argument.options.scripts.length == 0) {}
		if (typeof response.argument.callback == 'function') {
			response.argument.callback.call(response.argument.scope);
		}
	},
	load : function(url, callback) {
		var cfg, callerScope;
		if (typeof url == 'object') {
			cfg = url;
			url = cfg.url;
			callback = callback || cfg.callback;
			callerScope = cfg.scope;
			if (typeof cfg.timeout != 'undefined') {
				this.timeout = cfg.timeout;
			}
			if (typeof cfg.disableCaching != 'undefined') {
				this.disableCaching = cfg.disableCaching;
			}
		}
		Ext.Ajax.request({
			url : url,
			success : this.processSuccess,
			scope : this,
			disableCaching : this.disableCaching,
			argument : {
				'url' : url,
				'scope' : callerScope || window,
				'callback' : callback,
				'options' : cfg
			}
		});
	}
};

ScriptLoaderMgr = function() {
	this.loader = new ScriptLoader();
	this.load = function(o) {
		if (!Ext.isArray(o.scripts)) {
			o.scripts = [o.scripts];
		}
		o.url = o.scripts.shift();
		if (o.scripts.length == 0) {
			this.loader.load(o);
		} else {
			o.scope = this;
			this.loader.load(o, function() {
				this.load(o);
			});
		}
	};
	this.loadCss = function(scripts) {
		var id = '';
		var file;
		if (!Ext.isArray(scripts)) {
			scripts = [scripts];
		}
		for (var i = 0; i < scripts.length; i++) {
			file = scripts[i];
			id = '' + Math.floor(Math.random() * 100);
			Ext.util.CSS.createStyleSheet('', id);
			Ext.util.CSS.swapStyleSheet(id, file);
		}
	};
	this.addAsScript = function(o) {
		var count = 0;
		var script;
		var files = o.scripts;
		if (!Ext.isArray(files)) {
			files = [files];
		}
		var head = document.getElementsByTagName('head')[0];
		Ext.each(files, function(file) {
			script = document.createElement('script');
			script.type = 'text/javascript';
			if (Ext.isFunction(o.callback)) {
				script.onload = function() {
					count++;
					if (count == files.length) {
						o.callback.call();
					}
				}
			}
			script.src = file;
			head.appendChild(script);
		});
	}
};

ScriptMgr = new ScriptLoaderMgr();