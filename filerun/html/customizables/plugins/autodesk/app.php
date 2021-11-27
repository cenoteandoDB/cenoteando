<?php

class custom_autodesk extends \FileRun\Files\Plugin {

	public $weblinksCompatible = true;
	public $online = true;
	static $localeSection = 'Custom Actions: Autodesk';
	static $publicMethods = ['start', 'checkStatus'];

	var $authURL = 'https://developer.api.autodesk.com/authentication/v1/authenticate';
	var $bucketsURL = 'https://developer.api.autodesk.com/oss/v2/buckets';
	var $apiURL = 'https://developer.api.autodesk.com/modelderivative/v2';
	var $authData = [];

	function init() {
		$this->settings = [
			[
				'key' => 'clientID',
				'title' => self::t('API client ID')
			],
			[
				'key' => 'clientSecret',
				'title' => self::t('API client secret'),
				'comment' => self::t('Get them from %1', ['<a href="https://developer.autodesk.com" target="_blank">https://developer.autodesk.com</a>'])
			]
		];
		$this->JSconfig = [
			"title" => self::t("Autodesk"),
			'icon' => 'images/icons/autodesk.png',
			"extensions" => ['3dm', '3ds', 'asm', 'cam360', 'catpart', 'catproduct', 'cgr', 'dae', 'dlv3', 'dwf', 'dwfx', 'dwg', 'dwt', 'dxf', 'exp', 'f3d', 'fbx', 'g', 'gbxml', 'iam', 'idw', 'ifc', 'ige', 'iges', 'igs', 'ipt', 'jt', 'model', 'neu', 'nwc', 'nwd', 'obj', 'prt', 'rvt', 'sab', 'sat', 'session', 'sim', 'sim360', 'skp', 'sldasm', 'sldprt', 'smb', 'smt', 'ste', 'step', 'stl', 'stla', 'stlb', 'stp', 'wire', 'x_b', 'x_t', 'xas', 'xpr'],
			"popup" => true,
			"requires" => ["preview"],
			"requiredUserPerms" => ["preview"],
			'loadingMsg' => self::t('Loading...')
		];
	}

	function isDisabled() {
		return (strlen(self::getSetting('clientID')) == 0) || (strlen(self::getSetting('clientSecret')) == 0);
	}

	function run() {
		require $this->path."/display.php";
	}

	function start() {
		$http = new \GuzzleHttp\Client();
		try {
			$response = $http->request('POST', $this->authURL, [
				'form_params' => [
					'client_id' => self::getSetting('clientID'),
					'client_secret' => self::getSetting('clientSecret'),
					'grant_type' => 'client_credentials',
					'scope' => 'data:read data:write bucket:create viewables:read'
				]
			]);
		} catch (\GuzzleHttp\Exception\ConnectException $e) {
			jsonFeedback(false, 'Network connection error: '.$e->getMessage());
		} catch (\GuzzleHttp\Exception\ClientException $e) {
			$rs = json_decode($e->getResponse()->getBody()->getContents(), true);
			jsonFeedback(false, 'Error while authenticating with Autodesk API: '. $rs['developerMessage']);
		} catch (\GuzzleHttp\Exception\ServerException $e) {
			jsonFeedback(false, 'Server error: '.$e->getResponse()->getStatusCode());
		} catch (RuntimeException $e) {
			jsonFeedback(false, 'Error: '.$e->getMessage());
		}
		$rs = $response->getBody()->getContents();
		if (!$rs) {
			jsonFeedback(false, 'Error: empty server response!');
		}
		$rs = json_decode($rs, 1);
		if (!$rs['access_token']) {
			jsonFeedback(false, 'Error: missing access token!');
		}
		$this->authData = $rs;


		$modifiedDate = filemtime($this->data['fullPath']);
		$metaFileId = \FileRun\MetaFiles::getId($this->data['fullPath']);
		$d = \FileRun\MetaFields::getTable();
		$docIdMetaFieldId = $d->selectOneCol('id', [['`system`', '=', 1], ['name', '=', $d->q('autodesk_urn')]]);
		if ($metaFileId) {
			$rs = \FileRun\MetaValues::get($metaFileId, $docIdMetaFieldId);
			if ($rs) {
				$documentInfo = json_decode($rs, true);
				if ($documentInfo['mtime'] == $modifiedDate) {
					$documentURN = $documentInfo['urn'];
					jsonOutput([
						'success' => true,
						'msg' => self::t('Loading existing document preview...'),
						'urn' => base64_encode($documentURN),
						'access_token' => $this->authData['access_token']
					]);
				}
			}
		}


		$bucketKey = 'my-bucket-' . time();
		$rs = $this->createBucket($bucketKey);
		if (!$rs) {
			jsonFeedback(false, 'Error: failed to create bucket!');
		}
		$rs = $this->uploadFile($bucketKey);
		$urn = $rs['objectId'];
		$rs = $this->convertFile($urn);

		if ($rs['result'] == 'success') {
			\FileRun\MetaValues::setByPath($this->data['fullPath'], $docIdMetaFieldId, json_encode(['mtime' => $modifiedDate, 'urn' => $urn]));
			jsonOutput(['success' => true, 'msg' => self::t('Processing data...'), 'urn' => base64_encode($urn), 'access_token' => $this->authData['access_token']]);
		}

	}

	private function createBucket($key) {
		$http = new \GuzzleHttp\Client();
		try {
			$response = $http->request('POST', $this->bucketsURL, [
				'headers' => [
					'Authorization' => 'Bearer ' . $this->authData['access_token']
				],
				'json' => [
					'bucketKey' => $key,
					'policyKey' => 'transient'
				]
			]);
		} catch (\GuzzleHttp\Exception\ConnectException $e) {
			jsonFeedback(false, 'Network connection error: '.$e->getMessage());
		} catch (\GuzzleHttp\Exception\ClientException $e) {
			$response = $e->getResponse()->getBody()->getContents();
			$rs = @json_decode($response, true);
			if (!is_array($rs)) {
				jsonFeedback(false, 'Error while creating bucket: '. $response);
			}
			jsonFeedback(false, 'Error while creating bucket: '. $rs['reason']);
		} catch (\GuzzleHttp\Exception\ServerException $e) {
			jsonFeedback(false, 'Server error: '.$e->getResponse()->getStatusCode());
		} catch (RuntimeException $e) {
			jsonFeedback(false, 'Error: '.$e->getMessage());
		}
		$rs = $response->getBody()->getContents();
		if (!$rs) {
			jsonFeedback(false, 'Error creating bucket: empty server response!');
		}
		return json_decode($rs, true);
	}

	private function uploadFile($bucketKey) {
		$filePointer = $this->readFile(['returnFilePointer' => true]);

		$http = new \GuzzleHttp\Client();
		try {
			$response = $http->request('PUT', $this->bucketsURL.'/'.S::forURL($bucketKey).'/objects/'.S::forURL($this->data['fileName']), [
				'headers' => [
					'Authorization' => 'Bearer ' . $this->authData['access_token'],
					'Content-Type', 'application/octet-stream',
					'Expect', ''
				],
				'body' => $filePointer
			]);
		} catch (\GuzzleHttp\Exception\ConnectException $e) {
			jsonFeedback(false, 'Network connection error: '.$e->getMessage());
		} catch (\GuzzleHttp\Exception\ClientException $e) {
			$rs = json_decode($e->getResponse()->getBody()->getContents(), true);
			jsonFeedback(false, 'Error while uploading file: '. $rs['reason']);
		} catch (\GuzzleHttp\Exception\ServerException $e) {
			jsonFeedback(false, 'Server error: '.$e->getResponse()->getStatusCode());
		} catch (RuntimeException $e) {
			jsonFeedback(false, 'Error: '.$e->getMessage());
		}
		$rs = $response->getBody()->getContents();
		if (!$rs) {
			jsonFeedback(false, 'Error uploading file: empty server response!');
		}
		return json_decode($rs, true);
	}

	private function convertFile($urn) {
		$http = new \GuzzleHttp\Client();
		try {
			$response = $http->request('POST', $this->apiURL.'/designdata/job', [
				'headers' => [
					'Authorization' => 'Bearer ' . $this->authData['access_token']
				],
				'json' => [
					'input' => [
						'urn' => base64_encode($urn)
					],
					'output' => [
						'formats' => [
							[
								'type' => 'svf',
								'views' => ['2d', '3d']
							]
						]
					]
				]
			]);
		} catch (\GuzzleHttp\Exception\ConnectException $e) {
			jsonFeedback(false, 'Network connection error: '.$e->getMessage());
		} catch (\GuzzleHttp\Exception\ClientException $e) {
			$rs = json_decode($e->getResponse()->getBody()->getContents(), true);
			jsonFeedback(false, 'Error converting file: '. ($rs['reason'] ?: $rs['developerMessage'] ?: $rs['diagnostic']));
		} catch (\GuzzleHttp\Exception\ServerException $e) {
			jsonFeedback(false, 'Server error: '.$e->getResponse()->getStatusCode());
		} catch (RuntimeException $e) {
			jsonFeedback(false, 'Error: '.$e->getMessage());
		}
		$rs = $response->getBody()->getContents();
		if (!$rs) {
			jsonFeedback(false, 'Error converting file: empty server response!');
		}
		return json_decode($rs, true);
	}

	function checkStatus() {
		$urn = S::fromHTML($_REQUEST['urn']);
		$access_token = S::fromHTML($_REQUEST['access_token']);

		$http = new \GuzzleHttp\Client();
		try {
			$response = $http->request('GET', $this->apiURL.'/designdata/'.$urn.'/manifest', [
				'headers' => [
					'Authorization' => 'Bearer ' . $access_token
				],
				'json' => ['urn' => base64_encode($urn)]
			]);
		} catch (\GuzzleHttp\Exception\ConnectException $e) {
			jsonFeedback(false, 'Network connection error: '.$e->getMessage());
		} catch (\GuzzleHttp\Exception\ClientException $e) {
			$contents = $e->getResponse()->getBody()->getContents();
			$rs = json_decode($contents, true);
			if (!$rs) {
				jsonFeedback(false, 'Error checking status: '. $contents);
			} else {
				jsonFeedback(false, 'Error checking status: '. $rs['reason'].$rs['developerMessage']);
			}
		} catch (\GuzzleHttp\Exception\ServerException $e) {
			jsonFeedback(false, 'Server error: '.$e->getResponse()->getStatusCode());
		} catch (RuntimeException $e) {
			jsonFeedback(false, 'Error: '.$e->getMessage());
		}
		$rs = $response->getBody()->getContents();
		if (!$rs) {
			jsonFeedback(false, 'Error checking status: empty server response!');
		}
		$rs = json_decode($rs, true);
		$percent = strstr($rs['success'], '%', true);
		jsonOutput(['success' => true, 'data' => $rs, 'percent' => $percent]);
	}
}