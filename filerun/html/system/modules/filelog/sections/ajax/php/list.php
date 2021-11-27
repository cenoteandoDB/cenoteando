<?php
namespace FileRun;
Lang::setSection("Files Activity Log");
\FileRun::blockIfFree();
if ($settings->disable_file_history) {
	jsonFeedback(false, 'The file activity logs are disabled.');
}

if (!Perms::check('file_history')) {
	jsonFeedback(false, 'You are not allowed to access the files activity logs.');
}

$relativePath = \S::fromHTML($_REQUEST['path']);
$limit = \S::fromHTML($_REQUEST['limit']);
if (!$limit) {$limit = 30;}
$start = \S::fromHTML($_REQUEST['start']);
if (!$start) {$start = 0;}

if (!Files\Utils::isCleanPath($relativePath)) {
	jsonFeedback(false, 'Invalid path!');
}

$isSharedPath = Files\Utils::isSharedPath($relativePath);

if (!$config['app']['filelog']['enable_for_shares']) {
	if ($isSharedPath) {
		jsonFeedback(false, 'You are allowed to check only the activity logs of the files available in your user\'s home folder!');
	}
}

if (!$isSharedPath) {
	if (!Perms::getHomeFolder()) {
		jsonFeedback(false, "Invalid path!");
	}
}

$filePath = Files\Manager::getAbsolutePath($relativePath);

if (!file_exists($filePath)) {
	jsonFeedback(false, "The selected file is no longer available!");
}

$pid = Paths::getId($filePath, true);
if (!$pid) {exit('Missing path id');}

$d = Files\Log::getTable();
$list = $d->select('*',
	['pid', '=',  $d->q($pid)],
	["id" => "DESC"],
	$limit,
	$start,
	true
);

$app['records'] = [];
$totalCount = $db->GetOne("SELECT FOUND_ROWS()");

foreach ($list as $r) {
	$name = Users::getNameById($r['uid']);

	$details = json_decode($r['data'], 1);
	$detailsTemplateFile = $GLOBALS['section_path']."/php/details/".$r['action'].".php";
	ob_start();
	if (file_exists($detailsTemplateFile)) {
		include $detailsTemplateFile;
	}
	$d = ob_get_clean();

	$actionName = Lang::t(Files\Logging\Utils::getActionName($r['action']), 'Files Activity Log');
	if (!$actionName) {$actionName = $r['action'];}

	$app['records'][] = [
		'date' => $r['date'],
		'uid' => $r['uid'],
		'fullName' => \S::safeForHtml($name),
		'action' => \S::forHTML($actionName),
		'details' => $d
	];
}

jsonOutput(["records" => $app['records'], "totalCount" => $totalCount]);