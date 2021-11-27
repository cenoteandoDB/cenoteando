FR = {
	initialized: false, pgrs: 0, duration: 0, fileItem: false, aurora4M4A: false,
	paused: true, thumbDrag: false, volume: 50, isMobile: Ext.isMobile,
	volumeSlider: false, embedded: false,
	init: function() {
		if (this.initialized) {return false;}
		this.embedded = (Settings.context == 'embedded');
		if (this.embedded) {
			window.parent.FR.UI.AudioPlayer.app = FR;
		}
		Ext.QuickTips.init();
		var tbarItems = [
			{
				tooltip: FR.T('Select'), iconCls: 'fa fa-fw fa-check-square-o',
				handler: function () {
					window.parent.FR.UI.gridPanel.highlightByRecord(this.fileItem);
				}, scope: this, disabled: !this.embedded
			},
			{
				tooltip: FR.T('Shuffle'), iconCls: 'fa fa-fw fa-random',
				handler: function() {window.parent.FR.UI.gridPanel.store.sort('random');}, disabled: !this.embedded
			},
			{
				tooltip: FR.T('Previous'), style: 'margin-left:5px;font-size:1.2em',
				iconCls: 'fa fa-fw fa-step-backward',
				id: 'fr-prev-btn',
				handler: this.previousFile, scope: this,
				disabled: !this.embedded
			},{
				tooltip: FR.T('Play/Pause'), style: 'margin-left:5px;font-size:1.5em',
				iconCls: 'fa fa-fw fa-play', handler: this.playPause,
				id: 'fr-play-btn', scope: this
			},{
				tooltip: FR.T('Next'), style: 'margin-left:5px;font-size:1.2em',
				id: 'fr-next-btn', iconCls: 'fa fa-fw fa-step-forward',
				handler: this.nextFile, scope: this, disabled: !this.embedded
			}
		];
		if (this.isMobile) {
			this.volume = 100;
		} else {
			tbarItems.push('->');
			tbarItems.push('<div id="volSlider" style="width:120px;"></div>');
			tbarItems.push('<li class="fa fa-fw fa-large fa-lg fa-volume-up" style="color:#B0B0B0;margin-right:9px;"></li>');
		}
		this.toolbar = new Ext.Toolbar({items: tbarItems, style: 'padding-bottom:15px'});
		this.progress = new Ext.Slider({
			style: 'margin:0 14px 0 7px',
			value: 0,
			minValue: 0,
			maxValue: 100,
			listeners: {
				dragstart: function() {FR.thumbDrag = true;},
				dragend: function() {FR.thumbDrag = false;},
				changecomplete: function(s, newValue) {
					this.song.seek(newValue/100*FR.duration);
				}, scope: this
			}
		});

		var layout = {
			layout: 'border',
			items: [
				{
					region: 'west', width: 125,
					html: '<div id="cover"></div>'
				},
				{
					layout: 'border',
					region: 'center',
					items: [
						{
							region: 'north',
							html: '<div style="margin:5px;"><div style="position:relative;height:40px;"><div id="closeBtn"></div><div id="loadInfo">&nbsp;</div><div id="songDur"></div></div><div id="songInfo">&nbsp;</div></div>',
							height: 60
						},
						{
							region: 'center',
							items: this.progress,
							bbar: this.toolbar
						}
					]
				}
			]
		};
		if (!this.embedded) {
			layout.width = 500;
			layout.height = 200;
			layout.closable = false;
			this.viewport = new Ext.Window(layout);
			this.viewport.show().anchorTo(Ext.get('theBODY'), 'c-c');
		} else {
			this.viewport = new Ext.Viewport(layout);
		}
		new Ext.Button({
			renderTo: 'closeBtn',
			tooltip: FR.T('Close player'),
			iconCls: 'fa fa-fw fa-close gray',
			handler: function() {
				this.reset();
				with (window.parent) {
					FR.UI.AudioPlayer.close();
				}
			}, scope: this, hidden: !this.embedded
		});
		if (!this.isMobile) {
			this.volumeSlider = new Ext.Slider({
				renderTo: 'volSlider',
				tooltip: 'Adjust Volume',
				value: this.volume, minValue: 0, maxValue: 100,
				listeners: {
					change: function (s, newValue) {
						FR.setVolume(newValue);
					}
				}
			});
		}
		this.updater = new Ext.util.DelayedTask(function(){
			FR.setProgress(FR.song.getProgress());
			FR.updateProgress();
			FR.updater.delay(500);
		});
		this.reset();
		if (!this.embedded) {
			this.loadFile(fileItem);
		} else {
			window.parent.FR.UI.AudioPlayer.onLoad(FR);
		}
		this.initialized = true;
	},
	setVolume: function(v) {
		if (this.song) {
			this.song.setVolume(v);
		}
		this.volume = v;
	},
	stopPlayback: function() {
		this.song.stop();
		this.paused = true;
		Ext.getCmp('fr-play-btn').setIconClass('fa fa-fw fa-play');
		this.progress.setValue(0);
		this.reset();
	},
	playPause: function() {
		if (this.paused) {
			this.play();
		} else {
			this.pause();
		}
	},
	pause: function() {
		if (!this.song) {return false;}
		this.updater.cancel();
		Ext.getCmp('fr-play-btn').setIconClass('fa fa-fw fa-play');
		this.song.pause();
		this.paused = true;
	},
	play: function() {
		if (!this.song) {
			this.nextFile();
		} else {
			this.song.play();
		}
	},
	setProgress: function(p) {
		FR.pgrs = p;
	},
	setDuration: function(d) {
		FR.duration = d;
	},
	reset: function() {
		this.updater.cancel();
		if (this.song) {
			this.song.destroy();
		}
		this.pgrs = 0;
		this.duration = 0;
		this.setCoverImage(Settings.default_cover);
		Ext.get('songDur').update(FR.formatTime(0) + ' / ' + FR.formatTime(0));
		Ext.get('loadInfo').update('');
		this.progress.setValue(0);
	},
	updateProgress: function() {
		if (FR.duration) {
			if (FR.progress.disabled) {
				FR.progress.enable();
			}
			var perc = FR.pgrs / FR.duration * 100;
			FR.progress.setValue(perc);
			Ext.get('songDur').update(FR.formatTime(FR.pgrs) + ' / ' + FR.formatTime(FR.duration));
		} else {
			Ext.get('songDur').update(FR.formatTime(FR.pgrs) + ' / &infin;');
			if (!FR.progress.disabled) {
				FR.progress.disable();
			}
		}
	},
	formatTime: function(s){
		var min=parseInt(s/60);
		var sec=parseInt(s%60);
		return String.leftPad(min,2,'0')+':'+String.leftPad(sec,2,'0');
	},
	getDurationEstimate: function(song) {
		if (song.instanceOptions.isMovieStar) {
			return (song.duration);
		} else {
			return song.durationEstimate || (song.duration || 0);
		}
	},
	setCoverImage: function(url) {
		if (!url) {
			if (this.fileItem.data.thumb) {
				url = window.parent.FR.UI.getThumbURL(this.fileItem.data);
			} else {
				url = window.parent.FR.UI.getFileIconURL(this.fileItem.data.icon);
			}
		}
		var img = Ext.get(Ext.DomHelper.createDom({tag: 'img'}));
		img.on('load', function () {
			Ext.get('cover').setStyle('backgroundImage', 'url(' + this.getAttribute('src') + ')');
		});
		img.dom.src = url;
	},
	loadFile: function(fileItem) {
		if (fileItem.data.isFolder || fileItem.data.filetype != 'mp3') {return false;}
		this.fileItem = fileItem;
		if (this.song) {this.reset();}
		Ext.get('songInfo').update(fileItem.data.filename);

		var url = fileItem.data.url || URLRoot+'/?module=custom_actions&action=audio_player&method=stream&path='+encodeURIComponent(fileItem.data.path);

		this.song = new Song({
			url: url,
			ext: fileItem.data.ext,
			volume: this.volume,
			onLoad: function(duration) {
				FR.setDuration(duration);
				FR.updateProgress();
			},
			onPlay: function() {
				Ext.getCmp('fr-play-btn').setIconClass('fa fa-fw fa-pause');
				FR.paused = false;
				FR.setCoverImage(FR.embedded ? false : Settings.default_cover);
				FR.updater.delay(0);
			},
			onLoadError: function(id, error) {
				var msg = FR.T('Failed to load audio file: %1').replace('%1', error);
				if (FR.embedded) {
					with (window.parent) {
						FR.UI.feedback(msg);
					}
				} else {
					alert(msg);
				}
			},
			onEnd: function() {
				FR.nextFile();
			},
			onBuffering: function(percent) {
				if (percent < 100) {
					Ext.get('loadInfo').update('Loading: ' + Math.round(percent) + '%');
				} else {
					Ext.get('loadInfo').update('');
				}
			},
			onMetadata: function() {}
		});
		this.play();
	},
	nextFile: function() {
		var gridStore = window.parent.FR.UI.gridPanel.store;
		var findRecord = this.fileItem;
		var rowIdx = gridStore.findBy(function(record) {
			if (findRecord == record) {return true;}
		});
		var nextRowIdx, r;
		if (rowIdx == -1) {
			nextRowIdx = 0;
		} else {
			nextRowIdx = rowIdx+1;
			if (!gridStore.getAt(nextRowIdx)) {
				nextRowIdx = 0;
			}
		}
		r = gridStore.getAt(nextRowIdx);
		if (!r) {return false;}
		this.loadFile(r);
	},
	previousFile: function() {
		var gridStore = window.parent.FR.UI.gridPanel.store;
		var findRecord = this.fileItem;
		var rowIdx = gridStore.findBy(function(record) {
			if (findRecord == record) {return true;}
		});
		var prevRowIdx, r;
		if (rowIdx == -1) {
			prevRowIdx = 0;
		} else {
			prevRowIdx = rowIdx-1;
			if (!gridStore.getAt(prevRowIdx)) {
				prevRowIdx = gridStore.data.keys.length-1;
			}
		}
		r = gridStore.getAt(prevRowIdx);
		if (!r) {return false;}
		this.loadFile(r);
	}
};

var Song = function(opts) {
	var aurora = (opts.ext == 'm4a' && FR.aurora4M4A);
	this.opts = opts;
	this.load(aurora);
};
Song.prototype.load = function(aurora) {
	this.progress = 0;
	this.duration = 0;
	var ths = this;
	if (aurora) {
		this.aurora = true;
		this.player = AV.Player.fromURL(this.opts.url);
		this.player.volume = this.opts.volume;
		this.player.on('ready', function(){
			ths.duration = Math.ceil(this.duration/1000);
			ths.opts.onLoad(ths.duration);
			ths.opts.onPlay();
		});
		this.player.on('progress', function(p) {ths.progress = Math.ceil(p/1000);});
		this.player.on('error', this.opts.onLoadError.bind(this));
		this.player.on('end', this.opts.onEnd.bind(this));
		this.player.on('metadata', this.opts.onMetadata.bind(this));
		this.player.on('buffer', this.opts.onBuffering.bind(this));

	} else {
		this.aurora = false;
		this.player = new Howl({
			src: [this.opts.url],
			format: [this.opts.ext],
			volume: (this.opts.volume / 100),
			preload: true,
			html5: true,
			onload: function() {
				ths.opts.onLoad(this.duration());
			},
			onplay: function(){ths.opts.onPlay();},
			onloaderror: function() {
				//retry using aurora
				FR.aurora4M4A = true;
				this.load(true).play();
			}.bind(this),
			onend: this.opts.onEnd.bind(this)
		});
	}
	return this;
};
Song.prototype.play = function() {
	this.player.play();
};
Song.prototype.pause = function() {
	this.player.pause();
};
Song.prototype.getDuration = function() {
	return this.duration;
};
Song.prototype.getProgress = function() {
	if (this.aurora) {
		return this.progress;
	}
	return this.player.seek();
};
Song.prototype.destroy = function() {
	this.player.stop();
	if (!this.aurora) {
		this.player.unload();
	}
};
Song.prototype.setVolume = function(v) {
	if (this.aurora) {
		this.player.volume = v;
	} else {
		this.player.volume(v/100);
	}
};
Song.prototype.seek = function(p) {
	this.player.seek(p);
};

Ext.onReady(function(){
	FR.init();
	Ext.fly('loadMsg').fadeOut();
});