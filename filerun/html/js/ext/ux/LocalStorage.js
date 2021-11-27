Ext.ns('Ext.ux.state');

Ext.ux.state.LocalStorage = function(config) {
	Ext.ux.state.LocalStorage.superclass.constructor.call(this);
	Ext.apply(this, config);
	this.state = this.readLocalStorage();
};

Ext.extend(Ext.ux.state.LocalStorage, Ext.state.Provider, {
	namePrefix: 'fr-',
	set: function(name, value) {
		if (typeof value == "undefined" || value === null) {
			this.clear(name);
			return;
		}
		localStorage.setItem(this.namePrefix + name, this.encodeValue(value));
		Ext.ux.state.LocalStorage.superclass.set.call(this, name, value);
	},
	'clear': function(name) {
		localStorage.removeItem(this.namePrefix + name);
		Ext.ux.state.LocalStorage.superclass.clear.call(this, name);
	},
	
	readLocalStorage: function() {
		var data = {};
		var name;
		for (i = 0; i <= localStorage.length - 1; i++) {
			name = localStorage.key(i);
			if (name && name.substring(0, this.namePrefix.length) == this.namePrefix) {
				data[name.substr(this.namePrefix.length)] = this.decodeValue(localStorage.getItem(name));
			}
		}
		return data;
	}
});

Ext.state.Manager.setProvider(new Ext.ux.state.LocalStorage());