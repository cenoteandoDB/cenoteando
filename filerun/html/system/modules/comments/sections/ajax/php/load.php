<?php
namespace FileRun;
use FileRun\Files\Actions\Comments;
Lang::setSection("File Comments");

$relativePath = \S::fromHTML($_REQUEST['path']);
$itemInfo = Comments\Prepare::prepareRead($relativePath);
if (!$itemInfo) {
	jsonOutput([
		'comments' => 0,
		'totalCount' => 0,
		'path' => $relativePath,
		'error' => Lang::t(Comments\Prepare::getError()['public'])
	]);
}

$uid = $itemInfo['onlyOwn'] ? $auth->currentUserInfo['id'] : false;

$app['comments'] = [];
$count = 0;
$rs = \FileRun\Comments::get($itemInfo['fullPath'], $uid);
$lastUid = false;
$lastTime = false;
$lastTimer = false;
foreach ($rs as $comment) {
	$count++;
	$r = [
		'id' => $comment['id'],
		'date_added' => $comment['date_added'],
		'uid' => $comment['uid'],
		'val' => \FileRun\Comments::forHTML($comment['val'])
	];
	$timeUnix = Utils\Date::MySQLDateToUnix($comment['date_added']);
	$timer = Utils\Date::localizedDateDiffString($timeUnix);
	if (!$timer) {
		if (time() > $timeUnix+300) {
			$timer = Utils\Date::getShort($comment['date_added'], false);
		}
	}
	if ($timer) {
		if ($lastTime) {
			if ($timeUnix > $lastTime + 300) {
				if ($timer != $lastTimer) {
					$r['timer'] = $timer;
				}
			}
		} else {
			$r['timer'] = $timer;
		}
	}
	if ($comment['uid'] == $auth->currentUserInfo['id']) {
		$r['fullName'] = Users::formatFullName($auth->currentUserInfo);
	} else {
		$r['fullName'] = Users::getNameById($comment['uid']);
	}
	$r['fullName'] = \S::safeForHtml($r['fullName']);
	if ($comment['uid'] == $auth->currentUserInfo['id']) {
		$r['self'] = 1;
	}
	if ($comment['uid'] == $lastUid) {
		$r['followup'] = 1;
	}
	$app['comments'][] = $r;
	$lastUid = $comment['uid'];
	$lastTime = $timeUnix;
	$lastTimer = $timer;
}
$response = ["comments" => $app['comments'], "totalCount" => $count, 'path' => $relativePath];
jsonOutput($response);