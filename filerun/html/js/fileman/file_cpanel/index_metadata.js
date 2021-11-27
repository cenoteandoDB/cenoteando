Ext.onReady(function() {

	FR.app = {
		found: 0,
		remaining: 0,
		pbar: new Ext.ProgressBar({
			width: 500, animate: true, hidden: true
		}),
		collect: function() {
			this.status.update('Collecting file list...');
			Ext.Ajax.request({
				url: URLRoot+'/?module=metadata&section=index&action=collect',
				method: 'post',
				params: {path: FR.path},
				callback: function(opts, succ, req) {
					try {
						var rs = Ext.decode(req.responseText);
					} catch (er){
						this.collect();
						return false;
					}
					var msg = '';
					if (rs.found) {
						this.found = rs.found;
						msg = FR.T('%1 files found').replace('%1', Ext.util.Format.number(rs.found, '0,000'));
					}
					if (rs.completed) {
						msg += '<br>';
						msg += FR.T('Indexing files...');
					}
					this.status.update(msg);
					if (rs.completed) {
						if (rs.found > 0) {
							this.pbar.show();
							this.process();
						} else {
							this.status.update(FR.T('The folder seems to be empty'));
						}
					} else {
						this.collect();
					}
				}, scope: this
			});
		},
		process: function() {
			Ext.Ajax.request({
				url: URLRoot+'/?module=metadata&section=index&action=process',
				method: 'post',
				params: {path: FR.path},
				callback: function(opts, succ, req) {
					var decodingFailed = false;
					try {
						var rs = Ext.decode(req.responseText);
					} catch (er){
						decodingFailed = true;
					}
					if (!succ || decodingFailed) {
						this.status.update(FR.T('There are problems with the server.')+'<br>'+FR.T('Retrying...'));
						window.setTimeout(function (){FR.app.process();}, 5000);
						return false;
					}
					FR.app.remaining = rs.remaining;
					var msg = FR.T('Indexing files...');
					msg += '<br>';
					msg += FR.T('%1 remaining').replace('%1', Ext.util.Format.number(rs.remaining, '0,000'));
					this.status.update(msg);
					if (!rs.completed) {
						this.process();
					}
					this.updateProgress();
				}, scope: this
			});
		},
		updateProgress: function() {
			if (this.remaining == 0) {
				this.status.update(FR.T('Indexing completed!'));
			}
			var val = (this.found-this.remaining)/this.found;
			this.pbar.updateProgress(val, Math.round(val*100)+'%');
		}
	};

	new Ext.Viewport({
		layout: 'fit',
		items: [{
			xtype: 'filerun-cpanel-app',
			layout: 'border',
			tbarItems: [
				{
					text: FR.T('Run'),
					cls: 'fr-btn-primary',
					id: 'startBtn',
					handler: function(){
						this.disable();
						FR.app.collect();
					}
				}
			],
			defaults: {bodyStyle: 'padding: 10px'},
			items: [
				{
					region: 'north',
					ref: 'status',
					height: 50,
					html: '<i class="fa fa-warning icon-red"></i> '+FR.T('Please note that this will import metadata from the files and can overwrite metadata which you have manually added.')
				},
				{
					region: 'center',
					items: FR.app.pbar
				}
			],
			listeners: {
				'afterrender': function() {
					FR.app.status = this.status;
				}
			}
		}]
	});

});