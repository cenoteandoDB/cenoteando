<?php

class custom_crypt extends \FileRun\Files\Plugin {

	static $localeSection = 'Custom Actions: File Encryption';

	function init() {
		$pathToAESCrypt = self::getSetting('pathToAESCrypt');
		$this->config = [
			'encrypt_command' => $pathToAESCrypt.' -e -p [%pass%] [%filePath%]',
			'decrypt_command' => $pathToAESCrypt.' -d -p [%pass%] [%filePath%]',
			'encrypted_file_extension' => 'aes',
			'debug' => false
		];
		$this->settings = [
			[
				'key' => 'pathToAESCrypt',
				'title' => self::t('Path to AESCrypt'),
				'comment' => self::t('Download and install AESCrypt from <a href="%1" target="_blank">here</a>.', array('https://www.aescrypt.com'))
			]
		];
		$this->JSconfig = [
			'title' => self::t('AES File Encryption'),
			'iconCls' => 'fa fa-fw fa-lock',
			"requiredUserPerms" => ["download", "upload"],
			'requires' => ['download', 'create', 'alter'],
			'fn' => 'FR.customActions.crypt.run()'
		];
	}

	function isDisabled() {
		return (strlen(self::getSetting('pathToAESCrypt')) == 0);
	}

	function run() {
		$extension = \FM::getExtension($this->data['fileName']);

		$deleteSrc = (S::fromHTML($_POST['deleteSrc']) == 1 ? true : false);

		if ($extension == $this->config['encrypted_file_extension']) {
			$targetFileName = \FM::stripExtension($this->data['fileName']);
			$targetRelativePath = \FM::newName($this->data['relativePath'], $targetFileName);
			$action = 'decrypt';
		} else {
			$targetFileName = $this->data['fileName'].".".$this->config['encrypted_file_extension'];
			$targetRelativePath = \FM::newName($this->data['relativePath'], $targetFileName);
			$action = 'encrypt';
		}
		$sourceData = $this->data;
		$this->data['relativePath'] = $targetRelativePath;
		$writeData = $this->prepareWrite();
		$loggedData = [
			"full_path" => $this->data['fullPath'],
			"relative_path" => $this->data['relativePath'],
			"to_full_path" => $writeData['fullPath'],
			"to_relative_path" => $writeData['relativePath'],
			"method" => "AES"
		];

		if ($action == 'decrypt') {
			$rs = $this->decrypt($this->data);
			if (!$rs) {
				jsonFeedback(false, self::t("Failed to decrypt the selected file!"));
			}
			\FileRun\Log::add(false, "file_decrypted", $loggedData);
		} else {
			$rs = $this->encrypt($this->data);
			if (!$rs) {
				jsonFeedback(false, self::t("Failed to encrypt the selected file!"));
			}
			\FileRun\Log::add(false, "file_encrypted", $loggedData);
		}

		if ($deleteSrc) {
			\FileRun\Files\Actions\Delete\File::run($sourceData, false);
		}
		$this->writeFile([
			'source' => 'external'
		]);

		if ($action == 'decrypt') {
			jsonFeedback(true, self::t("The selected file was successfully decrypted."));
		} else {
			jsonFeedback(true, self::t("The selected file was successfully encrypted."));
		}
	}

	function JSinclude() {
		include gluePath($this->path, "include.js.php");
	}

	private function encrypt($readData) {
		$cmd = $this->parseCmd($this->config['encrypt_command'], $readData['fullPath']);
		return $this->runCmd($cmd);
	}

	private function decrypt($readData) {
		$cmd = $this->parseCmd($this->config['decrypt_command'], $readData['fullPath']);
		return $this->runCmd($cmd);
	}

	private function parseCmd($cmd, $filePath) {
		return str_replace(
			["[%pass%]", "[%filePath%]"],
			[$this->escapeshellarg(S::fromHTML($_POST['pass'])), $this->escapeshellarg($filePath)],
		$cmd);
	}

	private function escapeshellarg($s) {
		return '"'.addslashes($s).'"';
	}

	private function runCmd($cmd) {
		session_write_close();
		@exec($cmd, $return_text, $return_code);
		if ($return_code != 0) {
			if ($this->config['debug']) {
				echo " * command: ".$cmd."<br>";
				echo " * returned code: ".$return_code."<br>";
				echo " * returned text: "; print_r($return_text);
				flush();
			}
			return false;
		}
		return true;
	}
}
