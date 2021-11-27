<?php
use \FileRun\WebLinks;

class custom_kml_viewer extends \FileRun\Files\Plugin {

	public $weblinksCompatible = true;
	public $online = true;
	static $localeSection = 'Custom Actions: Google Maps';

	function init() {
		$this->settings = [
			[
				'key' => 'APIKey',
				'title' => self::t('Google Maps JavaScript API Key'),
				'comment' => \FileRun\Lang::t('Get it from %1', 'Admin', ['<a href="https://developers.google.com/maps/documentation/javascript/get-api-key" target="_blank">Google Maps APIs</a>'])
			]
		];
		$this->JSconfig = [
			"title" => self::t('Google Maps'),
			'icon' => 'images/icons/gmaps.png',
			"extensions" => ["kml", "kmz", "xml"],
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
			$weblinkInfo = WebLinks::createForService($this->data);
			if (!$weblinkInfo) {
				exit("Failed to setup weblink");
			}
			$url = WebLinks::getURL([
				"id_rnd" => $weblinkInfo['id_rnd'],
				"filename" => $this->data['fileName']
			]);
			if (!$url) {exit("Failed to setup weblink");}
		}
		$this->logAction();
		require $this->path."/display.php";
	}
}