<?php
namespace FileRun\Files\Actions\Browse;
use FileRun\Files\Actions\Base;
use FileRun\Files\Actions\Read;
use FileRun\Files;

class Folder extends Base {

	static function getList($relativePath) {
		$data = Read\Prepare::prepare($relativePath, 'folder');
		if (!$data) {
			self::$error = Read\Prepare::getError();
			return false;
		}
		$data['items'] = Files\Listing::get([
			'path' => $data['fullPath'],
			'only' => 'folders',
			'sort' => true
		]);
		if ($data['items'] === false) {
			self::$error = [
				'private' => 'Failed to list '.$data['folder']['fullPath'],
				'public' => 'Failed to list folder contents!'
			];
			return false;
		}
		return $data;
	}
}