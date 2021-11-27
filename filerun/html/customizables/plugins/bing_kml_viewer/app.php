<?php
use \FileRun\WebLinks;

class custom_bing_kml_viewer extends \FileRun\Files\Plugin {

	public $weblinksCompatible = true;
	public $online = true;
	static $localeSection = 'Custom Actions: Bing Maps';

	function init() {
		$this->settings = [
			[
				'key' => 'APIKey',
				'title' => self::t('Bing Maps API Key'),
				'comment' => '<a href="https://msdn.microsoft.com/en-us/library/ff428642.aspx" target="_blank">Getting a Bing Maps Key</a>'
			]
		];
		$this->JSconfig = [
			"title" => self::t("Bing Maps"),
			'icon' => 'images/icons/bing.png',
			"extensions" => ["xml", "kmz", "gpx"],
			"popup" => true,
			"requiredUserPerms" => ["download"],
			"requires" => ["download"]
		];
	}

	function isDisabled() {
		return (strlen(self::getSetting('APIKey')) == 0);
	}

	function run() {
		if ($this->data['weblink']) {
			$url = $this->data['weblink']['download_url'];
		} else {
			$url = WebLinks::getOneTimeDownloadLink($this->data['fullPath'], $this->data['shareInfo']['id']);
			if (!$url) {exit("Failed to setup weblink");}
		}
		$this->logAction();
		require $this->path."/display.php";
	}
}