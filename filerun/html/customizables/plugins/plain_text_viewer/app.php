<?php

class custom_plain_text_viewer extends \FileRun\Files\Plugin {

	public $weblinksCompatible = true;
	static $localeSection = 'Custom Actions: Text Viewer';
	static $publicMethods = ['thumb'];

	function init() {
		$this->JSconfig = [
			"title" => self::t("Text Viewer"),
			'iconCls' => 'fa fa-fw fa-file-text-o',
			'useWith' => ['txt', 'noext'],
			"popup" => true,
			"requiredUserPerms" => ["preview"],
			"requires" => ["preview"]
		];
	}

	function run() {
		global $settings;
		if ($this->isLimitedPreview()) {
			$this->centeredThumb();
			return;
		}
		$this->data['contents'] = $this->readFile(['errorHandling' => 'html']);
?>
	<!DOCTYPE html>
	<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
		<title><?php echo \S::safeHTML(\S::forHTML($this->data['fileName']));?></title>
		<link href="<?php echo $this->url;?>/style<?php if ($settings->ui_theme == 'dark') {echo '_dark';}?>.css" rel="stylesheet" />
	</head>
	<body><?php echo $this->data['contents'];?></body>
	</html>
<?php
	}
}