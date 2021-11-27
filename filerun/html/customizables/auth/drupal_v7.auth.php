<?php
/*
 * Allows Drupal users to access FileRun
 * */
class customAuth_drupal_v7 {
	var $ssoToken = true;
	function pluginDetails() {
		return array(
			'name' => 'Drupal (v7)',
			'description' => 'Authenticate users against your existing Drupal users database.',
			'fields' => array(
				array(
					'label' => 'Server path of the Drupal installation folder',
					'name' => 'path',
					'required' => true
				),
				array(
					'label' => 'URL of the Drupal site',
					'name' => 'url'
				)
			)
		);
	}
	function getSetting($fieldName) {
		global $settings;
		$keyName = 'auth_plugin_drupal_v7_'.$fieldName;
		return $settings->$keyName;
	}
	function pluginTest($opts) {
		$pluginInfo = self::pluginDetails();
		//check required fields
		foreach($pluginInfo['fields'] as $field) {
			if ($field['required'] && !$opts['auth_plugin_drupal_v7_'.$field['name']]) {
				return 'The field "'.$field['label'].'" needs to have a value.';
			}
		}
		//check folder existance
		if (!is_dir($opts['auth_plugin_drupal_v7_path'])) {
			return 'The folder you specified for the Drupal installation does not exist.';
		}
		//check that folder has index.php
		if (!is_file(gluePath($opts['auth_plugin_drupal_v7_path'], '/index.php'))) {
			return 'No PHP application was found inside the folder you specified.';
		}
		//check for required files
		$requiredFiles = array(
			'/includes/bootstrap.inc',
			'/includes/password.inc'
		);
		foreach($requiredFiles as $file) {
			$filePath = gluePath($opts['auth_plugin_drupal_v7_path'], $file);
			if (!is_file($filePath)) {
				return 'The required Drupal file "'.$file.'" was not found.';
			}
		}
		define('DRUPAL_ROOT', $opts['auth_plugin_drupal_v7_path']);
		require_once(gluePath(DRUPAL_ROOT,'/includes/bootstrap.inc'));
		if (!function_exists('drupal_bootstrap')) {
			return 'Cannot find the Drupal bootstrap function.';
		}
		drupal_bootstrap();
		echo 'Found Drupal '.VERSION;
		echo '<br>';
		if (strlen($opts['auth_plugin_drupal_v7_url']) < 7) {
			return '(Without a valid URL, the single-sign-on is not be available.)';
		} else {
			$http = new GuzzleHttp\Client();
			$req = false;
			try {
				$req = $http->request('HEAD', $opts['auth_plugin_drupal_v7_url']);
			} catch(GuzzleHttp\Exception\BadResponseException $e) {
				echo 'Error while trying to verify the URL: ' . $e->getMessage();
			}
			if ($req) {
				if ($req->getStatusCode() != '200') {
					echo 'The URL doesn\'t seem to be valid';
				} else {
					$exp = $req->getHeader('Expires');
					if ($exp == 'Sun, 19 Nov 1978 05:00:00 GMT') {
						echo 'URL successfully verified!';
					} else {
						echo 'Not sure if it\'s a Drupal site!';
					}
				}
			}
		}
	}
	function loadFrameWork() {
		@error_reporting(E_ALL & ~E_NOTICE & ~E_STRICT & ~E_DEPRECATED);
		define('DRUPAL_ROOT', $this->getSetting('path'));
		require_once(gluePath(DRUPAL_ROOT,'/includes/bootstrap.inc'));
		if (!function_exists('drupal_bootstrap')) {
			$this->errorCode = 'PLUGIN_CONFIG';
			return 'Cannot find the Drupal bootstrap function.';
		}
	}
	function singleSignOn() {
		$this->loadFrameWork();
		global $base_url;
		$base_url = rtrim($this->getSetting('url'), '/');
		drupal_bootstrap(DRUPAL_BOOTSTRAP_SESSION);
		global $user;
		if ($user->uid && $user->name) {
			return $user->name;
		}
	}
	function getUserInfo($username) {
		$rs = db_query('SELECT * FROM {users} u WHERE u.name = :name', array(':name' => $username));
		$userInfo = $rs->fetchObject();
		if (!$userInfo) {
			$this->errorCode = 'USERNAME_NOT_FOUND';//allows fall back to local authentication
			$this->error = 'The provided username is not valid';
			return false;
		}
		if (!$userInfo->status) {
			$this->errorCode = 'DEACTIVATED';
			$this->error = 'Login denied! Your account has either been blocked or you have not activated it yet.';
			return false;
		}
		return array(
			'remoteRecord' => $userInfo,
			'userData' => array(
				'name' => $userInfo->name,
				'email' => $userInfo->mail
			),
			'userPerms' => array(),
			'userGroups' => array('Drupal')
		);
	}
	function authenticate($username, $password) {
		$this->loadFrameWork();
		drupal_bootstrap(DRUPAL_BOOTSTRAP_VARIABLES);
		$userInfo = $this->getUserInfo($username);
		if (!$userInfo) {return false;}
		require_once(gluePath(DRUPAL_ROOT, '/', variable_get('password_inc', 'includes/password.inc')));
		$rs = user_check_password($password, $userInfo['remoteRecord']);
		if (!$rs) {
			$this->errorCode = 'WRONG_PASS';
			$this->error = "Invalid password.";
			return false;
		} else {
			return $userInfo;
		}
	}
}
