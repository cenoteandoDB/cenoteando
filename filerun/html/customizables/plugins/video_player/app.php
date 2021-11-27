<?php

class custom_video_player extends \FileRun\Files\Plugin {

	public $weblinksCompatible = true;
	static $localeSection = 'Custom Actions: Video Player';
	static $publicMethods = ['openInBrowser', 'stream', 'thumb'];

	function init() {
		$this->JSconfig = [
			'title' => self::t('Video Player'),
			'iconCls' => 'fa fa-fw fa-play-circle-o',
			'useWith' => ['wvideo'],
			'popup' => true,
			'requires' => ['download']
		];
		$this->settings = [
			[
				'key' => 'allow_without_download',
				'title' => self::t('Allow playback without download permission'),
				'type' => 'checkbox',
				'helpText' => self::t('Use this option only if your files are not confidential.')
			]
		];
	}

	function run() {
		global $config;
		$ext = \FM::getExtension($this->data['fileName']);
		$handlers = [
			'm4v' => 'html5',
			'mpg' => 'mpg',
			'wmv' => 'wmv',
			'mov' => 'html5',
			'ogv' => 'html5',
			'mp4' => 'html5',
			'mkv' => 'html5',
			'webm' => 'html5'
		];
		$handle = $handlers[$ext];

		if (!$handle) {
			self::outputError('The file type is not supported by this player.', 'html');
		}
		if ($this->isLimitedPreview() && !$this->getSetting('allow_without_download')) {
			$this->centeredThumb();
			return;
		} else {
			if ($this->data['weblink']) {
				$URL = $this->data['weblink']['base_url'] . '&method=stream';
			} else {
				if ($handle == 'wmv') {
					$rs = \FileRun\WebLinks::createForService($this->data, 5);
					$URL = \FileRun\WebLinks::getURL([
							'id_rnd' => $rs['id_rnd'],
							'filename' => $this->data['fileName'],
							'password' => $rs['password']
						]
					);
				} else {
					$URL = $config['url']['root'] . '/?module=custom_actions&action=video_player&method=stream&path=' . \S::forURL($this->data['relativePath']);
				}
			}
			require gluePath($this->path, $handle, 'display.php');
		}
		return false;
	}

	function stream() {
		$this->streamFileForPreview();
	}
}