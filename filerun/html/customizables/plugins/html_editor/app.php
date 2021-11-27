<?php

class custom_html_editor extends \FileRun\Files\Plugin {

	public $weblinksCompatible = true;
	static $localeSection = "Custom Actions: HTML Editor";
	static $publicMethods = ['saveChanges', 'thumb'];

	function init() {

		$this->JSconfig = [
			"title" => self::t("HTML Editor"),
			'iconCls' => 'fa fa-fw fa-file-code-o',
			'extensions' => ['html', 'htm'],
			"popup" => true,
			"createNew" => [
				"title" => self::t("HTML File"),
				'defaultFileName' => self::t('index.html'),
				'iconCls' => 'fa fa-fw fa-file-code-o'
			],
			"requiredUserPerms" => ["preview"],
			'requires' => ['preview']
		];
		$this->settings = [
			[
				'key' => 'use_purifier',
				'title' => self::t('Clean the HTML code before opening in the editor'),
				'type' => 'checkbox'
			]
		];
	}

	function run() {
		if ($this->isLimitedPreview()) {
			$this->centeredThumb();
			return;
		}
		$this->data['contents'] = $this->readFile();
		require $this->path."/display.php";
	}

	function saveChanges() {
		$this->writeFile([
			'source' => 'string',
			'contents' => isset($_POST['textContents']) ? \S::fromHTML($_POST['textContents']) : ''
		]);
		jsonFeedback(true, 'File successfully saved');
	}

	function createBlankFile() {
		$fileName = \S::fromHTML($_POST['fileName']);
		$this->data['relativePath'] = gluePath($this->data['relativePath'], $fileName);
		$this->saveChanges();
	}

	static function getTranslationCode() {
		$map = [
			'basque' => false,
			'brazilian portuguese' => 'pt-BR',
			'chinese traditional' => 'zh-TW',
			'chinese' => 'zh-CN',
			'danish' => 'da-DK',
			'dutch' => 'nl-NL',
			'english' => false,
			'finnish' => 'fi-FI',
			'french' => 'fr-FR',
			'german' => 'de-DE',
			'greek' => 'el-GR',
			'italian' => 'it-IT',
			'polish' => 'pl-PL',
			'romanian' => 'ro-RO',
			'russian' => 'ru-RU',
			'spanish' => 'es-ES',
			'swedish' => 'sv-SE',
			'turkish' => 'tr-TR'
		];
		$current = \FileRun\Lang::getCurrent();
		return $map[$current];
	}
}