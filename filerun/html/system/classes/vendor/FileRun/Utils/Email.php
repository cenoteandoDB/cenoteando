<?php
namespace FileRun\Utils;
use PHPMailer\PHPMailer;

class Email extends PHPMailer {

	function __construct($exceptions = null) {
		parent::__construct($exceptions);
		global $settings, $config;
		$this->From = 'filerun@localhost';
		$this->FromName = 'FileRun';
		$this->CharSet = 'UTF-8';
		$this->isHTML(true);
		$this->XMailer = 'FileRun '.$settings->currentVersion;
		if ($settings->smtp_enable) {
			$this->isSMTP();
			$this->Host = $settings->smtp_host;
			$this->Port = $settings->smtp_port;
			if ($settings->smtp_security == 'tls') {
				$this->SMTPSecure = 'tls';
			} else if ($settings->smtp_security == 'ssl') {
				$this->SMTPSecure = 'ssl';
			}
			if ($settings->smtp_auth) {
				$this->SMTPAuth = true;
				$this->Username = $settings->smtp_username;
				$this->Password = $settings->smtp_password;
			}
			if ($config['system']['email']['smtp_debug']) {
				$this->SMTPDebug = 2;
			}
			if ($config['system']['email']['smtp_options']) {
				$this->SMTPOptions = array_merge($this->SMTPOptions, $config['system']['email']['smtp_options']);
			}
		}
	}

	static function splitEmailAddress($str) {
		$pos = mb_strrpos($str, '<');
		$name = trim(mb_substr($str, 0, $pos));
		$address = trim(trim(mb_substr($str, $pos)), '<>');
		return ['name' => $name, 'address' => $address];
	}

	static function joinEmailAddress($arr) {
		if (!is_array($arr)) {return $arr;}
		if ($arr['name']) {
			return $arr['name'].' <'.$arr['address'].'>';
		}
		return $arr['address'];
	}
}