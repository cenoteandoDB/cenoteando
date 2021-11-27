<?php
$fileTypes = require '../../system/data/filetypes.php';
$ext = strtolower($_GET['ext']);
$theme = $_GET['theme'];

if (!in_array($theme, ['blank', 'blue', 'dark', 'green', 'red'])) {
	if ($theme == 'drive') {
		$theme = 'blue';
	} else if ($theme == 'one') {
		$theme = 'blank';
	} else if ($theme == 'zoho') {
		$theme = 'green';
	} else {
		$theme = 'blue';
	}
}

if (array_key_exists($ext, $fileTypes)) {
	$typeInfo = $fileTypes[$ext];
} else {
	$typeInfo = reset($fileTypes);
}
$filename = $typeInfo[3];
if (!$filename) {
	$filename = 'generic.png';
}
header ('HTTP/1.1 301 Moved Permanently');
header('Location: '.$theme.'/'.$filename);