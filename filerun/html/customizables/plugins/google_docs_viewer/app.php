<?php
use \FileRun\WebLinks;

class custom_google_docs_viewer extends \FileRun\Files\Plugin {

	public $weblinksCompatible = true;
	public $online = true;
	static $localeSection = "Custom Actions: Google Docs Viewer";
	static $publicMethods = ['thumb'];

	function init() {
		$this->JSconfig = [
			"title" => self::t("Google Docs Viewer"),
			'icon' => 'images/icons/gdocs.png',
			"extensions" => [
				"pdf", "ppt", "pptx", "doc", "docx", "xls", "xlsx", "dxf", "ps", "eps", "xps",
				"psd", "tif", "tiff", "bmp", "svg",
				"pages", "ai", "dxf", "ttf"
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
			$url = WebLinks::getOneTimeDownloadLink($this->data['fullPath'], $this->data['shareInfo']['id']);
			if (!$url) {
				exit("Failed to setup weblink");
			}
		}
		$this->logAction();
		$url = 'https://docs.google.com/viewer?url='.urlencode($url).'&embedded=true';
		self::iframe($url, $this->data['fileName']);
	}
}