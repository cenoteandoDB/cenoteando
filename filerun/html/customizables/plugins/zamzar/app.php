<?php

class custom_zamzar extends \FileRun\Files\Plugin {

	var $online = true;
	var $urlBase = 'https://sandbox.zamzar.com/v1';
	static $localeSection = 'Custom Actions: Zamzar';
	static $publicMethods = ['requestConversion', 'getStatus', 'downloadConverted'];

	function init() {
		$this->settings = [
			[
				'key' => 'APIKey',
				'title' => self::t('API key'),
				'comment' => self::t('Get it from %1', ['<a href="https://developers.zamzar.com" target="_blank">https://developers.zamzar.com</a>'])
			]
		];
		$this->JSconfig = [
			"title" => self::t("Zamzar"),
			'icon' => 'images/icons/zamzar.png',
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
		$url = $this->urlBase.'/formats/'.\S::forURL($ext);
		$http = new \GuzzleHttp\Client();
		try {
			$response = $http->request('GET', $url, [
				'auth' => [self::getSetting('APIKey'), '']
			]);
		} catch (\GuzzleHttp\Exception\ConnectException $e) {
			self::outputError('Network connection error: '.$e->getMessage(), 'html');
		} catch (\GuzzleHttp\Exception\ClientException $e) {
			if ($e->getResponse()->getStatusCode() == 404) {
				self::outputError("Zamzar doesn't seem to provide any conversion option for the ".mb_strtoupper($ext)." file type.", 'html');
			} else {
				self::outputError('Error: '.$e->getResponse()->getStatusCode(), 'html');
			}
		} catch (\GuzzleHttp\Exception\ServerException $e) {
			self::outputError('Server error: '.$e->getResponse()->getStatusCode(), 'html');
		} catch (RuntimeException $e) {
			self::outputError('Error: '.$e->getMessage(), 'html');
		}
		$rs = $response->getBody()->getContents();
		if (!$rs) {
			self::outputError('Error getting conversion formats: empty Zamzar server response!', 'html');
		}
		$rs = json_decode($rs, true);
		require $this->path."/display.php";
	}

	function requestConversion() {
		$filePointer = $this->readFile(['returnFilePointer' => true]);

		$url = $this->urlBase.'/jobs';
		$http = new \GuzzleHttp\Client();
		try {
			$response = $http->request('POST', $url, [
				'auth' => [self::getSetting('APIKey'), ''],
				'multipart' => [
					[
						'name'     => 'target_format',
						'contents' => S::fromHTML($_POST['format'])
					],
					[
						'name'     => 'source_file',
						'contents' => $filePointer
					]
				]
			]);
		} catch (\GuzzleHttp\Exception\ConnectException $e) {
			jsonFeedback(false, 'Network connection error: '.$e->getMessage());
		} catch (\GuzzleHttp\Exception\ClientException $e) {
			$rs = json_decode($e->getResponse()->getBody()->getContents(), true);
			jsonFeedback(false, 'Client error: '.$e->getResponse()->getStatusCode().' - '. $rs['errors'][0]['message']);
		} catch (\GuzzleHttp\Exception\ServerException $e) {
			$rs = json_decode($e->getResponse()->getBody()->getContents(), true);
			jsonFeedback(false, 'Server error: '.$e->getResponse()->getStatusCode().' - '.$rs['errors'][0]['message']);
		} catch (RuntimeException $e) {
			jsonFeedback(false, 'Error: '.$e->getMessage());
		}
		$rs = $response->getBody()->getContents();
		if (!$rs) {
			jsonFeedback(false, 'Error requesting conversion: empty server response!');
		}
		$rs = json_decode($rs, true);
		if (!is_array($rs)) {
			self::outputError('Unexpected response from the ZamZar server!');
		}
		if (!$rs['id']) {
			self::outputError('Missing ZamZar conversion job id!');
		}
		jsonOutput([
			'success' => true,
			'msg' => 'Zamzar: '. $rs['status'],
			'jobId' => $rs['id']
		]);
	}

	function getStatus() {
		$url = $this->urlBase.'/jobs/'.S::forURL(S::fromHTML($_POST['jobId']));

		$http = new \GuzzleHttp\Client();
		try {
			$response = $http->request('GET', $url, [
				'auth' => [self::getSetting('APIKey'), '']
			]);
		} catch (\GuzzleHttp\Exception\ConnectException $e) {
			jsonFeedback(false, 'Network connection error: '.$e->getMessage());
		} catch (\GuzzleHttp\Exception\ClientException $e) {
			$rs = json_decode($e->getResponse()->getBody()->getContents(), true);
			jsonOutput(array(
				'success' => false,
				'msg' => 'Zamzar status: '.$rs['status'],
				'status' => $rs['status']
			));
		} catch (\GuzzleHttp\Exception\ServerException $e) {
			echo 'Server error: '.$e->getResponse()->getStatusCode();
			exit();
		} catch (RuntimeException $e) {
			echo 'Error: '.$e->getMessage();
			exit();
		}
		$rs = $response->getBody()->getContents();
		if (!$rs) {
			jsonFeedback(false, 'Error checking status: empty server response!');
		}
		$rs = json_decode($rs, true);

		$rs['output']['size'] = \FM::formatFileSize($rs['output']['size']);
		jsonOutput(array(
			'success' => true,
			'msg' => 'Zamzar: '.$rs['status'],
			'status' => $rs['status'],
			'fileId' => $rs['target_files'][0]['id']
		));
	}

	function downloadConverted() {
		$ext = \FM::getExtension($this->data['fileName']);
		$newExt = S::fromHTML($_POST['format']);
		if ($newExt == $ext) {
			$newExt = ' (converted) '.$newExt;
		}
		$newName = \FM::replaceExtension($this->data['fileName'], $newExt);
		$this->data['relativePath'] = \FM::newName($this->data['relativePath'], $newName);
		$data = $this->prepareWrite();
		$tempFilePath = $data['fullPath'].'.zamzar.tmp';
		$writeStream = fopen($tempFilePath, "wb");
		if ($writeStream === false) {
			jsonFeedback(false, 'Failed to create temporary file!');
		}
		$http = new \GuzzleHttp\Client();
		$local = \GuzzleHttp\Psr7\stream_for($writeStream);
		$url = $this->urlBase.'/files/'.S::forURL(S::fromHTML($_POST['fileId'])).'/content';
		try {
			$response = $http->request('GET', $url, [
				'auth' => [self::getSetting('APIKey'), ''],
				'save_to' => $local
			]);
		} catch (\GuzzleHttp\Exception\ConnectException $e) {
			jsonFeedback(false, 'Network connection error: '.$e->getMessage());
		} catch (\GuzzleHttp\Exception\ClientException $e) {
			$rs = json_decode($e->getResponse()->getBody()->getContents(), true);
			jsonOutput([
				'success' => false,
				'msg' => 'Zamzar status: '.$rs['status'],
				'status' => $rs['status']
			]);
		} catch (\GuzzleHttp\Exception\ServerException $e) {
			jsonFeedback(false, 'Server error: '.$e->getResponse()->getStatusCode());
		} catch (RuntimeException $e) {
			jsonFeedback(false, 'Error: '.$e->getMessage());
		}
		if ($response->getStatusCode() == 200) {
			fclose($writeStream);
			$this->writeFile([
				'source' => 'move',
				'moveFullPath' => $tempFilePath
			]);
			jsonOutput([
				'success' => true,
				'newFileName' => $newName
			]);
		}
	}
}