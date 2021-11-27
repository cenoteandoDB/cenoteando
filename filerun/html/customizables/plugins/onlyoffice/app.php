<?php
use \FileRun\WebLinks;

class custom_onlyoffice extends \FileRun\Files\Plugin {

	public $weblinksCompatible = true;
	public $online = true;
	static $localeSection = 'Custom Actions: ONLYOFFICE';
	static $publicMethods = ['thumb', 'saveRemoteChanges'];

	var $canEditTypes = [
		'doc', 'docx', 'dotx', 'odt', 'ott', 'rtf', 'txt', 'html',
		'xls', 'xlsx', 'xltx', 'ods', 'ots', 'csv',
		'ppt', 'pptx', 'potx', 'odp', 'otp', 'pdf'
	];

	var $ext = [
		'text' => ['doc', 'docx', 'dotx', 'odt', 'ott', 'rtf', 'txt', 'pdf', 'html', 'epub', 'xps', 'djvu'],
		'spreadsheet' => ['xls', 'xlsx', 'xltx', 'ods', 'ots', 'csv'],
		'presentation' => ['ppt', 'pptx', 'potx', 'odp', 'otp'],
	];

	function init() {
		$this->settings = [
			[
				'key' => 'serverURL',
				'title' => self::t('DocumentServer URL'),
				'comment' => self::t('Download and install %1', ['<a href="https://github.com/ONLYOFFICE/DocumentServer" target="_blank">ONLYOFFICE DocumentServer</a>'])
			],
			[
                'key' => 'serverSecret',
                'title' => self::t('JWT secret')
            ],
			[
				'key' => 'allow_without_download',
				'title' => self::t('Allow previewing via web links without download permission.'),
				'type' => 'checkbox',
				'helpText' => self::t('Use this option only if your documents are not confidential.')
			]
		];
		$this->JSconfig = [
			"title" => self::t("ONLYOFFICE"),
			"popup" => true,
			'icon' => 'images/icons/onlyoffice.png',
			"loadingMsg" => self::t('Loading document in ONLYOFFICE. Please wait...'),
			'extensions' => array_merge($this->ext['text'], $this->ext['spreadsheet'], $this->ext['presentation']),
			"requires" => ["download"],
			"requiredUserPerms" => ["download"],
			"createNew" => [
				"title" => self::t("Document with ONLYOFFICE"),
				"options" => [
					[
						"fileName" => self::t("New Document.docx"),
						"title" => self::t("Word Document"),
						"iconCls" => 'fa fa-fw fa-file-word-o'
					],
					[
						"fileName" => self::t("New Spreadsheet.xlsx"),
						"title" => self::t("Spreadsheet"),
						"iconCls" => 'fa fa-fw fa-file-excel-o'
					],
					[
						"fileName" => self::t("New Presentation.pptx"),
						"title" =>  self::t("Presentation"),
						"iconCls" => 'fa fa-fw fa-file-powerpoint-o'
					]
				]
			]
		];
	}

	function isDisabled() {
		return (self::getSetting('serverURL') == '');
	}

	function run() {
		if ($this->isLimitedPreview() && !$this->getSetting('allow_without_download')) {
			$this->centeredThumb();
			return;
		}
		$version = $this->data['version'] ?: false;
		if ($this->data['weblink']) {
			$url = $this->data['weblink']['download_url'];
		} else {
			$weblinkInfo = WebLinks::createForService($this->data);
			if (!$weblinkInfo) {
				self::outputError('Failed to setup weblink', 'html');
			}
			$url = WebLinks::getURL([
				'id_rnd' => $weblinkInfo['id_rnd'],
				'download' => 1,
				'version' => $version
			]);
		}
		$this->logAction();

		$extension = \FM::getExtension($this->data['fileName']);

		$saveURL = false;
		$mode = 'view';
		if (!$_GET['preview_plugin']) {
			if (in_array($extension, $this->canEditTypes)) {
				if (!$this->isLimitedPreview() && \FileRun\Perms::check('upload')) {
					if ((!$this->data['shareInfo'] || ($this->data['shareInfo'] && $this->data['shareInfo']['perms_upload']))) {
						if ($this->data['weblink']) {
							$isEditable = WebLinks::verifyAllowEditing($this->data['weblink']['linkInfo']);
							if ($isEditable) {
								$saveURL = $this->actionURL . '&method=saveRemoteChanges';
							}
						} else {
							$saveURL = WebLinks::getSaveURL($weblinkInfo['id_rnd'], false, "onlyoffice");
						}
					}
				}
			}
		}
		if ($saveURL) {
			$mode = 'edit';
		}

		if (in_array($extension, $this->ext['text'])) {
			$docType = 'text';
		} else if (in_array($extension, $this->ext['spreadsheet'])) {
			$docType = 'spreadsheet';
		} else {
			$docType = 'presentation';
		}

		global $auth;
		$author = \FileRun\Users::formatFullName($auth->currentUserInfo);


		$fileModifTime = filemtime($this->data['fullPath']);

		$pid = \FileRun\Paths::getId($this->data['fullPath'], true);
		$documentKey = substr(implode('-',
			[$pid, $version, $fileModifTime]
		), 0, 20);

		$opts = [
			'documentType' => $docType,
			"type" => "desktop",
			"document" => [
				"fileType" => $extension,
				"key" => $documentKey,
				"title" => $this->data['fileName'],
				"url" => $url,
				"info" => [
					"author" => $author,
					"owner" => $author
				]
			],
			"editorConfig" => [
				"mode" => $mode,
				"lang" => \FileRun\UI\TranslationUtils::getShortName(\FileRun\Lang::getCurrent()),
				"user" => [
					"id" => $auth->currentUserInfo['id'],
					"name" => $author,
					"firstname" => $auth->currentUserInfo['name'],
					"lastname" => $auth->currentUserInfo['name2']
				],
				"customization" => [
					"autosave" => false,
					'about' => false,
					'comments' => false,
					'chat' => false,
					'feedback' => false,
					'goback' => false,
					'compactHeader' => true,
					'hideRightMenu' => true,
					'toolbarNoTabs' => true,
					'zoom' => -2,
					'logo' => ['url' => null]
				]
			],
			"events" => [
				'onError' => 'function (event) {
					if (event && docEditor) {
						docEditor.showMessage(event.data);
					}
				}'
			],
			"height" => "100%",
			"width" => "100%"
		];
		if ($this->isLimitedPreview()) {
			$opts['document']['permissions'] = [
				"edit" => false,
				"download" => false,
				"review" => false,
				'copy' => false,
				"fillForms" => false,
				"print" => false,
				"comment" => false,
				"editCommentsAuthorOnly" => true,
	            "deleteCommentsAuthorOnly" => true
			];
		}

		if ($mode == 'view') {
			$opts['type'] = 'embedded';
			$opts['editorConfig']['embedded'] = ['toolbarDocked' => 'bottom'];
		} else {
			$opts['editorConfig']['customization']['forcesave'] = true;
		}

		if ($saveURL) {
			$opts['editorConfig']['callbackUrl'] = $saveURL;
		}
		$secret = self::getSetting('serverSecret');
        if ($secret != '') {
            require $this->path . '/jwt/JWT.php';
            $opts['token'] = \Firebase\JWT\JWT::encode($opts, $secret);
        }

		require $this->path."/display.php";

		$this->logAction();
	}

	function saveRemoteChanges() {
		$rs = @file_get_contents("php://input");
		if ($rs === false) {
			self::outputError(error_get_last()['message'], 'text');
		}
		if (!$rs) {
			self::outputError('Empty contents.', 'text');
		}
		$rs = json_decode($rs, true);
		if ($rs["status"] != 2 && $rs["status"] != 6) {
			echo json_encode(['error' => 0]);
			return false;
		}
		$contents = @file_get_contents($rs["url"]);
		if ($contents === false) {
			self::outputError(error_get_last()['message'], 'text');
		}
		if (!$contents) {
			self::outputError('Empty contents.', 'text');
		}
		$this->writeFile([
			'source' => 'string',
			'contents' => $contents
		]);
		echo json_encode(['error' => 0]);
	}

	function createBlankFile() {
		$fileName = \S::fromHTML($_POST['fileName']);
		$this->data['relativePath'] = gluePath($this->data['relativePath'], $fileName);
		$ext = \FM::getExtension($fileName);
		if (!in_array($ext, $this->canEditTypes)) {
			jsonOutput([
				"rs" => false,
				"msg" => self::t('The file extension needs to be one of the following: %1', [implode(', ', $this->canEditTypes)])
			]);
		}
		$sourceFullPath = gluePath($this->path, 'blanks/blank.'.$ext);
		$this->writeFile([
			'source' => 'copy',
			'sourceFullPath' => $sourceFullPath
		]);
		jsonFeedback(true, 'Blank file created successfully');
	}
}