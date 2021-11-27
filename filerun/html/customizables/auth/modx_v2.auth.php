<?php
/*
 * Plugin for allowing MODx users to access FileRun
 *
 * */
class customAuth_modx_v2 {
	var $modx;
	function pluginDetails() {
		return array(
			'name' => 'MODx (v2.2+)',
			'description' => 'Authenticate users against your existing MODx users database.',
			'fields' => array(
				array(
					'label' => 'Server path of your MODx installation folder',
					'name' => 'path',
					'required' => true
				)
			)
		);
	}
	function getSetting($fieldName) {
		global $settings;
		$keyName = 'auth_plugin_modx_v2_'.$fieldName;
		return $settings->$keyName;
	}
	function pluginTest($opts) {
		$pluginInfo = self::pluginDetails();
		//check required fields
		foreach($pluginInfo['fields'] as $field) {
			if ($field['required'] && !$opts['auth_plugin_modx_v2_'.$field['name']]) {
				return 'The field "'.$field['label'].'" needs to have a value.';
			}
		}
		//check folder existance
		if (!is_dir($opts['auth_plugin_modx_v2_path'])) {
			return 'The folder you specified for the MODx installation does not exist.';
		}
		//check that folder has index.php
		if (!is_file(gluePath($opts['auth_plugin_modx_v2_path'], '/index.php'))) {
			return 'No PHP application was found inside the folder you specified.';
		}
		//check for required files
		$requiredFiles = array(
			'/config.core.php'
		);
		foreach($requiredFiles as $file) {
			$filePath = gluePath($opts['auth_plugin_modx_v2_path'], $file);
			if (!is_file($filePath)) {
				return 'The required MODx file "'.$file.'" was not found.';
			}
		}
		define('MODX_API_MODE', true);
		require_once gluePath($opts['auth_plugin_modx_v2_path'], '/index.php');
		$modx = new modX();
		$v = $modx->getVersionData();
		if ($v['full_appname']) {
			return 'Found: ' . $v['full_appname'];
		}
	}
	function loadFrameWork() {
		define('MODX_API_MODE', true);
		require_once gluePath($this->getSetting('path'), '/index.php');
		$this->modx = new modX();
	}
	function singleSignOn() {
		$this->loadFrameWork();
		$this->modx->initialize('web');
		$user = $this->modx->getAuthenticatedUser();
		if ($user != null) {
			return $user->get('username');
		}
	}
	function getUserInfo($username = false) {
		if ($username) {
			$this->user = $this->modx->getObjectGraph('modUser', '{ "Profile":{}, "UserGroupMembers":{} }', array('modUser.username' => $username));
		} else {
			$this->user = $this->modx->getUser();
		}
		if (!$this->user) {
			$this->errorCode = 'USERNAME_NOT_FOUND';//allows fall back to local authentication
			$this->error = 'The provided username is not valid';
			return false;
		}

		$profile = $this->user->getOne('Profile');
		if (!$profile) {
			$this->errorCode = 'USERNAME_NOT_FOUND';//allows fall back to local authentication
			$this->error = 'The MODx user profile could not be retrieved';
			return false;
		}

		$fullName = $profile->get('fullname');
		if (!$fullName) {
			$fullName = 'Unnamed '.time();
		}
		$hasSpace = strpos($fullName, ' ');
		if ($hasSpace != -1) {
			$name = substr($fullName, 0, $hasSpace);
			$name2 = substr($fullName, $hasSpace+1);
		} else {
			$name = $fullName;
			$name2 = '';
		}

		$email = $profile->get('email');
		return array(
			'userData' => array(
				'name' => $name,
				'name2' => $name2,
				'email' => $email
			),
			'userPerms' => array(),
			'userGroups' => array('MODx')
		);
	}
	function authenticate($username, $password) {
		$this->loadFrameWork();
		$userInfo = $this->getUserInfo($username);
		if (!$userInfo) {return false;}
		$match = $this->user->passwordMatches($password);
		if (!$match) {
			$this->errorCode = 'WRONG_PASS';//allows FileRun to keep track of failed attempts
			$this->error = "Invalid password.";
			return false;
		} else {
			return $userInfo;
		}
	}
}