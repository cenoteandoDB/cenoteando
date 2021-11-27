<?php
namespace FileRun;
use FileRun\Files\Actions\Read;
use FileRun\Files\Actions\Alter;
use FileRun\Files\Actions\Thumbnail;

$fromRelativePath = \S::fromHTML($_REQUEST['from_path']);
$toRelativePath = \S::fromHTML($_REQUEST['to_path']);


$targetData = Alter\Prepare::prepare($toRelativePath);
if (!$targetData) {
	jsonFeedback(false, Alter\Prepare::getError()['public']);
}
if ($targetData['folder'] !== false) {
	jsonFeedback(false, 'The target path is not a file!');
}

$sourceData = Read\Prepare::prepare($fromRelativePath, 'file');
if (!$sourceData) {
	jsonFeedback(false, Read\Prepare::getError()['public']);
}

$fileName = \FM::basename($sourceData['fullPath']);
$ext = \FM::getExtension($fileName);

if (!Thumbs\Utils::isWebSafe($ext)) {
	jsonFeedback(false, 'The source file is not of an appropriate type!');
}

$opts = Thumbnail::prepareDefaultOpts([]);
$thumbCacheFilePath = Thumbs\Cache::getThumbPath([
	'fullPath' => $targetData['fullPath'],
	'fileSize' => \FM::getFileSize($targetData['fullPath'])
], $opts);

$thumbCachePathParent = \FM::dirname($thumbCacheFilePath);
if (!is_dir($thumbCachePathParent)) {
	\FM::createPath($thumbCachePathParent);
}

if (is_file($thumbCacheFilePath)) {
	\FM::deleteFile($thumbCacheFilePath);
}

$rs = \FM::move($sourceData['fullPath'], $thumbCacheFilePath);

if (!$rs) {
	jsonFeedback(false, Lang::t('Failed to copy file %1', false, [$sourceData['relativePath']]));
}

jsonFeedback(true, 'The thumbnail was successfully set.');
