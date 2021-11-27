<?php

class custom_image_viewer extends \FileRun\Files\Plugin {

	public $immutable = true;
	public $weblinksCompatible = true;
	static $localeSection = "Custom Actions: Image Viewer";
	static $publicMethods = ['thumb'];

	function init() {
		$this->JSconfig = [
			"title" => self::t("Image Viewer"),
			'iconCls' => 'fa fa-fw fa-picture-o',
			'useWith' => ['nothing']
		];
	}

	function run() {
		$ext = \FM::getExtension($this->data['fileName']);
		$showThumb = !\FileRun\Thumbs\Utils::isWebSafe($ext);

		global $config;

		if ($this->data['weblink']) {
			if ($showThumb || !$this->data['weblink']['linkInfo']['allow_downloads']) {
				$url = $this->data['weblink']['base_url'].'&method=thumb';
			} else {
				$url = $this->data['weblink']['download_url'];
			}
		} else {
			if ($showThumb) {
				$url = $this->actionURL.'&method=thumb&path='.\S::forURL($this->data['relativePath']);
			} else {
				$url = $config['url']['root'] . '/?module=custom_actions&action=open_in_browser&path='.\S::forURL($this->data['relativePath']);

			}
		}
		if ($this->data['version']) {
			$url .= '&version='.\S::forURL($this->data['version']);
		}
		?>
		<html>
		<head>
			<title><?php echo $this->JSconfig['title'];?></title>
			<style>
				body {
					border: 0;  margin: 0;  padding: 0;  overflow:hidden;
				}
				img {
					max-height: 90%;
					position: absolute;
					top: 50%;
					left: 50%;
					transform: translate(-50%, -50%);
				}
			</style>
		</head>
		<body>
			<img src="<?php echo $url;?>" />
		</body>
		</html>
		<?php
	}
}