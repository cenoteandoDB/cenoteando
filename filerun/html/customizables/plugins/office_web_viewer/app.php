<?php
use \FileRun\WebLinks;

class custom_office_web_viewer extends \FileRun\Files\Plugin {

	public $weblinksCompatible = true;
	public $online = true;
	static $localeSection = "Custom Actions: Office Web Viewer";
	static $publicMethods = ['thumb'];

	function init() {
		$this->JSconfig = [
			"title" => self::t("Office Web Viewer"),
			"icon" => 'images/icons/office.png',
			"extensions" => [
				"doc", "docx", "docm", "dotm", "dotx",
				"xls", "xlsx", "xlsb", "xls", "xlsm",
				"ppt", "pptx", "ppsx", "pps", "pptm", "potm", "ppam", "potx", "ppsm"
			],
			"popup" => true,
			"requiredUserPerms" => ["preview"],
			"requires" => ["preview"]
		];
	}
	function run() {
		if ($this->isLimitedPreview()) {
			$this->centeredThumb();
			return;
		}
		if ($this->data['weblink']) {
			$url = $this->data['weblink']['download_url'];
		} else {
			$weblinkInfo = WebLinks::createForService($this->data);
			if (!$weblinkInfo) {
				self::outputError('Failed to setup weblink', 'html');
			}
			$version = $this->data['version'] ?: false;
			$url = WebLinks::getURL([
				'id_rnd' => $weblinkInfo['id_rnd'],
				'download' => 1,
				'version' => $version
			]);
		}
		$this->logAction();
		$url = 'https://view.officeapps.live.com/op/embed.aspx?src='.urlencode($url);
		self::iframe($url, $this->data['fileName']);
	}
}