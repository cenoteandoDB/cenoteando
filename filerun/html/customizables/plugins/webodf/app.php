<?php

class custom_webodf extends \FileRun\Files\Plugin {

	public $weblinksCompatible = true;
	static $localeSection = "Custom Actions: OpenDocument Viewer";
	static $publicMethods = ['openInBrowser', 'thumb'];

	function init() {
		$this->JSconfig = [
			"title" => self::t("OpenDocument Viewer"),
			'iconCls' => 'fa fa-fw fa-file-text-o',
			"extensions" => ["odt", "ods", "odp"],
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
		$url = $this->actionURL.'&method=openInBrowser';
		require $this->path."/display.php";
	}
}