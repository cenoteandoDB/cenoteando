<?php

class custom_00_open_in_new_tab extends \FileRun\Files\Plugin {

	public $immutable = true;
	static $localeSection = 'Custom Actions';

	function init() {
		$this->JSconfig = [
			"title" => self::t('New tab'),
			'iconCls' => 'fa fa-fw fa-external-link',
			'folder' => true,
			'newTab' => true,
			'requires' => ['download', 'not-homefolder']
		];
	}

	function run() {
		global $config;

		$data = $this->prepareRead();

		if (is_file($data['fullPath'])) {
			$url = $config['url']['root'].'/?module=custom_actions&action=open_in_browser&path='.\S::forURL($this->data['relativePath']);
			if ($this->data['version']) {
				$url .= '&version='.\S::forURL($this->data['version']);
			}
			header('Location: '.$url);
		} else {
			$path = $this->data['relativePath'];
			if (mb_substr($path, 0, 6) == '/ROOT/') {
				$path = mb_substr($path, 6);
			}
			$parts = explode('/', $path);
			$encodedParts = [];
			foreach($parts as $part) {
				$encodedParts[] = \S::forURL($part);
			}
			$path = '/'.implode('/', $encodedParts);
			header('Location: '.$config['url']['root'].'#'.$path);
		}
		exit();
	}
}