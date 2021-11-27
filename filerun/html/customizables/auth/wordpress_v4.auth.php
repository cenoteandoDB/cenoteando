<?php
/*
 * Plugin for allowing WordPress users to access FileRun
 *
 * */
class customAuth_wordpress_v4 {
	function pluginDetails() {
		return array(
			'name' => 'WordPress (v4)',
			'description' => 'Authenticate users against your existing WordPress users database.<br>(For single-sign-on, this application needs to be installed in a subfolder of WordPress.)',
			'fields' => array(
				array(
					'label' => 'Server path of your WordPress installation folder',
					'name' => 'path',
					'required' => true
				)
			)
		);
	}
	function getSetting($fieldName) {
		global $settings;
		$keyName = 'auth_plugin_wordpress_v4_'.$fieldName;
		return $settings->$keyName;
	}
	function pluginTest($opts) {
		$pluginInfo = self::pluginDetails();
		//check required fields
		foreach($pluginInfo['fields'] as $field) {
			if ($field['required'] && !$opts['auth_plugin_wordpress_v4_'.$field['name']]) {
				return 'The field "'.$field['label'].'" needs to have a value.';
			}
		}
		//check folder existance
		if (!is_dir($opts['auth_plugin_wordpress_v4_path'])) {
			return 'The folder you specified for the WordPress installation does not exist.';
		}
		//check that folder has index.php
		if (!is_file(gluePath($opts['auth_plugin_wordpress_v4_path'], '/index.php'))) {
			return 'No PHP application was found inside the folder you specified.';
		}
		//check for required files
		$requiredFiles = array(
			'/wp-config.php',
			'/wp-includes/class-phpass.php',
			'/wp-includes/version.php',
			'/wp-load.php'
		);
		foreach($requiredFiles as $file) {
			$filePath = gluePath($opts['auth_plugin_wordpress_v4_path'], $file);
			if (!is_file($filePath)) {
				return 'The required WordPress file "'.$file.'" was not found.';
			}
		}
		$filePath = gluePath($opts['auth_plugin_wordpress_v4_path'], '/wp-includes/version.php');
		include($filePath);
		return 'Found WordPress '.$wp_version;
	}
	function loadFrameWork() {
		require_once(gluePath($this->getSetting('path'), "/wp-load.php"));
	}
	function singleSignOn() {
		$this->loadFrameWork();
		$userInfo = wp_get_current_user();
		if ($userInfo && $userInfo->user_login) {
			return $userInfo->user_login;
		}
	}
	function getUserInfo($username = false) {
		if ($username) {
			$userInfo = get_user_by('login', $username);
		} else {
			$userInfo = wp_get_current_user();
		}
		if (!$userInfo) {
			$this->errorCode = 'USERNAME_NOT_FOUND';//allows fall back to local authentication
			$this->error = 'The provided username is not valid';
			return false;
		}
		$userMeta = get_user_meta($userInfo->id);
		$userMeta = array_filter(array_map(function($a) {return $a[0];}, $userMeta));
		$name = false;
		if ($userMeta['first_name']) {
			$name = $userMeta['first_name'];
		}
		if (!$name) {
			$name = $userMeta['nickname'];
		}
		if (!$name) {
			$name = $userInfo->user_nicename;
		}
		if (!$name) {
			$name = $userInfo->display_name;
		}
		if ($userMeta['last_name']) {
			$name2 = $userMeta['last_name'];
		}
		return array(
			'remoteRecord' => $userInfo,
			'userData' => array(
				'name' => $name,
				'name2' => $name2,
				'email' => (string) $userInfo->user_email
			),
			'userPerms' => array(),
			'userGroups' => array('WordPress')
		);
	}
	function authenticate($username, $password) {
		$this->loadFrameWork();
		$userInfo = $this->getUserInfo($username);
		if (!$userInfo) {return false;}
		$match = wp_check_password($password, $userInfo['remoteRecord']->user_pass);
		if (!$match) {
			$this->errorCode = 'WRONG_PASS';//allows FileRun to keep track of failed attempts
			$this->error = "Invalid password.";
			return false;
		} else {
			return $userInfo;
		}
	}
}