<?php
use FileRun\Files\Actions\WebLink;
use FileRun\WebLinks;

class custom_tinymce_filepicker extends \FileRun\Files\Plugin {

	static $localeSection = 'Custom Actions';

	function init() {
		$this->JSconfig = [
			"title" => self::t('File Picker for TinyMCE'),
			'icon' => 'images/icons/tinymce.png',
			'popup' => true,
			'useWith' => ['nothing'],
			"requires" => ['download', 'weblink']
		];
	}

	function run() {
		$data = WebLink\Prepare::prepare($this->data['relativePath']);
		if (!$data) {
			self::outputError(WebLink\Prepare::getError()['public']);
		}
		$linkInfo = WebLinks::getByPath($data['fullPath']);

		if (!$linkInfo) {
			$linkInfo = WebLink\Create::createDefault($data);
			if (!$linkInfo) {
				self::outputError(WebLink\Create::getError()['public']);
			}
		}

		$linkInfo['url'] = WebLinks::getURL(['id_rnd' => $linkInfo['id_rnd']]);

		$fileName = $data['alias'] ?: \FM::basename($data['fullPath']);
		$ext = \FM::getExtension($fileName);
		if (\FileRun\Thumbs\Utils::isWebSafe($ext)) {
			$imageURL =  WebLinks::getURL([
				'id_rnd' => $linkInfo['id_rnd'],
				'mode' => 'default',
				'download' => 1,
				'inline' => 1
			]);
			$html = '<img src="'.$imageURL.'" />';
		} else {
			$html = $fileName;
		}
		$html = '<a href="'.$linkInfo['url'].'">'.$html.'</a>';
		?>
		<script>
			if (!window.parent) {
				document.write('This plugin is designed to be used from within a TinyMCE editor!');
			} else {
				with (window.parent) {
					window.parent.postMessage({
						sender: 'FileRun',
						html: '<?php echo \S::safeJS($html);?>'
					}, '*');
				}
			}
		</script>
	<?php
	}
}