var FR = {
	onSavePNG: false,
	init: function() {
		Ext.fly('loadMsg').fadeOut();
		var tbar = false;
		if (FR.vars.userCanUpload) {
			tbar =  [
				{
					text: FR.T('Save as PNG'), cls: 'fr-btn-primary',
					style: 'margin-left:5px;',
					handler: function(){this.savePNG();}, scope: this
				}/*,
				{
					text: FR.T('Set thumbnail'), cls: 'fr-btn-primary',
					handler: function() {
						FR.onSavePNG = FR.setThumbnail;
						this.savePNG();
					}, scope: this
				}*/
			];
		}
		this.viewport = new Ext.Viewport({
			layout: 'fit',
			items: {
				layout: 'fit',
				tbar: tbar,
				listeners: {
					'resize': function() {
						if (!this.ct) {return false;}
						this.ctSize = this.ct.getSize();
						this.camera.aspect = this.ctSize.width / this.ctSize.height;
						this.camera.updateProjectionMatrix();
						this.renderer.setSize(this.ctSize.width, this.ctSize.height);
					}, scope: this
				}
			},
			listeners: {
				'afterrender': function(vp) {
					this.ct = vp.items.first().body;
					this.ctSize = this.ct.getSize();

					this.initRenderer();
					this.initScene();
					this.initCamera();
					this.loadModel();

					this.clock = new THREE.Clock();
					this.animate();
				}, scope: this
			}
		});
	},

	initRenderer: function() {
		this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
		this.renderer.shadowMap.enabled = true;
		this.renderer.setClearColor(0x000000, 0);
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(this.ctSize.width, this.ctSize.height);
		this.ct.appendChild(this.renderer.domElement);
	},

	initCamera: function() {
		this.camera = new THREE.PerspectiveCamera(15, this.ctSize.width / this.ctSize.height, 1, 10000);
		this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
		this.controls.screenSpacePanning = true;

		this.camera.add(new THREE.PointLight(0xffffff, 0.5));
		this.scene.add(this.camera);

		this.camera.position.set(0, 100, 250);
		this.controls.target.set(0, 100, 0);
	},

	initScene: function() {
		this.scene = new THREE.Scene();
		this.scene.add(new THREE.AmbientLight(0xffffff, (this.vars.fileExtension == 'obj') ? 0.4 : 0.6));
	},

	render: function() {
		this.renderer.render(this.scene, this.camera);
		if (this.mixer) {
			this.mixer.update(this.clock.getDelta());
		}
	},

	animate: function() {
		window.requestAnimationFrame(FR.animate);
		FR.render();
	},

	onDownloadProgress: function(xhr) {
		if (xhr.lengthComputable) {
			var progress = xhr.loaded / xhr.total;
			var percentComplete = Math.round(progress * 100);
			FR.pbar.updateProgress(progress, percentComplete + '%');
		}
	},

	onModelLoad: function() {
		this.pbar.reset().updateText();
		this.loadingWindow.setTitle(FR.T('Rendering model..'));
	},

	onLoadError: function(er) {
		Ext.getBody().mask(FR.T('Failed to load model'));
	},

	addObject: function(object) {
		FR.scene.add(object);
		var box = new THREE.Box3().setFromObject(object);

		var _v = box.getSize(new THREE.Vector3());
		var size = Math.max(_v.x, _v.y, _v.z);
		box.getCenter(this.controls.target);

		//opposite over base, gives you the field of view, convert to degrees, and zoom out by a tiny bit
		this.camera.fov = 1.1 * Math.tan(size / this.camera.position.z) * 180/Math.PI;
		this.camera.updateProjectionMatrix();

		this.controls.maxDistance = this.camera.position.z * 3;
		this.controls.minDistance = this.camera.position.z / 2;
		this.controls.update();
	},

	loadModel: function() {

		this.pbar = new Ext.ProgressBar();
		this.loadingWindow = new Ext.Window({
			title: FR.T('Loading file..'), width: 250, modal: true,
			closable: false, draggable: false, closeAction: 'hide',
			items: this.pbar
		});
		this.loadingWindow.show();

		this.loadingManager = new THREE.LoadingManager();
		this.loadingManager.setURLModifier(function (url) {
	        return url.replace('/./', '/');
	    });
		this.loadingManager.onProgress = function (item, loaded, total) {
			FR.loadingWindow.setTitle(FR.T('Loading resources..'));
			FR.pbar.updateProgress(loaded/total, loaded+'/'+total);
		};
        this.loadingManager.onLoad = function() {
        	FR.loadingWindow.hide();
		};

		if (this.vars.fileExtension == 'obj') {
			this.loadModelOBJ();
		} else if (this.vars.fileExtension == 'mtl') {
			this.loadModelMTL();
		} else if (this.vars.fileExtension == 'stl') {
			this.loadModelSTL();
		} else if (this.vars.fileExtension == 'fbx') {
			this.loadModelFBX();
		} else if (this.vars.fileExtension == 'dae') {
			this.loadModelDAE();
		} else if (this.vars.fileExtension == 'x') {
			this.loadModelX();
		} else if (this.vars.fileExtension == 'gltf' || this.vars.fileExtension == 'glb') {
			this.loadModelGLTF();
		} else if (this.vars.fileExtension == '3ds') {
			this.loadModel3DS();
		} else if (this.vars.fileExtension == '3mf') {
			this.loadModel3MF();
		} else {
			Ext.getBody().mask(FR.T('This file format cannot be handled.'));
		}
	},

	loadModelOBJ: function(opts) {
		var loader = new THREE.OBJLoader(this.loadingManager);
		var fileDownloadURL = this.vars.downloadBaseURL;
		if (this.vars.filePath) {
			fileDownloadURL += '&path=' + encodeURIComponent(this.vars.filePath);
		}
		if (opts) {
			if (opts.url) {
				fileDownloadURL = opts.url
			}
			if (opts.materials) {
				loader.setMaterials(opts.materials);
			}
		}
		loader.load(
			fileDownloadURL,
			function(obj) {
				FR.onModelLoad();
				FR.addObject(obj);
			},
			this.onDownloadProgress,
			this.onLoadError
		);
	},

	loadModelMTL: function() {
		THREE.Loader.Handlers.add( /\.dds$/i, new THREE.DDSLoader() );
		var loader = new THREE.MTLLoader(this.loadingManager);
		loader.setResourcePath(this.vars.downloadBaseURL+'&path='+this.vars.folderPath+'/');
		loader.load(
			this.vars.downloadBaseURL+'&path='+encodeURIComponent(this.vars.filePath),
			(function (materials) {
				materials.preload();
				this.loadModelOBJ({
					url: this.vars.downloadBaseURL+'&path='+encodeURIComponent(this.vars.filePathOBJ),
					materials: materials
				})
			}).bind(this)
		);
	},

	loadModelSTL: function() {
		var loader = new THREE.STLLoader(this.loadingManager);
		var fileDownloadURL = this.vars.downloadBaseURL+'&path='+encodeURIComponent(this.vars.filePath);
		loader.load(
			fileDownloadURL,
			function(geometry) {
				FR.onModelLoad();
				var materialProps = {color: 0x5185F3, specular: 0x111111, shininess: 100};
				if (geometry.hasColors ) {
					materialProps.opacity = geometry.alpha;
					materialProps.vertexColors = THREE.VertexColors;
				}
				var material = new THREE.MeshPhongMaterial(materialProps);
				var mesh = new THREE.Mesh(geometry, material);
				mesh.position.set(0, -0.25, 0.6);
				mesh.rotation.set(0, -Math.PI/2, 0);
				mesh.scale.set(0.5, 0.5, 0.5);
				mesh.castShadow = true;
				mesh.receiveShadow = true;
				FR.addObject(mesh);
			},
			this.onDownloadProgress,
			this.onLoadError
		);
	},

	loadModelFBX: function() {
		var loader = new THREE.FBXLoader(this.loadingManager);
		var fileDownloadURL = this.vars.downloadBaseURL+'&path='+encodeURIComponent(this.vars.filePath);
		loader.setResourcePath(this.vars.downloadBaseURL+'&path='+this.vars.folderPath+'/');
		loader.load(
			fileDownloadURL,
			function(group) {
				FR.onModelLoad();
				if (group.animations && group.animations[0]) {
					FR.mixer = new THREE.AnimationMixer(group);
					FR.mixer.clipAction(group.animations[0]).play();
				}
				group.traverse(function(child) {
					if (child.isMesh) {
						child.castShadow = true;
						child.receiveShadow = true;
					}
				});
				FR.addObject(group);
			},
			this.onDownloadProgress,
			this.onLoadError
		);
	},

	loadModelDAE: function() {
		var loader = new THREE.ColladaLoader(this.loadingManager);
		var fileDownloadURL = this.vars.downloadBaseURL+'&path='+encodeURIComponent(this.vars.filePath);
		loader.setResourcePath(this.vars.downloadBaseURL+'&path='+this.vars.folderPath+'/');
		loader.load(
			fileDownloadURL,
			function(obj) {
				FR.onModelLoad();
				FR.addObject(obj.scene);
			},
			this.onDownloadProgress,
			this.onLoadError
		);
	},

	loadModelX: function() {
		var loader = new THREE.XLoader(this.loadingManager);
		var fileDownloadURL = this.vars.downloadBaseURL+'&path='+encodeURIComponent(this.vars.filePath);
		loader.setResourcePath(this.vars.downloadBaseURL+'&path='+this.vars.folderPath+'/');
		loader.load(
			[fileDownloadURL],
			function(object) {
				FR.onModelLoad();
				for (var i = 0; i < object.models.length; i++) {
					var model = object.models[i];
					model.scale.x *= -1;
					FR.addObject(model);
				}
			},
			this.onDownloadProgress,
			this.onLoadError
		);
	},

	loadModelGLTF: function() {
		this.renderer.gammaOutput = true;
		this.renderer.gammaFactor = 2.2;
		var loader = new THREE.GLTFLoader(this.loadingManager);
		THREE.DRACOLoader.setDecoderPath(this.vars.pluginURL+'/three/libs/draco/');
		loader.setDRACOLoader(new THREE.DRACOLoader());
		var fileDownloadURL = this.vars.downloadBaseURL+'&path='+encodeURIComponent(this.vars.filePath);
		loader.setResourcePath(this.vars.downloadBaseURL+'&path='+this.vars.folderPath+'/');
		loader.load(
			fileDownloadURL,
			function(obj) {
				FR.onModelLoad();
				if (obj.animations && obj.animations[0]) {
					FR.mixer = new THREE.AnimationMixer(obj.scene);
					Ext.each(obj.animations, function(anim) {
						if (obj.scene.animationTime) {
                            anim.duration = obj.scene.animationTime;
                        }
						FR.mixer.clipAction(anim).play();
					});
				}
				FR.addObject(obj.scene);
			},
			this.onDownloadProgress,
			this.onLoadError
		);
	},

	loadModel3DS: function() {
		var loader = new THREE.TDSLoader(this.loadingManager);
		var fileDownloadURL = this.vars.downloadBaseURL+'&path='+encodeURIComponent(this.vars.filePath);
		loader.setResourcePath(this.vars.downloadBaseURL+'&path='+this.vars.folderPath+'/textures/');
		loader.load(
			fileDownloadURL,
			function(obj) {
				FR.onModelLoad();
				FR.addObject(obj);
			},
			this.onDownloadProgress,
			this.onLoadError
		);
	},

	loadModel3MF: function() {
		var loader = new THREE.ThreeMFLoader(this.loadingManager);
		var fileDownloadURL = this.vars.downloadBaseURL+'&path='+encodeURIComponent(this.vars.filePath);
		loader.load(
			fileDownloadURL,
			function(obj) {
				FR.onModelLoad();
				obj.quaternion.setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));// z-up conversion
				obj.traverse(function (child) {
					child.castShadow = true;
				});
				FR.addObject(obj);
			},
			this.onDownloadProgress,
			this.onLoadError
		);
	},

	savePNG: function() {
		this.renderer.render(this.scene, this.camera);
		this.loadingWindow.setTitle(FR.T('Getting image..'));
		this.pbar.reset().updateText();
		this.loadingWindow.show();
		this.renderer.domElement.toBlob(function(blob) {
			blob.fileName = FR.vars.fileNamePNG;
			var upload = new Flow({
				target: FR.vars.URLRoot+'/?module=fileman&section=do&page=up',
				chunkSize: FR.vars.UploadChunkSize, maxChunkRetries: 3, resumeLargerThan: 104857600,
				validateChunkResponse: function(status, message) {
					if (status != '200') {return 'retry';}
					try {var rs = Ext.decode(message);} catch (er){return 'retry';}
					if (rs) {if (rs.success) {return 'success';} else {return 'error';}}
				}, validateChunkResponseScope: this, startOnSubmit: true
			});
			upload.on('fileSuccess', function(f, sr) {
				FR.loadingWindow.hide();
				try {var rs = Ext.decode(sr);} catch (er){}
				if (rs && rs.msg) {
					if (FR.vars.windowId) {
						window.parent.FR.UI.feedback(rs.msg);
					} else {
						new Ext.ux.prompt({text: rs.msg});
					}
				}
				if (FR.onSavePNG) {FR.onSavePNG();}
				FR.onSavePNG = false;
			});
			upload.on('fileError', function(f, sr) {
				FR.loadingWindow.hide();
				try {var rs = Ext.decode(sr);} catch (er){}
				if (rs && rs.msg) {
					new Ext.ux.prompt({text: rs.msg});
				}
			});
			upload.on('progress', function(flow) {
				var progress = flow.getProgress();
				var percent = Math.floor(progress*100);
				FR.pbar.updateProgress(progress, percent+'%');
			});
			upload.on('uploadStart', function() {
				FR.loadingWindow.setTitle(FR.T('Uploading image..'));
			});
			upload.addFile(blob, false, {path: FR.vars.folderPath});

		}, 'image/png');
	}/*,

	setThumbnail: function() {
		this.loadingWindow.setTitle(FR.T('Setting thumbnail..'));
		this.pbar.reset().updateText();
		this.loadingWindow.show();
		Ext.Ajax.request({
			url: FR.vars.URLRoot+'/?module=fileman&section=do&page=set_thumb',
			method: 'post',
			params: {
				'from_path': FR.vars.folderPath+'/'+FR.vars.fileNamePNG,
				'to_path': FR.vars.filePath
			},
			callback: function(opts, succ, req) {
				FR.loadingWindow.hide();
				try {
					var rs = Ext.decode(req.responseText);
				} catch (er){return false;}
				if (rs && rs.msg) {
					if (FR.vars.windowId) {
						window.parent.FR.UI.feedback(rs.msg);
					} else {
						new Ext.ux.prompt({text: rs.msg});
					}
				}
			}
		});
	}*/

};
Ext.onReady(function() {FR.init();});