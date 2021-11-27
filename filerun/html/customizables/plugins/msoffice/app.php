<?php

class custom_msoffice extends \FileRun\Files\Plugin {

	var $online = true;
	static $localeSection = "Custom Actions: Office";

	var $ext = [
		'word' => ["doc", "docx", "docm", "dotm", "dotx", "odt"],
		'excel' => ["xls", "xlsx", "xlsb", "xls", "xlsm", "ods"],
		'powerpoint' => ["ppt", "pptx", "ppsx", "pps", "pptm", "potm", "ppam", "potx", "ppsm", "odp"],
		'project' => ['mpp'],
		'visio' => ['vsd', 'vsdx', 'vss', 'vst', 'vdx', 'vsx', 'vtx']
	];
	function init() {
		global $config;
		$postURL = $config['url']['root'].'/?module=custom_actions&action=msoffice&method=run';
		$this->JSconfig = [
			"title" => self::t("Office"),
			"icon" => 'images/icons/office.png',
			"extensions" => call_user_func_array('array_merge', $this->ext),
			"requiredUserPerms" => ["download"],
			"requires" => ["download"],
			"fn" => "FR.UI.backgroundPost(false, '".\S::safeJS($postURL)."')"
		];
	}
	function run() {
		$webLinkInfo = \FileRun\WebLinks::createForService($this->data, 2);
		$args = [
			"id_rnd" => $webLinkInfo['id_rnd'],
			"password" => $webLinkInfo['password']
		];
		//Allowed URIs must conform to the standards proposed in RFC 3987 – Internationalized Resource Identifiers (IRIs)
		//Characters identified as reserved in RFC 3986 should not be percent encoded.
		//Filenames must not contain any of the following characters: \ / : ? < > | " or *.
		$args['filename'] = str_replace('"', '_', $this->data['fileName']);

		$extension = \FM::getExtension($this->data['fileName']);
		$type = false;
		foreach ($this->ext as $k => $extList) {
			if (in_array($extension, $extList)) {
				$type = $k;
				break;
			}
		}
		if (!$type) {return false;}

		/*
		 * I have tried using WebDAV. Office didn't prompt for authentication.
		 * URL-based session authentication would need to be implemented for it to work.
		 * */

		$url = \FileRun\WebLinks::getURLRW($args);
		if (!$url) {
			exit('Failed to setup weblink');
		}
		header('Location: ms-'.$type.':ofv|u|'.$url);

		$this->logAction();
	}
}