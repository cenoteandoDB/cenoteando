<?php

class custom_image_editor extends \FileRun\Files\Plugin {

	public $weblinksCompatible = true;
	static $localeSection = 'Custom Actions: Image Editor';
	static $publicMethods = ['openInBrowser'];

	function init() {
		$this->JSconfig = [
			'title' => self::t('Image Editor'),
			'iconCls' => 'fa fa-fw fa-crop-alt icon-blue',
			'useWith' => ['img', 'img2', 'raw'],
			'popup' => true,
			'requiredUserPerms' => ['download', 'upload'],
			'requires' => ['download', 'alter']
		];
	}

	function run() {
		global $config;
		$typeInfo = \FM::fileTypeInfo($this->data['fileName']);
		if ($typeInfo['type'] == 'img') {
			$url = $this->actionURL.'&method=openInBrowser&noCache='.time();
		} else {
			if (!\FileRun\Thumbs\Utils::extCanHaveThumb($typeInfo['extension'])) {
				exit('Cannot convert file type to image.');
			}
			$url = $config['url']['root'].'/t.php?width=4000&height=4000&noIcon=true&p='.\S::forURL($this->data['relativePath']).'&noCache='.time();
		}
		if ($this->data['version']) {
			$url .= '&version='.\S::forURL($this->data['version']);
		}

		$chunkSize = \FileRun\Files\Utils::getUploadChunkSize();

		$originalExt = \FM::getExtension($this->data['fileName'], true);

		if (in_array($typeInfo['extension'], ['png', 'svg', 'gif', 'bmp'])) {
			$saveExtension = $typeInfo['extension'] == 'png' ? $originalExt : 'png';
			$saveMimeType = 'image/png';
		} else {
			$saveExtension = in_array($typeInfo['extension'], ['jpeg', 'jpg']) ? $originalExt : 'jpg';
			$saveMimeType = 'image/jpeg';
		}

		$vars = [
			'URLRoot' => $config['url']['root'],
			'originalFileName' => $this->data['fileName'],
			'saveFileName' => \FM::replaceExtension($this->data['fileName'], $saveExtension),
			'saveMimeType' => $saveMimeType,
			'folderPath' => \FM::dirname($this->data['relativePath']),
			'imageURL' => $url,
			//'saveURL' => $saveURL,
			'windowId' => $_REQUEST['_popup_id'],
			'UploadChunkSize' => $chunkSize
		];

		require $this->path."/display.php";
	}
}