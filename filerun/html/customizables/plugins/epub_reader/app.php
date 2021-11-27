<?php
class custom_epub_reader extends \FileRun\Files\Plugin {

	public $weblinksCompatible = true;
	static $localeSection = "Custom Actions: E-book Reader";
	static $publicMethods = ['openInBrowser', 'thumb'];

	function init() {
		$this->JSconfig = [
			"title" => self::t('E-book Reader'),
			'iconCls' => 'fa fa-fw fa-book',
			'extensions' => ['epub'],
			'popup' => true,
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