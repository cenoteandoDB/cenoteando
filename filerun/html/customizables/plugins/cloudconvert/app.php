<?php
use \CloudConvert\Api;

class custom_cloudconvert extends \FileRun\Files\Plugin {

	var $online = true;
	static $localeSection = "Custom Actions: CloudConvert";
	static $publicMethods = ['requestConversion', 'getStatus'];

	function init() {
		$this->settings = [
			[
				'key' => 'APIKey',
				'title' => self::t('API key'),
				'comment' => self::t('Get it from %1', ['<a href="https://cloudconvert.com/api" target="_blank">https://cloudconvert.com/api</a>'])
			]
		];
		$this->JSconfig = [
            'nonTouch' => true,
			"title" => self::t("CloudConvert"),
			'icon' => 'images/icons/cloudconvert.png',
			"popup" => true, 'width' => 580, 'height' => 400,
			"requiredUserPerms" => ["download", "upload"],
			"requires" => ["download", "create"]
		];
	}

	function isDisabled() {
		return (strlen(self::getSetting('APIKey')) == 0);
	}

	function run() {
		$ext = \FM::getExtension($this->data['fullPath']);
		$api = new Api(self::getSetting('APIKey'));
		$rs = $api->get('/conversiontypes', ['inputformat' => \S::forURL($ext)]);
		require $this->path."/display.php";
	}

	function requestConversion() {
		$filePointer = $this->readFile(['returnFilePointer' => true]);

		$ext = \FM::getExtension($this->data['fileName']);

		$api = new Api(self::getSetting('APIKey'));
		try {
			$process = $api->convert([
				'inputformat' => $ext,
				'outputformat' => \S::fromHTML($_POST['format']),
				'input' => 'upload',
				'filename' => $this->data['fileName'],
				'file' => $filePointer
			]);

		} catch (\CloudConvert\Exceptions\ApiBadRequestException $e) {
			jsonFeedback(false, "Error: " . $e->getMessage());
		} catch (\CloudConvert\Exceptions\ApiConversionFailedException $e) {
			jsonFeedback(false, "Conversion failed, maybe because of a broken input file: " . $e->getMessage());
		}  catch (\CloudConvert\Exceptions\ApiTemporaryUnavailableException $e) {
			jsonFeedback(false, "API temporary unavailable: ".$e->getMessage());
		} catch (Exception $e) {
			jsonFeedback(false, "Error: " . $e->getMessage());
		}
		jsonOutput([
			'success' => true,
			'msg' => 'CloudConvert: '. $process->message,
			'url' => $process->url
		]);

	}

	function getStatus() {
		$url = S::fromHTML($_POST['statusURL']);
		if (strtolower(substr($url, 0, 6)) != 'https:') {
			$url = 'https:'.$url;
		}
		$api = new Api(self::getSetting('APIKey'));
		$process = new \CloudConvert\Process($api, $url);
		$process->refresh();
		if ($process->step != 'finished') {
			jsonOutput(array(
				'success' => false,
				'msg' => 'CloudConvert: '.$process->message,
				'step' => $process->step,
				'percent' => $process->percent,
				'output' => $process->output
			));
		}
		$this->downloadConverted($process);
	}

	private function downloadConverted($process) {
		$ext = \FM::getExtension($this->data['fileName']);
		$newExt = $process->output->ext;
		if ($newExt == $ext) {
			$newExt = ' (converted) '.$newExt;
		}
		$newName = \FM::replaceExtension($this->data['fileName'], $newExt);
		$this->data['relativePath'] = \FM::newName($this->data['relativePath'], $newName);
		$data = $this->prepareWrite();
		$tempFilePath = $data['fullPath'].'.cloudconvert.tmp';
		$rs = $process->download($tempFilePath);
		if (!$rs) {
			jsonOutput([
				'success' => false,
				'msg' => 'Failed to save the downloaded file',
				'step' => 'error'
			]);
		}
		$this->writeFile([
			'source' => 'move',
			'moveFullPath' => $tempFilePath
		]);
		$process->delete();
		jsonOutput([
			'success' => true,
			'msg' => 'Converted file was saved',
			'step' => 'downloaded',
			'newFileName' => $newName
		]);
	}
}