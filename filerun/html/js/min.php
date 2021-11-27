<?php
chdir(dirname(__FILE__, 2));
if (isset($_GET['cpanel'])) {
	$files = [
		'ext/ux/ScriptLoader.js',
		'cpanel/app.js',
		'cpanel/tree.js',
		'cpanel/grid.js',
		'cpanel/layout.js',
		'fileman/user_chooser.js',
		'cpanel/userslist.comp.js',
		'cpanel/editform.comp.js',
		'genpass.js',
		'ext/ux/StatusBar.js',
		'flow/all.min.js'
	];
} else if (isset($_GET['extjs'])) {
	if (isset($_GET['debug'])) {
		$files = [
			'ext/_ext-base-debug.js',
			'ext/_ext-all-debug-w-comments.js'
		];
	} else {
		$files = [
			'ext/ext-base.js',
			'ext/ext-all.js'
		];
	}
	$files[] = 'ext/ux/LocalStorage.js';
	$files[] = 'ext/ux/FileRunPrompt.js';
} else if (isset($_GET['flow'])) {
/*
		$files[] = 'flow/_flow.js';
		$files[] = 'flow/_flowfile.js';
		$files[] = 'flow/_flowchunk.js';
*/
	$files[] = 'flow/all.min.js';
} else {
	$files = [
		'ext/ux/overrides.js',
		'ext/ux/ProgressColumn.js',
		'ext/ux/GridDragSelector.js',
		'ext/ux/SuperBoxSelect.min.js',
		'ext/ux/TagsField.js',
		'ext/ux/StarField.js',
		'ext/ux/ListPanel.js',
		'ext/ux/NavBar.js',
		'ext/ux/TargetSelector.js',
		'fileman/filerun.js',
		'fileman/toolbars_and_menus.js',
		'fileman/grid/column_model.js',
		'fileman/grid/view.js',
		'fileman/grid/store.js',
		'fileman/grid/panel.js',
		'fileman/tree_node_ui.js',
		'fileman/tree.js',
		'fileman/infopanel/info_panel.js',
		'fileman/infopanel/details_panel.js',
		'fileman/infopanel/activity_panel.js',
		'fileman/infopanel/comments_panel.js',
		'fileman/download_cart.js',
		'fileman/audio_player.js',
		'fileman/layout.js',
		'fileman/ui_utils.js',
		'fileman/searchbox.js',
		'fileman/actions.js',
		'fileman/image_viewer.js',
		'ext/ux/uploadPanel.js',

		//'flow/_flow.js',
		//'flow/_flowfile.js',
		//'flow/_flowchunk.js'
		'flow/all.min.js'
	];
}


if (extension_loaded("zlib") && (ini_get("output_handler") != "ob_gzhandler")) {
	ini_set("zlib.output_compression", 1);
}

header("Content-Type: application/javascript; charset=UTF-8");
header("Cache-control: public");
header("Pragma: cache");
header("Expires: " . gmdate ("D, d M Y H:i:s", time() + 31356000) . " GMT");

foreach ($files as $key => $file) {
	readfile('js/'.$file);
	echo "\r\n";
}