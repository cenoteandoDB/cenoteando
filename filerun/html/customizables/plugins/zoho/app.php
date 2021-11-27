<?php
use \FileRun\WebLinks;

class custom_zoho extends \FileRun\Files\Plugin {

	public $weblinksCompatible = true;
	public $online = true;
	static $localeSection = "Custom Actions: Zoho";
	static $publicMethods = ['thumb', 'saveRemoteChanges'];

	var $writerExtensions = ["doc", "docx", "html", "rtf", "txt", "odt", "sxw"];
	var $sheetExtensions = ["xls", "xlsx", "sxc", "csv", "ods", "tsv"];
	var $showExtensions = ["ppt", "pptx", "pps", "odp", "sxi", "ppsx"];

	var $writerURL = [
		"https://writer.zoho.com/writer/officeapi/v1/document",
		'https://writer.zoho.com/v1/officeapi/document/preview'
	];
	var $sheetURL = "https://sheet.zoho.com/sheet/officeapi/v1/spreadsheet";
	var $showURL = "https://show.zoho.com/show/officeapi/v1/presentation";

	function init() {
		$this->settings = [
			[
				'key' => 'APIKey',
				'title' => self::t('API key'),
				'comment' => self::t('Get it from %1', ['<a href="https://www.zoho.com/officeplatform/" target="_blank">zoho.com/officeplatform/</a>'])
			],
			[
				'key' => 'api_hostname',
				'title' => self::t('Zoho API domain'),
				'comment' => self::t('Either <b>zoho.com</b> or <b>zoho.eu</b>')
			],
			[
				'key' => 'allow_without_download',
				'title' => self::t('Allow previewing without download permission'),
				'type' => 'checkbox',
				'helpText' => self::t('Use this option only if your documents are not confidential.')
			]
		];
		$this->JSconfig = [
			"title" => self::t("Zoho Editor"),
			'icon' => 'images/icons/zoho.png',
			"extensions" => array_merge($this->writerExtensions, $this->sheetExtensions, $this->showExtensions),
			"popup" => true,
			"requires" => ["preview"],
			"requiredUserPerms" => ["preview"],
			"createNew" => [
				"title" => self::t("Document with Zoho"),
				"options" => [
					[
						"fileName" => self::t("New Document.odt"),
						"title" => self::t("Word Document"),
						"icon" => 'images/icons/zwriter.png'
					],
					[
						"fileName" => self::t("New Spreadsheet.ods"),
						"title" => self::t("Spreadsheet"),
						"icon" => 'images/icons/zsheet.png'
					],
					[
						"fileName" => self::t("New Presentation.odp"),
						"title" => self::t("Presentation"),
						"icon" => 'images/icons/zshow.png'
					]
				]
			]
		];
	}

	function isDisabled() {
		return ($this->getSetting('APIKey') == '');
	}

	function run() {
		if ($this->isLimitedPreview() && !$this->getSetting('allow_without_download')) {
			$this->centeredThumb();
			return;
		}

		global $auth;
		$version = $this->data['version'] ?: false;
		if ($this->data['weblink']) {
			$url = $this->data['weblink']['download_url'];
		} else {
			$weblinkInfo = WebLinks::createForService($this->data, 2);
			if (!$weblinkInfo) {
				self::outputError('Failed to setup weblink', 'html');
			}
			$url = WebLinks::getURL([
				'id_rnd' => $weblinkInfo['id_rnd'],
				'download' => 1,
				'version' => $version
			]);
		}

		$mode = 'view';
		$saveURL = false;
		if (!$this->isLimitedPreview() && \FileRun\Perms::check('upload')) {
			if ((!$this->data['shareInfo'] || ($this->data['shareInfo'] && $this->data['shareInfo']['perms_upload']))) {
				if ($this->data['weblink']) {
					$saveURL = $this->actionURL.'&method=saveRemoteChanges';
				} else {
					$saveURL = WebLinks::getSaveURL($weblinkInfo['id_rnd'], false, "zoho");
				}
				$mode = 'edit';
			}
		}

		$extension = \FM::getExtension($this->data['fileName']);
		$isWriterViewMode = false;
		if (in_array($extension, $this->writerExtensions)) {
			if ($mode == 'edit') {
				$url = $this->writerURL[0];
			} else {
				$url = $this->writerURL[1];
				$isWriterViewMode = true;
			}
			$serviceName = 'Writer';
		} else {
			if (in_array($extension, $this->showExtensions)) {
				$url = $this->showURL;
				$serviceName = 'Show';
			} else {
				$url = $this->sheetURL;
				$serviceName = 'Sheet';
			}
		}
		$customAPIHostname = $this->getSetting('api_hostname');
		if ($customAPIHostname && $customAPIHostname != 'zohoapis.com') {
			$url = str_replace('zoho.com', $customAPIHostname, $url);
		}

		$author = \FileRun\Users::formatFullName($auth->currentUserInfo);

		$filePointer = $this->readFile([
			'returnFilePointer' => true
		]);

		$post = [
			['name' => 'apikey', 'contents' => $this->getSetting('APIKey')],
			['name' => 'document', 'contents' => $filePointer]
		];

		$metaFileId = \FileRun\MetaFiles::getId($this->data['fullPath']);
		if ($metaFileId) {
			$d = \FileRun\MetaFields::getTable();
			$docIdMetaFieldId = $d->selectOneCol('id', [['`system`', '=', 1], ['name', '=', $d->q('zoho_collab')]]);
			$zohoDocId = \FileRun\MetaValues::get($metaFileId, $docIdMetaFieldId);
		}
		//if (!$zohoDocId) {$zohoDocId = uniqid(rand());}//newer zoho errors out on this

		if (!$isWriterViewMode) {
			$documentInfo = ['document_name' => trim(\FM::stripExtension($this->data['fileName']))];
			if ($zohoDocId) {
				$documentInfo['document_id'] = $zohoDocId;
			}
			$post[] = ['name' => 'document_info', 'contents' => json_encode($documentInfo)];
			$user_info = ['display_name' => preg_replace('/[^\00-\255]+/u', '_', $author)];
			if ($serviceName != 'Sheet') {
				$user_info['user_id'] = $auth->currentUserInfo['id'];
			}
			$post[] = ['name' => 'user_info', 'contents' => json_encode($user_info)];
			if ($saveURL) {
				$post[] = ['name' => 'callback_settings', 'contents' => json_encode([
					'save_format' => $extension,
					'save_url' => $saveURL
				])];
			}
		}

		$http = new \GuzzleHttp\Client();
		try {
			$response = $http->request('POST', $url, [
				'headers' => ['User-Agent' => ''],
				'multipart' => $post
			]);
		} catch (\GuzzleHttp\Exception\ConnectException $e) {
			jsonFeedback(false, 'Error uploading file: Network connection error: ' . $e->getMessage());
		} catch (\GuzzleHttp\Exception\ClientException $e) {
			echo 'Error uploading file to Zoho server: '.$e->getResponse()->getStatusCode();
			echo '<br>';
			echo $e->getResponse()->getBody()->getContents();
			exit();
		} catch (\GuzzleHttp\Exception\ServerException $e) {
			echo 'Error uploading file to Zoho server: '.$e->getResponse()->getStatusCode();
			echo '<br>';
			echo $e->getResponse()->getBody()->getContents();
			exit();
		} catch (RuntimeException $e) {
			echo 'Error: ' . $e->getMessage();
			exit();
		}
		$rs = $response->getBody()->getContents();
		if (!$rs) {
			jsonFeedback(false, 'Error uploading file: empty server response!');
		}
		$rs = json_decode($rs, true);
		if ($isWriterViewMode) {
			if ($rs['preview_url']) {
				header("Location: " . $rs['preview_url'] . "");
				exit();
			}
		} else {
			if ($rs['document_url']) {
				//save document id for collaboration
				if ($rs['document_id']) {
					if ($docIdMetaFieldId) {
						\FileRun\MetaValues::setByPath($this->data['fullPath'], $docIdMetaFieldId, $rs['document_id']);
					}
				}
				header("Location: " . $rs['document_url'] . "");
				exit();
			}

			echo "<strong>Zoho:</strong>";
			echo "<div style=\"margin:5px;border:1px solid silver;padding:5px;overflow:auto;\"><pre>";
			if (false !== strpos($rs['warning'], "unable to import content")) {
				echo "Zoho.com service does not support this type of documents or was not able to access this web server.\r\n\r\n";
			}
			echo $response;
			echo "</pre></div>";
		}
	}

	function createBlankFile() {
		$fileName = \S::fromHTML($_POST['fileName']);
		$this->data['relativePath'] = gluePath($this->data['relativePath'], $fileName);
		$this->writeFile([
			'source' => 'string',
			'contents' => ''
		]);
		jsonFeedback(true, 'Blank file created successfully');
	}

	function saveRemoteChanges() {
		$uploadTempPath = $_FILES['content']['tmp_name'];
		if (!$uploadTempPath) {
			self::outputError('Missing upload file', 'text');
		}
		$this->writeFile([
			'source' => 'move',
			'moveFullPath' => $uploadTempPath
		]);
		echo 'File successfully saved';
	}
}