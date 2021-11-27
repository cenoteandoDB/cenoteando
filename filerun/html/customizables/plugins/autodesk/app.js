FR = {
	UI: {},
	urn: false,
	access_token: false,
	viewer: false,
	init: function() {
		this.pbar = new Ext.ProgressBar({style: 'font-family:Roboto;font-size:11px', animate: true, width:480, hidden: true});
		this.viewport = new Ext.Viewport({
			layout: 'card', activeItem: 0,
			items: [
				{
					style: 'padding:20px;',
					html: '<div id="status" style="font-family:Roboto"></div>',
					tbar: [this.pbar]
				},
				{
					html: '<div id="viewer" style="width:100px;height:100px;"></div>'
				}
			]
		});
		FR.start();
	},
	start: function() {
		this.log(FR.T('Connecting to AutoDesk...'));
		var params = {};
		if (!isWebLink) {
			params.path = path;
		}
		Ext.Ajax.request({
			url: actionURL+'&method=start',
			params: params,
			callback: function(opts, succ, req) {
				try {
					var rs = Ext.util.JSON.decode(req.responseText);
				} catch (er){return false;}
				if (rs.msg) {
					if (windowId) {
						window.parent.FR.UI.feedback(rs.msg);
					}
					FR.urn = rs.urn;
					FR.access_token = rs.access_token;
					FR.log(rs.msg);
					if (FR.access_token) {
						window.setTimeout(function () {
							FR.pbar.show();
							FR.getStatus();
						}, 2000);
					}
				}
			}
		});
	},
	getStatus: function() {
		var progress = 0;
		var params = {
			urn: FR.urn,
			access_token: FR.access_token
		};
		if (!isWebLink) {
			params.path = path;
		}
		Ext.Ajax.request({
			url: actionURL+'&method=checkStatus',
			params: params,
			callback: function(opts, succ, req) {
				try {
					var rs = Ext.util.JSON.decode(req.responseText);
				} catch (er){return false;}
				if (rs.msg) {
					this.log(rs.msg);
				}
				if (rs.success) {
					if (rs.data.status == 'inprogress' || rs.data.status == 'pending') {
						progress = rs.percent/100;
						this.pbar.updateProgress(progress, rs.data.progress);
						Ext.DomHelper.append('status', {tag: 'span', html: '.'});
						window.setTimeout(function(){FR.getStatus();}, 2000);
					} else if (rs.data.status == 'success') {
						this.pbar.updateProgress(1, rs.data.progress);
						this.viewport.getLayout().setActiveItem(1);
						FR.loadViewer();
					}
				}
			},
			scope: this
		});
	},
	log: function(txt) {
		Ext.DomHelper.append('status', {tag: 'div', html: txt});
		FR.viewport.getLayout().setActiveItem(0);
	},
	loadViewer: function() {
		Autodesk.Viewing.Initializer(
			{
				'env':'AutodeskProduction',
				'api': 'derivativeV2',
				'accessToken': FR.access_token
			},
			function() {
				Autodesk.Viewing.Document.load(
					'urn:'+FR.urn,
					function (doc) {// onDocumentLoadSuccess
						// A document contains references to 3D and 2D geometries.


						var rootItem = doc.getRoot();
						var geometryItems = [];
						//check 3d first
						geometryItems = rootItem.search({
							'type': 'geometry',
							'role': '3d'
						});
						//no 3d geometry, check 2d
						if (geometryItems.length == 0) {
							geometryItems = rootItem.search({
								'type': 'geometry',
								'role': '2d'
							});
						}
			            if (geometryItems.length === 0) {
			                FR.log('Document contains no geometries.');
			                return;
			            }
			            // Choose any of the avialable geometries
			            var initGeom = geometryItems[0];

			            // Create Viewer instance
			            var viewerDiv = document.getElementById('viewer');
			            var config = {
			                extensions: initGeom.extensions() || []
			            };
			            FR.viewer = new Autodesk.Viewing.Private.GuiViewer3D(viewerDiv, config);

			            // Load the chosen geometry
			            var svfUrl = doc.getViewablePath(initGeom);
			            var modelOptions = {
			                sharedPropertyDbPath: doc.getPropertyDbPath()
			            };
			            FR.viewer.start(svfUrl, modelOptions,
				            function (model) {//onLoadModelSuccess
					        },
				            function (viewerErrorCode) {//onLoadModelError
					           FR.log('Model Loader Error:' + viewerErrorCode);
					        });
					},
					function (viewerErrorCode) {// onDocumentLoadFailure
						FR.log("Document Load Error: " + viewerErrorCode);
					}
				);
			}
		);
	}
};
Ext.onReady(FR.init, FR);