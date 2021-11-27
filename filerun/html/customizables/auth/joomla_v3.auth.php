<?php
/*
 * Allows Joomla! users to access FileRun
 * */
class customAuth_joomla_v3 {
	var $ssoToken = true;
	function pluginDetails() {
		return array(
			'name' => 'Joomla! (v3)',
			'description' => 'Authenticate users against your existing Joomla! users database.',
			'fields' => array(
				array(
					'label' => 'Server path of your Joomla! installation folder',
					'name' => 'path',
					'required' => true
				)
			)
		);
	}
	function getSetting($fieldName) {
		global $settings;
		$keyName = 'auth_plugin_joomla_v3_'.$fieldName;
		return $settings->$keyName;
	}
	function pluginTest($opts) {

		$pluginInfo = self::pluginDetails();
		//check required fields
		foreach($pluginInfo['fields'] as $field) {
			if ($field['required'] && !$opts['auth_plugin_joomla_v3_'.$field['name']]) {
				return 'The field "'.$field['label'].'" needs to have a value.';
			}
		}
		//check folder existance
		if (!is_dir($opts['auth_plugin_joomla_v3_path'])) {
			return 'The folder you specified for the Joomla! installation does not exist.';
		}
		//check that folder has index.php
		if (!is_file(gluePath($opts['auth_plugin_joomla_v3_path'], '/index.php'))) {
			return 'No PHP application was found inside the folder you specified.';
		}
		//check for required files
		$requiredFiles = array(
			'/includes/defines.php',
			'/includes/framework.php',
			'/libraries/joomla/factory.php'
		);
		foreach($requiredFiles as $file) {
			$filePath = gluePath($opts['auth_plugin_joomla_v3_path'], $file);
			if (!is_file($filePath)) {
				return 'The required Joomla! file "'.$file.'" was not found.';
			}
		}
		//load framework
		$rs = self::loadFramework($opts['auth_plugin_joomla_v3_path'], true);
		if (!$rs) {
			return 'Failed to load Joomla! framework.';
		}
		$version = new JVersion();
		if (!$version) {
			return 'Failed to retrieve Joomla! version.';
		}
		echo 'Found: '.S::safeHTML($version->getLongVersion());
	}
	/*
	 * Utility function for this particular plugin
	 * */
	function loadFramework($path = false, $debug = false) {
		define('_JEXEC', 1);
		if (!$path) {
			$path = $this->getSetting('path');
		}
		define(JPATH_ROOT, rtrim($path, '/'));
		try {
			$requiredFiles = array(
				'/includes/defines.php',
				'/includes/framework.php',
				'/libraries/joomla/factory.php'
			);
			foreach($requiredFiles as $file) {
				$filePath = gluePath(JPATH_ROOT, $file);
				if ($debug) {
					echo 'Loading '.$file.' ... ';
				}
				if (!is_file($filePath)) {
					$error = "Failed to load Joomla! framework. Make sure the path to the Joomla! installation folder is correct.";
					if ($debug) {
						echo $error;
						exit();
					}
					$this->errorCode = 'PLUGIN_CONFIG';
					$this->error = $error;
					return false;
				}
				require_once($filePath);
				if ($debug) {
					echo 'Done<br>';
				}
			}
		} catch (Exception $e) {
			echo 'Failed to load framework';
			$error = 'Joomla! error: '.$e->getMessage()."\n";
			if ($debug) {
				echo $error;
				exit();
			}
			$this->errorCode = 'PLUGIN_CONFIG';
			$this->error = $error;
			return false;
		}
		return true;
	}
	function singleSignOn() {
		$rs = $this->loadFramework();
		if (!$rs) {
			$this->errorCode = 'PLUGIN_CONFIG';
			return false;
		}
		JFactory::getApplication('site');
		$user = JFactory::getUser();
		if ($user->username && $user->guest == 0) {
			return $user->username;
		}
	}
	function getUserInfo($username, $password = false) {
		$db = JFactory::getDbo();
		if (!$db) {
			$this->error = "Failed to instantiate Joomla! database object.";
			return false;
		}
		$query = $db->getQuery(true)->select('id, password')->from('#__users')->where('username=' . $db->quote($username));
		if (!$query) {
			$this->error = "Failed to get Joomla! database query.";
			return false;
		}
		$db->setQuery($query);
		$result = $db->loadObject();
		if (!$result) {
			$this->errorCode = 'USERNAME_NOT_FOUND';//allows fall back to local authentication
			$this->error = 'The provided username is not valid';
			return false;
		}
		$userInfo = JUser::getInstance($result->id);
		if (!is_object($userInfo)) {
			$this->error = "The user has been successfully authenticated. However, the instantiation of the Joomla! user record failed.";
			return false;
		}
		if ($userInfo->block) {
			$this->errorCode = 'DEACTIVATED';
			$this->error = 'Login denied! Your account has either been blocked or you have not activated it yet.';
			return false;
		}
		if (strlen($userInfo->name) == 0) {
			$this->error = "The Joomla! user record is missing a name.";
			return false;
		}

		$hasSpace = strpos($userInfo->name, ' ');
		if ($hasSpace != -1) {
			$name = substr($userInfo->name, 0, $hasSpace);
			$name2 = substr($userInfo->name, $hasSpace+1);
		} else {
			$name = $userInfo->name;
			$name2 = '';
		}

		$rs = array(
			'remoteRecord' => $userInfo,
			'userData' => array(
				'name' => $name,
				'name2' => $name2,
				'email' => $userInfo->email,
				'receive_notifications' => $userInfo->sendEmail
			),
			'userPerms' => array(),
			'userGroups' => array('Joomla!')
		);
		if ($password) {//not present for SSO
			$rs['userData']['password'] = $password;
		}
		return $rs;
	}
	function authenticate($username, $password) {
		$rs = $this->loadFramework();
		if (!$rs) {return false;}
		$userInfo = $this->getUserInfo($username, $password);
		if (!$userInfo) {return false;}
		try {
			$match = JUserHelper::verifyPassword($password, $userInfo['remoteRecord']->password, $userInfo['remoteRecord']->id);
		} catch (Exception $e) {
			$this->errorCode = 'PLUGIN_CONFIG';
			$this->error = 'Joomla! error: '.$e->getMessage()."\n";
			return false;
		}
		if (!$match) {
			$this->errorCode = 'WRONG_PASS';
			$this->error = "Invalid password.";
			return false;
		} else {
			return $userInfo;
		}
	}
}
