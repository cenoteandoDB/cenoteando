<?php
namespace FileRun\Files\Logging;
use \FileRun\Utils\DP;
use \FileRun\Paths;
use \FileRun\Lang;
use \FileRun\Users;

class Utils {

	static $table = 'df_file_logs';

	static function getTable() {
		return DP::factory(self::$table);
	}

	static function getActionName($name) {
		$names = [
			'upload' => 'File uploaded',
			'new_folder' => 'New folder created',
			'download' => 'File downloaded',
			'folder_download' => 'Folder downloaded',
			'file_archived' => 'File archived',
			'file_copied' => 'File copied',
				'file_copied_with_folder' => 'File copied',
			'folder_copied' => 'Folder copied',
				'folder_copied_with_folder' => 'Folder copied',
			'file_pasted' => 'File pasted',
				'file_pasted_with_folder' => 'File pasted',
			'folder_pasted' => 'Folder pasted',
				'folder_pasted_with_folder' => 'Folder pasted',
			'file_moved' => 'File moved',
				'file_moved_with_folder' => 'File moved with parent folder',
			'folder_moved' => 'Folder moved',
				'folder_moved_with_folder' => 'Folder moved with parent folder',
			'file_deleted' => 'File deleted',
			'folder_deleted' => 'Folder deleted',
			'deleted_file_restored' => 'Deleted file restored',
			'deleted_folder_restored' => 'Deleted folder restored',
			'preview' => 'File previewed',
			'weblink_download' => 'WebLink download',
			'weblink_upload' => 'File uploaded through link',
			'weblink_create' => 'WebLink created',
			'weblink_update' => 'WebLink updated',
			'weblink_remove' => 'WebLink removed',
			'comment_added' => 'Comment added',
			'comment_removed' => 'Comment removed',
			'metadata_changed' => 'Metadata changed',
			'file_locked' => 'File locked',
			'file_unlocked' => 'File unlocked',
			'version_restored' => 'Previous file version restored',
			'version_deleted' => 'Previous file version deleted',
			'file_renamed' => 'File renamed',
			'folder_renamed' => 'Folder renamed',
			'file_encrypted' => 'File encrypted',
			'file_decrypted' => 'File decrypted',
			'file_sent_by_email' => 'File sent by e-mail',
			'label_set' => 'Changed label',
			'star_set' => 'Star added',
			'star_removed' => 'Star removed',
			'file_shared' => 'File shared',
			'folder_shared' => 'Folder shared',
			'file_unshared' => 'File unshared',
			'folder_unshared' => 'Folder unshared',
			'file_added_to_archive' => 'File added to archive',
			'folder_added_to_archive' => 'Folder added to archive',
			'folder_zipped' => 'Folder added to archive',
			'file_zipped' => 'File added to archive',
			'zip_files' => 'Created using existing files',
			'extracted' => 'Extracted from archive',
			'archive_extracted' => 'Archive extracted'
		];
		return $names[$name];
	}

	static function getPhrase($actionName, $details, $uid) {
		$userFullName = Users::getNameById($uid);
		$p = false;
		if ($actionName === 'upload') {
			$t = 'Uploaded by %1';
		} else if ($actionName === 'weblink_upload') {
			$t = 'Uploaded through %1\'s link';
		} else if ($actionName === 'new_folder') {
			$t = 'Created by %1';
		} else if ($actionName === 'archive_extracted') {
			$t = 'Extracted by %1';
		} else if ($actionName === 'zip_files') {
			$t = 'Archive created by %1';
		} else if ($actionName === 'download') {
			$t = 'Downloaded by %1';
		} else if ($actionName === 'preview') {
			$t = 'Previewed by %1';
		} else if ($actionName === 'comment_added') {
			$t = '%1 wrote a comment';
		} else if ($actionName === 'comment_removed') {
			$t = '%1 removed a comment';
		} else if ($actionName === 'provide_download') {
			$t = 'Downloaded by %1';
		} else if ($actionName === 'weblink_create') {
			$t = '%1 attached a WebLink';
		} else if ($actionName === 'weblink_remove') {
			$t = '%1 removed the WebLink';
		} else if ($actionName === 'weblink_update') {
			$t = '%1 changed the WebLink\'s options';
		} else if ($actionName === 'weblink_download') {
			$t = 'Downloaded through %1\'s WebLink';
		} else if ($actionName === 'file_renamed') {
			$t = 'Renamed by %1';
		} else if ($actionName === 'file_pasted' || $actionName === 'folder_pasted') {
			$t = 'Pasted by %1';
		} else if ($actionName === 'file_copied' || $actionName === 'folder_copied') {
			$t = 'Copied by %1';
		} else if ($actionName === 'file_moved' || $actionName === 'folder_moved') {
			$t = 'Moved by %1';
		} else if ($actionName === 'file_deleted' || $actionName === 'folder_deleted') {
			$t = 'Deleted by %1';
		} else if ($actionName === 'deleted_file_restored' || $actionName === 'deleted_folder_restored') {
			$t = 'Restored by %1';
		} else if ($actionName === 'file_locked') {
			$t = 'Locked by %1';
		} else if ($actionName === 'file_unlocked') {
			$t = 'Unlocked by %1';
		} else if ($actionName === 'metadata_changed') {
			$t = 'Metadata changed by %1';
		} else if ($actionName === 'file_sent_by_email') {
			$t = 'Send by e-mail by %1';
		} else if ($actionName === 'file_encrypted') {
			$t = 'Encrypted by %1';
		} else if ($actionName === 'file_decrypted') {
			$t = 'Decrypted by %1';
		} else if ($actionName === 'version_restored') {
			$t = 'Previous version restored by %1';
		} else if ($actionName === 'version_deleted') {
			$t = 'Previous version deleted by %1';
		} else if ($actionName === 'label_set') {
			if (is_array($details['label'])) {
				$t = 'Labeled by %1: %2';
				$d = '<div class="FRLabel" style="background-color:'.$details['label']['color'].'">'.\S::safeForHtml($details['label']['text']).'</div>';
				$p = ['<span style="font-weight:bold">'.\S::safeForHtml($userFullName).'</span>', $d];
			} else {
				$t = 'Label removed by %1';
			}
		} else {
			$action = '"'.Lang::t(self::getActionName($actionName), 'Files Activity Log').'"';
			$t = '%2 by <span style="color:black;">%1</span>';
			$p = ['<span style="font-weight:bold">'.\S::safeForHtml($userFullName).'</span>', $action];
		}
		if (!$p) {$p = ['<span style="font-weight:bold">'.\S::safeForHtml($userFullName).'</span>'];}
		return Lang::t($t, 'Files Activity Log', $p);
	}

	static function clearByPath($path, $recursively = false) {
		$d = self::getTable();
		if ($recursively) {
			$records = Paths::getByFolder($path);
			foreach ($records as $record) {
				$d->delete(['pid', '=', $record['id']]);
			}
		}
		$pid = Paths::getId($path);
		if (!$pid) {return false;}
		return $d->delete(['pid', '=', $pid]);
	}

	static function clearOld() {
		global $settings;
		$days = (int) $settings->file_history_entry_lifetime;
		if ($days < 1) {return false;}
		return self::getTable()->delete(['date', '<', 'DATE_SUB(NOW(), INTERVAL '.$days.' DAY)']);
	}
}