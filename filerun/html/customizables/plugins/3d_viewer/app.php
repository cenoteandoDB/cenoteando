<?php

class custom_3d_viewer extends \FileRun\Files\Plugin {

	public $weblinksCompatible = true;
	static $localeSection = "Custom Actions: 3D Viewer";
	static $publicMethods = ['openInBrowser', 'thumb'];

	function init() {

		$this->JSconfig = [
			"title" => self::t('3D Viewer'),
			'iconCls' => 'fa fa-fw fa-dice-d6',
			'extensions' => ['obj', 'fbx', 'mtl', 'stl', 'dae', 'x', 'gltf', 'glb', '3ds', '3mf'],
			"popup" => true,
			"requiredUserPerms" => ["preview"],
			'requires' => ['preview']
		];
	}

	function run() {
		if ($this->isLimitedPreview()) {
			$this->centeredThumb();
			return;
		}
		require $this->path.'/display.php';
	}
}