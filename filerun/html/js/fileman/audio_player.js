FR.components.AudioPlayer = Ext.extend(Ext.Panel, {
	loaded: false, playOnLoad: false,
	initComponent: function() {
		Ext.apply(this, {
			listeners: {
				'expand': function() {
					if (this.loaded) {
						if (FR.currentSelectedFile && this.player) {
							this.loadItem(FR.currentSelectedFile);
						}
						return true;
					}
					this.update('<iframe src="?module=custom_actions&action=audio_player&context=embedded" allowtransparency="true" frameborder="0"></iframe>');
				}
			}, scope: this
		});
		FR.components.infoPanel.superclass.initComponent.apply(this, arguments);
	},
	loadItem: function(item) {
		this.player.loadFile(item);
		this.playOnLoad = false;
	},
	onLoad: function(player) {
		this.loaded = true;
		this.player = player;
		if (this.playOnLoad) {
			this.loadItem(this.playOnLoad);
		}
	},
	open: function(item) {
		if (item) {
			if (this.loaded) {
				this.loadItem(item);
			} else {
				if (!Ext.isAndroid) {
					this.playOnLoad = item;
				}
			}
		}
		FR.UI.gridPanel.view.changeMode('music');
	},
	close: function() {
		FR.UI.gridPanel.view.closeAudioPanel();
	}
});