<?php
/*
 * Allows HumHub users to access FileRun
 * */
class customAuth_humhub_v1b {
	var $ssoToken = true;
	function pluginDetails() {
		return array(
			'name' => 'HumHub (v1 beta)',
			'description' => 'Authenticate users against your existing HumHub users database.',
			'fields' => array(
				array(
					'label' => 'Server path of the HumHub installation folder',
					'name' => 'path',
					'required' => true
				)
			)
		);
	}
	function getSetting($fieldName) {
		global $settings;
		$keyName = 'auth_plugin_humhub_v1b_'.$fieldName;
		return $settings->$keyName;
	}
	function pluginTest($opts) {
		$pluginInfo = self::pluginDetails();
		//check required fields
		foreach($pluginInfo['fields'] as $field) {
			if ($field['required'] && !$opts['auth_plugin_humhub_v1b_'.$field['name']]) {
				return 'The field "'.$field['label'].'" needs to have a value.';
			}
		}
		//check folder existance
		if (!is_dir($opts['auth_plugin_humhub_v1b_path'])) {
			return 'The folder you specified for the HumHub installation does not exist.';
		}
		//check that folder has index.php
		if (!is_file(gluePath($opts['auth_plugin_humhub_v1b_path'], '/index.php'))) {
			return 'No PHP application was found inside the folder you specified.';
		}
		//check for required files
		$requiredFiles = array(
			'/protected/vendor/autoload.php',
			'/protected/vendor/yiisoft/yii2/Yii.php',
			'/protected/humhub/config/common.php',
			'/protected/humhub/config/web.php',
			'/protected/config/web.php',
			'/protected/config/common.php'
		);
		foreach($requiredFiles as $file) {
			$filePath = gluePath($opts['auth_plugin_humhub_v1b_path'], $file);
			if (!is_file($filePath)) {
				return 'The required HumHub file "'.$file.'" was not found.';
			}
		}
		echo 'HumHub installation found at the specified location.';
	}
	function loadFrameWork() {
		require(gluePath($this->getSetting('path'), '/protected/vendor/autoload.php'));
		require(gluePath($this->getSetting('path'), '/protected/vendor/yiisoft/yii2/Yii.php'));

		$config = yii\helpers\ArrayHelper::merge(
			require(gluePath($this->getSetting('path'), '/protected/humhub/config/common.php')),
			require(gluePath($this->getSetting('path'), '/protected/humhub/config/web.php')),
			(is_readable(gluePath($this->getSetting('path'), '/protected/config/dynamic.php'))) ? require(gluePath($this->getSetting('path'),'/protected/config/dynamic.php')) : array(),
			require(gluePath($this->getSetting('path'), '/protected/config/common.php')),
			require(gluePath($this->getSetting('path'), '/protected/config/web.php'))
		);
		$this->humhub = new humhub\components\Application($config);
	}
	function singleSignOn() {
		$this->loadFrameWork();
		$username = $this->humhub->user->identity->username;
		if ($username) {
			return $username;
		}
	}
	function getUserInfo($username) {
		$user = $this->humhub->user->identity->findOne(array('email' => $username));
		if (!is_object($user)) {
			$this->errorCode = 'USERNAME_NOT_FOUND';//allows fall back to local authentication
			$this->error = 'The provided username is not valid';
			return false;
		}
		return array(
			'remoteRecord' => $user,
			'userData' => array(
				'name' => $user->profile->firstname,
				'name2' => $user->profile->lastname,
				'email' => $user->email
			),
			'userPerms' => array(),
			'userGroups' => array('HumHub')
		);
	}
	function authenticate($username, $password) {
		$this->loadFrameWork();

		$loginModel = new \humhub\modules\user\models\forms\AccountLogin;
		$rs = $loginModel->load(array(
			'username' => $username,
			'password' => $password
		), '');
		if (!$rs) {
			return false;
		}
		$rs = $loginModel->login();
		if (!$rs) {
			$this->errorCode = 'USERNAME_NOT_FOUND';//fall back to local authentication
			$this->error = 'The provided username is not valid';
			return false;
		}
		return $this->getUserInfo($username);
	}
}
