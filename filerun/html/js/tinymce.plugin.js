tinymce.PluginManager.add("filerun", function(editor) {

	function filerun_onMessage(event) {
		if(editor.settings.external_plugins.filerun.toLowerCase().indexOf(event.origin.toLowerCase()) === 0){
			if(event.data.sender === 'FileRun'){
				tinymce.activeEditor.insertContent(event.data.html);
				tinymce.activeEditor.windowManager.close();
				window.removeEventListener('message', filerun_onMessage, false);
			}
		}
	}

	function openFileRun() {
		var settings = editor.settings.filerun;
		var width = window.innerWidth - 20;
		var height = window.innerHeight - 40;
		if (width > 1800) {width = 1800;}
		if (height > 1200) {height = 1200;}
		if (width > 600) {
			var width_reduce = (width - 20) % 138;
			width = width - width_reduce + 10;
		}
		window.addEventListener("message", filerun_onMessage, false);
		var url = editor.settings.external_plugins.filerun.replace('js/tinymce.plugin.js', '?picker=tinymce_filepicker');
		url += settings.folderPath || '#/HOME';
		if (settings.searchFor) {
			url += '?'+encodeURIComponent(JSON.stringify(settings.searchFor));
		}
		editor.windowManager.open({
			title: settings.windowTitle || "FileRun",
			file: url,
			width: width, height: height,
			inline: true
		});
	}

	editor.addShortcut("Ctrl+E", "", openFileRun);

	editor.addMenuItem("filerun", {
		icon: "browse",
		text: editor.settings.filerun.buttonTitle || 'Insert file',
		shortcut: "Ctrl+E",
		onclick: openFileRun,
		context: "insert"
	});

	return {
		getMetadata: function () {
			return  {
				name: "FileRun",
				url: "https://filerun.com"
			};
		}
	};
});