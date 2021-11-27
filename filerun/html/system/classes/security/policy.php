<?php
use \FileRun\Lang;
use \FileRun\Users;

class PassPolicy {

	var $errors = [];
	var $settings;
	var $pass;
	var $uid;

	function __construct($pass = false, $uid = false) {
		global $settings;
		$this->settings = $settings;
		$this->pass = $pass;
		$this->uid = $uid;
	}
	function addError($string, $vars = []) {
		$this->errors[] = Lang::t($string, 'Change Password', $vars);
	}
	function validate() {
		$this->validateLength();
		if ($this->settings->passwords_requires_uppercase) {
			$this->validateUpperCase();
		}
		if ($this->settings->passwords_letters_and_digits) {
			$this->validateAlphaNumberic();
		}
		if ($this->settings->passwords_requires_special) {
			$this->validateSpecialChars();
		}
		if ($this->settings->passwords_prevent_seq) {
			$this->validateSequences();
		}
		if ($this->settings->passwords_prevent_common) {
			$this->validateCommonInfo();
		}
		if (count($this->errors) > 0) {return false;}
		return true;
	}
	function validateCommonInfo() {
		if (!$this->uid) {return false;}
		$userInfo = Users::getInfo($this->uid, ['username', 'email', 'name', 'company', 'phone']);
		$contains = false;
		foreach($userInfo as $part) {
			if (!strlen($part))  {break;}
			if (stristr($this->pass, $part)) {
				$contains = $part;
				break;
			}
			$p = preg_split('/[;,.@]/', $part);
			if (count($p) > 0) {
				foreach($p as $subPart) {
					if (!strlen($subPart))  {break;}
					if (stristr($this->pass, $subPart)) {
						$contains = $subPart;
						break 2;
					}
				}
			}
		}
		if ($contains) {
			$this->addError('The password cannot contain the "%1" part.', [$contains]);
		}
		return true;
	}
	function validateSequences() {
		if ($seq = $this->hasSeq()) {
			$this->addError('The password cannot contain the "%1" sequence.', [$seq]);
		}
	}
	function validateSpecialChars(){
		if (!preg_match('/[\W_]/', $this->pass)) {
			$this->addError('The password needs at least one special character.');
		}
	}
	function validateLength() {
		$len = mb_strlen($this->pass);
		if ($len == 0) {
			$this->addError('The password needs at least one character.');
		}
		if ($this->settings->passwords_min_length) {
			if ($len < $this->settings->passwords_min_length) {
				$diff = $this->settings->passwords_min_length - $len;
				$this->addError('The password needs at least %1 more characters.', [$diff]);
			}
		}
	}
	function validateUpperCase() {
		if (!$this->hasUpperCaseLetters()) {
			$this->addError('The password needs at least one uppercase letter.');
		}
	}
	function validateAlphaNumberic() {
		if (!$this->hasLetters()) {
			$this->addError('The password needs at to contain at least one letter.');
		}
		if (!$this->hasDigits()) {
			$this->addError('The password needs at to contain at least one digit.');
		}
	}
	function hasSeq() {
		foreach([
			        'qwer', 'wert', 'erty', 'rtyu', 'tyui', 'yuio', 'uiop',
					'asdf', 'sdfg', 'dfgh', 'fghj', 'ghjk' , 'hjkl',
					'zxcv', 'xcvb', 'cvbn', 'vbnm',
					'1qaz', '2wsx', '3edc', '4rfv', '5tgb', '6yhn', '7ujm',
					'123', '234', '345', '456', '567', '678', '789', '890'
		        ] as $seq) {
			if (stristr($this->pass, $seq)) {
				return $seq;
			}
			$rseq = strrev($seq);
			if (stristr($this->pass, $rseq)) {
				return $rseq;
			}
		}
		return false;
	}
	function hasUpperCaseLetters() {
		return preg_match('/[A-Z]+/', $this->pass);
	}
	function hasLowerCaseLetters() {
		return preg_match('/[a-z]+/', $this->pass);
	}
	function hasLetters() {
		return $this->hasLowerCaseLetters() || $this->hasUpperCaseLetters();
	}
	function hasDigits() {
		return preg_match('/[0-9]+/', $this->pass);
	}
	function generate() {
		$pass = '';
		$letters = 'abcdefghijklmnopqrstuvwxyz';
		$special = '~!@#\$%^&*()_+-={[}]\\;\'<>,./"';
		if ($this->settings->passwords_min_length) {
			$minLen = $this->settings->passwords_min_length;
		} else {
			$minLen = 12;
		}
		$numberOfLetters = ceil(70/100*$minLen);
		$numberOfDigits = ceil(30/100*$minLen);
		$upper = false;
		for ($i=0;$i<$numberOfLetters;$i++) {
			$randomLetter = $letters[mt_rand(0,strlen($letters))];
			if ($this->settings->passwords_requires_uppercase) {
				if (!$upper) {
					$randomLetter = strtoupper($randomLetter);
				}
				$upper = true;
			}
			$pass .= $randomLetter;
		}
		for ($i=0;$i<$numberOfDigits;$i++) {
			$pass .= mt_rand(0,9);
		}
		if ($this->settings->passwords_requires_special) {
			$pass .= $special[mt_rand(0,strlen($special))];
		}
		return str_shuffle($pass);
	}
}