<?php

class custom_google extends \FileRun\Files\Plugin {

	var $online = true;
	static $localeSection = "Custom Actions: Google Editor";
	static $publicMethods = ['gauth', 'sendFile', 'retrieveFile', 'getToken'];

	var $ext = [
		'docs' => [
			'doc' => 'application/msword',
			'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
			'odt' => 'application/vnd.oasis.opendocument.text',
			'pdf' => 'application/pdf'
		],
		'sheets' => [
			'xls' => 'application/vnd.ms-excel',
			'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'ods' => 'application/vnd.oasis.opendocument.spreadsheet'
		],
		'slides' => [
			'ppt' => 'application/vnd.ms-powerpoint',
			'pptx' => 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
			'odp' => 'application/vnd.oasis.opendocument.presentation'
		]
	];

	function init() {
		$this->settings = [
			[
				'key' => 'clientID',
				'title' => self::t('OAuth Client ID'),
			],
			[
				'key' => 'clientSecret',
				'title' => self::t('OAuth Client Secret'),
				'comment' => self::t('Read the <a href="%1" target="_blank">configuration guide</a>.', ['http://docs.filerun.com/google_editor_integration'])
			]
		];

		$this->JSconfig = [
			"title" => self::t("Google Docs Editor"),
			"icon" => 'images/icons/gdrive.png',
			"extensions" => array_merge(array_keys($this->ext['docs']), array_keys($this->ext['sheets']), array_keys($this->ext['slides'])),
			"popup" => true, "width" => 600, 'height' => 350,
			"requires" => ["download"],
			"requiredUserPerms" => ["download"],
			"createNew" => [
				"title" => self::t("Document with Google"),
				"options" => [
					[
						"fileName" => self::t("New Document.docx"),
						"title" => self::t("Word Document"),
						"icon" => 'images/icons/gdocs.png'
					],
					[
						"fileName" => self::t("New Spreadsheet.xlsx"),
						"title" => self::t("Spreadsheet"),
						"icon" => 'images/icons/gsheets.png'
					],
					[
						"fileName" =>  self::t("New Presentation.pptx"),
						"title" => self::t("Presentation"),
						"icon" => 'images/icons/gslides.png'
					]
				]
			]
		];
		$this->outputName = "content";
	}

	function isDisabled() {
		return (strlen(self::getSetting('clientID')) == 0 || strlen(self::getSetting('clientSecret')) == 0);
	}

	function run() {
		require $this->path."/display.php";
	}

	private function getGoogleClient() {
		global $config;
		$client = new Google_Client();
		$client->setClientId(self::getSetting('clientID'));
		$client->setClientSecret(self::getSetting('clientSecret'));
		$client->setScopes(array(Google_Service_Drive::DRIVE_FILE));
		$redirectURI = $config['url']['root'].'/?module=custom_actions&action=google&method=getToken';
		$client->setRedirectUri($redirectURI);
		return $client;
	}

	function gauth() {
		$client = $this->getGoogleClient();
		if ($_GET['error']) {
			echo S::safeHTML(S::fromHTML($_GET['error']));
			exit();
		}
		$authUrl = $client->createAuthUrl();
		header('Location: '.$authUrl);
		exit();
	}


	function getToken() {
		$client = $this->getGoogleClient();
		$code = S::fromHTML($_GET['code']);
		if ($code) {
			$rs = $client->authenticate($code);
			if ($rs) {
				session_start();
				$_SESSION['FileRun']['googleAPItoken'] = $client->getAccessToken();
                echo self::t('Sending document data to Google. Please wait.');
				echo '<script>with (window.opener) {FR.sendFile();}</script>';
				exit();
			}
			echo self::t('Failed to authenticate');
			exit();
		}
		$auth_url = $client->createAuthUrl();
		header('Location: ' . filter_var($auth_url, FILTER_SANITIZE_URL));
		exit();
	}

	function sendFile() {
		$client = $this->getGoogleClient();
		session_start();
		if (!$_SESSION['FileRun']['googleAPItoken']) {exit('Missing token');}
		$client->setAccessToken($_SESSION['FileRun']['googleAPItoken']);
		$service = new Google_Service_Drive($client);

		$fileOpts = ['name' => $this->data['fileName']];
		$ext = \FM::getExtension($this->data['fileName']);
		if (array_key_exists($ext, $this->ext['docs'])) {
			$mime = $this->ext['docs'][$ext];
			$fileOpts['mimeType'] = 'application/vnd.google-apps.document';
        } else if (array_key_exists($ext, $this->ext['sheets'])) {
			$mime = $this->ext['sheets'][$ext];
			$fileOpts['mimeType'] = 'application/vnd.google-apps.spreadsheet';
		} else if (array_key_exists($ext, $this->ext['slides'])) {
			$mime = $this->ext['slides'][$ext];
			$fileOpts['mimeType'] = 'application/vnd.google-apps.presentation';
		}

		$contents = $this->readFile();
		$file = new Google_Service_Drive_DriveFile($fileOpts);
		try {
			$opts = [
				'data' => $contents,
				'mimeType' => $mime,
				'uploadType' => 'multipart',
				'fields' => 'webViewLink,id'
			];
			$result = $service->files->create($file, $opts);
		} catch (Google_Service_Exception $e) {
			$errors = $e->getErrors();
			jsonOutput(['success' => false, 'msg' => $errors[0]['message']]);
		}
		jsonOutput(['success' => true, 'data' => $result]);
	}

	function retrieveFile() {
		$client = $this->getGoogleClient();
		session_start();
		if (!$_SESSION['FileRun']['googleAPItoken']) {exit('Missing token');}
		$client->setAccessToken($_SESSION['FileRun']['googleAPItoken']);
		$service = new Google_Service_Drive($client);

		$ext = \FM::getExtension($this->data['fileName']);
		$extension = false;
		if ($ext == 'doc') {
			$ext = 'docx';
			$extension = $ext;
		} else if ($ext == 'xls') {
			$ext = 'xlsx';
			$extension = $ext;
		} else if ($ext == 'ppt') {
			$ext = 'pptx';
			$extension = $ext;
		}
		if (array_key_exists($ext, $this->ext['docs'])) {
			$mime = $this->ext['docs'][$ext];

		} else if (array_key_exists($ext, $this->ext['sheets'])) {
			$mime = $this->ext['sheets'][$ext];
		} else if (array_key_exists($ext, $this->ext['slides'])) {
			$mime = $this->ext['slides'][$ext];
		}
		$filename = $this->data['fileName'];
		if ($extension) {
			$filename = \FM::replaceExtension($this->data['fileName'], $extension);
		}
		try {
			$r = $service->files->export($_REQUEST['fileId'], $mime, array('alt' => 'media'));
		} catch(Google_Service_Exception $er) {
			$json = json_decode($er->getMessage(), true);
			jsonOutput(array('success' => false, 'msg' => $json['error']['errors'][0]['message']));
		}

		$this->writeFile([
			'source' => 'string',
			'contents' => $r->getBody()->getContents(),
			'logging' => ['details' => ['method' => 'Google Editor']]
		]);

		$this->deleteRemoteFile();

		jsonOutput(['success' => true, 'filename' => $filename, 'msg' => self::t('File saved as "%1"', [$filename])]);
	}

	private function deleteRemoteFile() {
		$client = $this->getGoogleClient();
		session_start();
		if (!$_SESSION['FileRun']['googleAPItoken']) {exit('Missing token');}
		$client->setAccessToken($_SESSION['FileRun']['googleAPItoken']);
		$service = new Google_Service_Drive($client);
		try {
			$service->files->delete($_REQUEST['fileId']);
		} catch (Google_Service_Exception $e) {
			$errors = $e->getErrors();
			jsonOutput(['success' => false, 'msg' => $errors[0]['message']]);
			return false;
		}
		return true;
	}

	function createBlankFile() {
		$fileName = \S::fromHTML($_POST['fileName']);
		$this->data['relativePath'] = gluePath($this->data['relativePath'], $fileName);
		$ext = \FM::getExtension($fileName);
		if (!in_array($ext, $this->JSconfig['extensions'])) {
			jsonOutput(["rs" => false, "msg" => self::t('The file extension needs to be one of the following: %1', [implode(', ', $this->JSconfig['extensions'])])]);
		}
		$sourceFullPath = gluePath($this->path, 'blanks/blank.'.$ext);
		$this->writeFile([
			'source' => 'copy',
			'sourceFullPath' => $sourceFullPath,
			'logging' => ['details' => ['method' => 'Google Editor']]
		]);
		jsonFeedback(true, 'Blank file created successfully');
	}
}