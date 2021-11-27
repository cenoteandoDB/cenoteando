<?php
use \FileRun\Files\Plugin;
use \FileRun\Preview\Cache;

class custom_libreoffice_viewer extends Plugin {

	public $weblinksCompatible = true;
	static $localeSection = 'Custom Actions: LibreOffice Viewer';
	static $publicMethods = ['display', 'thumb'];

	function init() {
		$this->description = self::t('Generates PDF previews for various office file types.').'<br>'.self::t('Requires LibreOffice support to be enabled under the "Thumbnails and previews" settings.');
		$this->JSconfig = [
			'title' => self::t('LibreOffice Viewer'),
			'icon' => 'images/icons/libreoffice.png',
			'useWith' => ['office', 'ooffice'],
			'requiredUserPerms' => ['preview'],
			'requires' => ['preview'],
			'popup' => true,
			'externalPopupForMobile' => true,
			'loadingMsg' => self::t('Generating preview..')
		];
		$this->settings = [
			[
				'key' => 'allow_without_download',
				'title' => self::t('Allow previewing without download permission'),
				'type' => 'checkbox',
				'helpText' => self::t('Use this option only if your documents are not confidential.')
			]
		];
	}

	function isDisabled() {
		global $settings;
		return !$settings->thumbnails_libreoffice || $settings->thumbnails_libreoffice_path == '';
	}

	function run() {
		global $settings;
		if ($this->isLimitedPreview() && !$this->getSetting('allow_without_download')) {
			$this->centeredThumb();
			return;
		}
		$cacheSubFolderPath = Cache::getCacheSubFolderPath($this->data);
		$cacheFilePath = Cache::getCacheFilePath($this->data);
		if (!is_file($cacheFilePath)) {
			$cmd = $settings->thumbnails_libreoffice_path.' --headless --nologo --nofirststartwizard --norestore --convert-to pdf "'.$this->data['fullPath'].'"';
			$cmd .= ' --outdir "'.$cacheSubFolderPath.'"';
			$return_text = [];
			$return_code = 0;
			exec($cmd, $return_text, $return_code);
			if ($return_code != 0) {
				self::outputError('A preview could not be generated for this file!', 'html');
			}
			$resultedFilePath = gluePath($cacheSubFolderPath, \FM::replaceExtension(\FM::basename($this->data['fullPath']), 'pdf'));
			clearstatcache();
			if (!is_file($resultedFilePath)) {
				self::outputError('Preview generation failed! Output file not found.', 'html');
			}
			if (!\FM::rename($resultedFilePath, Cache::$staticFileName)) {
				self::outputError('Preview generation failed! Failed to rename output file.', 'html');
			}
		}
		$URL = $this->actionURL.'&method=display';
		$limitedPreview = $this->isLimitedPreview();
		if ($limitedPreview) {
			$URL .= '#toolbar=0';
		}
		$isMobile = \S::fromHTML($_REQUEST['mobile']);
		if ($isMobile) {
			require $this->path.'/mobile_display.php';
			exit();
		}
		if ($limitedPreview) {
			self::iframe($URL);
			exit();
		}
		$this->display($this->data, $cacheFilePath);
	}

	function display($fileData = false, $cacheFilePath = false) {
		if (!$fileData) {
			$fileData = $this->prepareReadForPreview();
			$cacheFilePath = Cache::getCacheFilePath($fileData);
		}
		$this->logAction();

		Cache::outputCache($fileData, $cacheFilePath);
	}


}