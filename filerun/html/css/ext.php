<?php
if (extension_loaded("zlib") && (ini_get("output_handler") != "ob_gzhandler")) {
	ini_set("zlib.output_compression", 1);
}
header("Content-Type: text/css; charset=UTF-8");
header("X-Content-Type-Options: nosniff");
header("Cache-Control: public");
header("Pragma: cache");
header("Expires: " . gmdate ("D, d M Y H:i:s", time() + 31356000) . " GMT");

if (isset($_GET['oauth2'])) {
	$files = [
		'roboto/load.css',
		'normalize.css',
		'skeleton.css',
		'oauth2.css'
	];
	foreach ($files as $key => $file) {
		readfile($file);
		echo "\n";
	}
	exit();
}


$files = [
	'style.css',
	'roboto/load.css',
	'font-awesome/css/font-awesome.min.css',
	'ext-all.css',
	'ext-ux/SuperBoxSelect.css',
	'ext-ux/ProgressColumn.css',
	'login.css',
	'ui/various.css',
	'ui/header_toolbar.css',
	'ui/tree.css',
	'ui/grid.css',
	'ui/details_panel.css',
	'ui/comments_panel.css',
	'ui/download_cart.css',
	'ui/activity_panel.css',
	'ui/image_viewer.css',
	'ui/target_selector.css',
	'ui/mobile.css',
];

foreach ($files as $key => $file) {
	readfile($file);
	echo "\n";
}

if (isset($_GET['cpanel'])) {
	readfile('cpanel.css');
	readfile('ext-ux/StatusBar.css');
}

if (isset($_GET['theme'])) {
	$theme = $_GET['theme'];
	if ($theme == 'dark') {
		readfile('theme_dark.css');
	} else  {
		if ($theme == 'blue' || $theme == 'drive') {
			$replaceColors = [
				'main' => '#4285F4',
				'light' => '#78A9F7',
				'lighter' => '#E8F0FE',
				'dark' => '#1967D2'
			];
		} else if ($theme == 'one') {
			$replaceColors = [
				'main' => '#0078D4',
				'light' => '#78A9F7',
				'lighter' => '#E8F0FE',
				'dark' => '#1967D2'
			];
		} else if ($theme == 'red') {
			$replaceColors = [
				'main' => '#C0392B',
				'light' => '#E74C3C',
				'lighter' => '#FFE6E6',
				'dark' => '#DC2F1A'
			];
		} else if ($theme == 'green') {
			$replaceColors = [
				'main' => '#0F9D58',
				'light' => '#2e7d32',
				'lighter' => '#c0eabf',
				'dark' => '#0F9D58'
			];
		} else if ($theme == 'zoho') {
			$replaceColors = [
				'main' => '#28B294',
				'light' => '#2e7d32',
				'lighter' => '#28B294',
				'dark' => '#0F9D58'
			];
		}
		if ($replaceColors) {
			$themeCode = file_get_contents('theme_template.css');
			$colors = [
				'main' => '[MAIN]',
				'light' => '[LIGHT]',
				'lighter' => '[LIGHTER]',
				'dark' => '[DARK]'
			];
			foreach ($colors as $key => $color) {
				$themeCode = str_replace($color, $replaceColors[$key], $themeCode);
			}
			echo $themeCode;
		}

		if ($theme == 'drive') {
			readfile('theme_drive.css');
		} else if ($theme == 'one') {
			readfile('theme_one.css');
		} else if ($theme == 'zoho') {
			readfile('theme_zoho.css');
		}
	}

	if (isset($_GET['custom'])) {
		$filePath = '../customizables/theme.css';
		if (is_file($filePath)) {
			echo "\r\n";
			readfile($filePath);
		}
	}
}
