<?php

class custom_audio_player extends \FileRun\Files\Plugin {

	public $weblinksCompatible = true;
	static $localeSection = "Custom Actions: Audio Player";
	static $publicMethods = ['stream', 'thumb'];

	function init() {
		$this->JSconfig = [
			"title" => self::t("Audio Player"),
			'iconCls' => 'fa fa-fw fa-music',
			'useWith' => ['mp3'],
			"popup" => true,
			"requires" => ["download"]
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
		if ($this->isLimitedPreview() && !$this->getSetting('allow_without_download')) {
			$this->centeredThumb();
			return;
		}
		require $this->path . "/display.php";
	}

	function stream() {
		/*ffmpeg -i input.wav -acodec libmp3lame -b:a 128k output.mp3*/
		$this->streamFileForPreview();
	}
}