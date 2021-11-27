<?php
use \FileRun\Files;
use \setasign\Fpdi;

class custom_pdf_merge extends Files\Plugin {

	static $localeSection = 'Custom Actions: Merge PDF files';

	function init() {
		$this->JSconfig = [
			'title' => self::t('Merge PDF files'),
			'iconCls' => 'fa fa-fw fa-copy',
			//'extensions' => ['pdf'],
			"ajax" => true,
			"requiredUserPerms" => ["download", "upload"],
			'requires' => ['multiple', 'download', 'create', 'alter']
		];
	}

	function run() {
		$targetFolderRelativePath = \S::fromHTML($_POST['currentPath']);
		$pathInfo = Files\Utils::parsePath($targetFolderRelativePath);
		if (!in_array($pathInfo['type'], ['home', 'shared'])) {
			$targetFolderRelativePath = '/ROOT/HOME';
		}
		$targetFileData = $this->prepareWrite(['relativePath' => gluePath($targetFolderRelativePath, time().'.pdf')]);
		$pdf = new Fpdi\Tfpdf\Fpdi();

		foreach ($this->data as $readFiledata) {
			try {
				$pageCount = $pdf->setSourceFile($readFiledata['fullPath']);
			} catch (Exception $e) {
				jsonFeedback(false, $readFiledata['fileName'].': '.$e->getMessage());
			}
			for ($pageNo = 1; $pageNo <= $pageCount; $pageNo++) {
				// import a page
				$templateId = $pdf->importPage($pageNo);
				// get the size of the imported page
				$size = $pdf->getTemplateSize($templateId);

				// add a page with the same orientation and size
				$pdf->AddPage($size['orientation'], $size);
				// use the imported page
				$pdf->useTemplate($templateId);
			}
		}
		$this->writeFile([
			'preparedData' => $targetFileData,
			'source' => 'string',
			'contents' => $pdf->Output('S')
		]);
		jsonOutput([
			'success' => true,
			'msg' => \FileRun\Lang::t('PDF file successfully created!'),
			'refresh' => true
		]);
	}
}
