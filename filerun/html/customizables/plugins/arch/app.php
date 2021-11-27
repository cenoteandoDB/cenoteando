<?php

class custom_arch extends \FileRun\Files\Plugin {

	public $weblinksCompatible = true;
	static $localeSection = 'Custom Actions: Archive Explorer';

	function init() {
		$this->JSconfig = [
			"title" => self::t("Archive Explorer"),
			'iconCls' => 'fa fa-fw fa-file-archive-o',
			'useWith' => ['arch'],
			"popup" => true,
			'width' => 500, 'height' => 400,
			"requires" => ["download"]
		];
	}

	function run() {
		$arch = ArchUtil::init($this->data['fullPath']);
		if (!$arch) {
			exit("This type of archives is not supported by the current server configuration.");
		}
		$rs = $arch->open();
		if (!$rs) {
			exit($arch->error);
		}
		$list = $arch->getTOC(100);
		if (!is_array($list)) {
			exit("Failed to read archive contents!");
		}
		$arch->close();
		$count = $arch->itemsCount;
		require $this->path."/display.php";
		$this->logAction();
	}
}