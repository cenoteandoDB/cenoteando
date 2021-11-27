<?php

class custom_open_in_browser extends \FileRun\Files\Plugin {

	public $immutable = true;
	public $weblinksCompatible = true;
	static $localeSection = 'Custom Actions';
	static $publicMethods = ['openInBrowser', 'openPDFInBrowser', 'thumb'];

	function init() {
		$this->JSconfig = [
			"title" => self::t('Open in browser'),
			'iconCls' => 'fa fa-fw fa-eye',
			'useWith' => ['nothing'],
			'requires' => ['preview']
		];
		$this->settings = [
			[
				'key' => 'allow_without_download',
				'title' => self::t('Allow opening PDF files without download permission'),
				'type' => 'checkbox',
				'helpText' => self::t('Use this option only if your documents are not confidential.')
			]
		];
	}

	function run() {
		$extension = \FM::getExtension($this->data['fileName']);
		if (in_array($extension, ['html', 'htm', 'xml'])) {
			header('Content-Security-Policy: sandbox;');
		}
		$isLimitedPreview = $this->isLimitedPreview();
		$allowPDFwithoutDownload = $this->getSetting('allow_without_download');

		if ($isLimitedPreview) {
			if (!($extension == 'pdf' && $allowPDFwithoutDownload)) {
				$this->centeredThumb();
				return;
			}
		}
		if ($extension == 'pdf') {
			if ($isLimitedPreview) {
				$url = $this->actionURL.'&method=openPDFInBrowser#toolbar=0';
			} else {
				$url = $this->actionURL.'&method=openInBrowser';
			}
			$isMobile = \S::fromHTML($_REQUEST['mobile']);
			if ($isMobile) {
				require $this->path.'/mobile_pdf_display.php';
				exit();
			}
			if ($isLimitedPreview) {
				self::iframe($url);
				exit();
			}
		}
		$this->openInBrowser();
	}

	function openPDFInBrowser() {
		$extension = \FM::getExtension($this->data['fileName']);
		if ($extension != 'pdf') {return false;}
		$this->streamFileForPreview();
	}

}