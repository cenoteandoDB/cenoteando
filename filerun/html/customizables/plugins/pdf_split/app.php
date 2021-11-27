<?php


class custom_pdf_split extends \FileRun\Files\Plugin {

	static $localeSection = 'Custom Actions: Extract PDF pages';
	static $publicMethods = ['split'];

	function init() {
		$this->JSconfig = [
			'title' => self::t('Extract PDF pages'),
			'iconCls' => 'fa fa-fw fa-page-break',
			'extensions' => ['pdf'],
			"requiredUserPerms" => ["download", "upload"],
			'requires' => ['download', 'create', 'alter'],
			'fn' => 'FR.customActions.pdf_split.run()'
		];
	}

	function run() {
	}

	function JSinclude() {
		include gluePath($this->path, "include.js.php");
	}

	function split() {
		$pages = \S::fromHTML($_POST['pages']);
		$split = \S::fromHTML($_POST['split']);
		$extension = \FM::getExtension($this->data[0]['fileName']);
		if ($extension != 'pdf') {
			jsonFeedback(false, 'The selected file must be a PDF file.');
		}

		$fh = fopen($this->data[0]['fullPath'], 'rb');
		$pdf = new \setasign\Fpdi\Tfpdf\Fpdi();
		try {
			$pageCount = $pdf->setSourceFile($fh);
		} catch (Exception $e) {
			jsonFeedback(false, $this->data[0]['fileName'].': '.$e->getMessage());
		}
		//echo ' ['.\FM::formatFileSize(memory_get_usage()).'] ';

		$pages = str_replace(' ', '', $pages);
		$parts = explode(',', $pages);
		$pages = [];
		foreach ($parts as $part) {
			if (strpos($part, '-') !== false) {
				$subparts = trim_array(explode('-', $part));
				if (count($subparts) < 2) {continue;}
				if ($subparts[0] > $subparts[1]) {
					for ($i = $subparts[0]; $i >= $subparts[1]; $i--) {
						$pageNo = $i;
						if (!$pageNo || $pageNo > $pageCount) {continue;}
						if ($pageNo > $pageCount) {
							jsonFeedback(false, \FileRun\Lang::t('The page %1 was not found in the document!', false, [$pageNo]));
						}
						$pages[] = $pageNo;
					}
				} else {
					for ($i = $subparts[0]; $i <= $subparts[1]; $i++) {
						$pageNo = $i;
						if (!$pageNo || $pageNo > $pageCount) {continue;}
						if ($pageNo > $pageCount) {
							jsonFeedback(false, \FileRun\Lang::t('The page %1 was not found in the document!', false, [$pageNo]));
						}
						$pages[] = $pageNo;
					}
				}
			} else {
				$pageNo = $part;
				if (!$pageNo) {continue;}
				if ($pageNo > $pageCount) {
					jsonFeedback(false, \FileRun\Lang::t('The page %1 was not found in the document!', false, [$pageNo]));
				}
				$pages[] = $pageNo;
			}
		}

		$originalRelativePath = \FM::dirname($this->data[0]['relativePath']);
		$originalFileName = $this->data[0]['fileName'];

		foreach ($pages as $pageNo) {
			if ($split) {
				$pdf = new \setasign\Fpdi\Tfpdf\Fpdi();
				$pageCount = $pdf->setSourceFile($fh);
			}
			$pdf->AddPage();
			try {
				$pdf->useTemplate($pdf->importPage($pageNo), ['adjustPageSize' => true]);
			} catch (Exception $e) {
				jsonFeedback(false, $e->getMessage());
			}
			//echo ' ['.\FM::formatFileSize(memory_get_usage()).'] ';
			if ($split) {
				$relativePath = gluePath($originalRelativePath, time().' ['.$pageNo.'] '.$originalFileName.'.pdf');
				$this->writeFile([
					'relativePath' => $relativePath,
					'source' => 'string',
					'contents' => $pdf->Output('S')
				]);
			}
		}
		if (!$split) {
			$relativePath = gluePath($originalRelativePath, time().'.pdf');
			$this->data = [];
			$this->writeFile([
				'relativePath' => $relativePath,
				'source' => 'string',
				'contents' => $pdf->Output('S')
			]);
		}

		jsonOutput([
			'success' => true,
			'msg' => \FileRun\Lang::t('PDF file successfully created!'),
			'updates' => [
				[
					'path' => \FM::dirname($relativePath),
					'updates' => 'reload'
				]
			]
		]);
	}
}
