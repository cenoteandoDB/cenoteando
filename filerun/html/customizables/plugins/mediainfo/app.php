<?php

class custom_mediainfo extends \FileRun\Files\Plugin {

	static $localeSection = 'Custom Actions: MediaInfo';

	function init() {
		$this->JSconfig = [
			'title' => self::t('Media Info'),
			'iconCls' => 'fa fa-fw fa-info-circle',
			"popup" => true,
			'width' => 500, 'height' => 450,
			'requires' => ['preview']
		];
	}

	function run() {
		require $this->path."/display.php";
	}

	function displayRow($title, $value) {
		$tmp = '';
		if (is_array($value)) {
			foreach($value as $v) {
				$tmp .= '<div>';
				$tmp .= S::safeHTML(S::forHTML($v));
				$tmp .= '</div>';
			}
		} else {
			$tmp = S::safeHTML(S::forHTML($value));
		}
		if (strlen($tmp) > 0 && $tmp != "0") {
			echo '<tr>';
				echo '<td>'.$title.'</td>';
				echo '<td>'.$tmp.'</td>';
			echo '</tr>';
		}
	}
}
