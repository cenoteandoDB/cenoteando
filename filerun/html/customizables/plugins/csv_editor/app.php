<?php

use FileRun\Perms;

class custom_csv_editor extends \FileRun\Files\Plugin {

	public $weblinksCompatible = true;
	static $localeSection = "Custom Actions: CSV Editor";
	static $publicMethods = ['saveChanges', 'openInBrowser', 'thumb'];

	function init() {

		$this->JSconfig = [
			"title" => self::t('CSV Editor'),
			'iconCls' => 'fa fa-fw fa-file-csv',
			'extensions' => ['csv'],
			"popup" => true,
			"createNew" => [
				"title" => self::t('CSV File'),
				'defaultFileName' => self::t('data.csv'),
				'iconCls' => 'fa fa-fw fa-file-csv'
			],
			"requiredUserPerms" => ["download"],
			'requires' => ['download']
		];
	}

	function run() {
		global $settings, $config;
		if ($this->isLimitedPreview()) {
			$this->centeredThumb();
			return;
		}
		$isEditable = false;
		if (Perms::check('upload')) {
			if (!$this->data['shareInfo'] || ($this->data['shareInfo'] && $this->data['shareInfo']['perms_upload'])) {
				$isEditable = true;
			}
		}
		if ($this->data['weblink'] && $isEditable) {
			$isEditable = \FileRun\WebLinks::verifyAllowEditing($this->data['weblink']['linkInfo']);
		}
		$isClosable = $_REQUEST['_popup_id'] ? true : false;
		$vars = json_encode([
			'isEditable' => (bool) $isEditable,
			'isClosable' => $isClosable,
			'URLRoot' => $config['url']['root'],
			'actionURL' => $this->actionURL,
			'fileURL' => $this->actionURL.'&method=openInBrowser',
			'path' => $this->data['relativePath'],
			'filename' => $this->data['fileName'],
			'windowId' => \S::fromHTML($_REQUEST['_popup_id']),
			'theme' => $settings->ui_theme
		]);
		require $this->path."/display.php";
	}

	function saveChanges() {
		$data = $this->prepareWrite();
		if ($data['folder']) {return false;}
		$data['logging'] = $this->prepareLoggingDetails();
		$rs = \FileRun\Files\Actions\Write\Write::onBeforeWrite($data, 'string');
		if (!$rs) {
			self::outputError(\FileRun\Files\Actions\Write\Write::getError()['public']);
			return false;
		}
		$fp = fopen($data['fullPath'], 'w');
		if ($_POST['csvHeaders']) {
			$headers = json_decode($_POST['csvHeaders'], true);
			fputcsv($fp, $headers);
		}
		if ($_POST['textContents']) {
			$rows = json_decode($_POST['textContents'], true);
		} else {
			$rows = [];
		}
		foreach ($rows as $row) {
			fputcsv($fp, $row);
		}
		fclose($fp);
		\FileRun\Files\Actions\Write\Write::onAfterWrite($data);
		jsonFeedback(true, 'File successfully saved');
	}

	function createBlankFile() {
		$_POST['csvHeaders'] = json_encode(['A', 'B']);
		$_POST['textContents'] = json_encode([['','']]);
		$fileName = \S::fromHTML($_POST['fileName']);
		$this->data['relativePath'] = gluePath($this->data['relativePath'], $fileName);
		$this->saveChanges();
	}
}