<?php

class custom_markdown_viewer extends \FileRun\Files\Plugin {

	public $weblinksCompatible = true;
	static $localeSection = 'Custom Actions: Markdown Viewer';
	static $publicMethods = ['thumb'];

	function init() {
		$this->JSconfig = [
			"title" => self::t("Markdown Viewer"),
			'iconCls' => 'fa fa-fw fa-quote-right',
			'extensions' => ['md', 'markdown'],
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
		$this->data['contents'] = $this->readFile();
		$enc = mb_list_encodings();
		if ($_REQUEST['charset'] && in_array($_REQUEST['charset'], $enc)) {
			$this->data['contents'] = S::convert2UTF8($this->data['contents'], $_REQUEST['charset']);
		}
?>
	<!DOCTYPE html>
	<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
		<title><?php echo \S::safeHTML(\S::forHTML($this->data['fileName']));?></title>
		<link href="<?php echo $this->url;?>/markdown<?php if ($settings->ui_theme == 'dark') {echo '_dark';}?>.css" rel="stylesheet" />
	</head>
	<body class="markdown-body">
<?php echo \FileRun\Utils\Markup\Markdown::toHTML($this->data['contents']);?>
	</body>
	</html>
<?php
	}
}