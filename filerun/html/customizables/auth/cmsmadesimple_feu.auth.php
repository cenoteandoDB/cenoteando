<?php
/*
 * Allows CMS Made Simple users to access FileRun
 * */
class customAuth_cmsmadesimple_feu {
	var $ssoToken = true;
	function pluginDetails() {
		return array(
			'name' => 'CMS Made Simple (v1 - FEU)',
			'description' => 'Authenticate users against your existing CMS Made Simple (with FrontEnd Users module) users database.',
			'fields' => array(
				array(
					'label' => 'Server path of the CMS made Simple installation folder',
					'name' => 'path',
					'required' => true
				)
			)
		);
	}
	function getSetting($fieldName) {
		global $settings;
		$keyName = 'auth_plugin_cmsmadesimple_feu_'.$fieldName;
		return $settings->$keyName;
	}
	function pluginTest($opts) {
		$pluginInfo = self::pluginDetails();
		//check required fields
		foreach($pluginInfo['fields'] as $field) {
			if ($field['required'] && !$opts['auth_plugin_cmsmadesimple_feu_'.$field['name']]) {
				return 'The field "'.$field['label'].'" needs to have a value.';
			}
		}
		//check folder existance
		if (!is_dir($opts['auth_plugin_cmsmadesimple_feu_path'])) {
			return 'The folder you specified for the CMS Made Simple installation does not exist.';
		}
		//check that folder has index.php
		if (!is_file(gluePath($opts['auth_plugin_cmsmadesimple_feu_path'], '/index.php'))) {
			return 'No PHP application was found inside the folder you specified.';
		}
		//check for required files
		$requiredFiles = array(
			'/config.php',
			'/version.php'
		);
		foreach($requiredFiles as $file) {
			$filePath = gluePath($opts['auth_plugin_cmsmadesimple_feu_path'], $file);
			if (!is_file($filePath)) {
				return 'The required CMS Made Simple file "'.$file.'" was not found.';
			}
		}
		require_once(gluePath($opts['auth_plugin_cmsmadesimple_feu_path'],'/version.php'));
		if ($CMS_VERSION) {
			echo 'Found CMS Made Simple '.$CMS_VERSION;
		} else {
			echo 'Failed to get application version';
		}
	}
	function dbConnect() {
		require_once(gluePath($this->getSetting('path'),'/config.php'));
		$this->cmsconfig = $config;
		if ($config['dbms'] == 'mysqli') {
			$dbtype = 'mysql';
		} else {
			$dbtype = $config['dbms'];
		}
		try {
			$this->dbh = new PDO($dbtype.':host='.$config['db_hostname'].';dbname='.$config['db_name'], $config['db_username'], $config['db_password']);
			$this->dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
			return true;
		} catch (PDOException $e) {
			$this->errorCode = 'PLUGIN_CONFIG';
			$this->error = 'Connection to the database failed!'.$e->getMessage();
			return false;
		}
	}
	function getUserInfo($username = false, $uid = false) {
		try {
			if ($username) {
				$query = 'SELECT * FROM `' . $this->cmsconfig['db_prefix'] . 'module_feusers_users` WHERE `username`=' . $this->dbh->quote($username) . '';
			} else {
				$query = 'SELECT * FROM `' . $this->cmsconfig['db_prefix'] . 'module_feusers_users` WHERE `id`=' . $this->dbh->quote($uid) . '';
			}
			$rs = $this->dbh->query($query);
		} catch(Exception $e) {
			$this->errorCode = 'PLUGIN_CONFIG';
			$this->error = 'Failed to query the database for the user record!'.$e->getMessage();
			return false;
		}
		try {
			$userInfo = $rs->fetch(PDO::FETCH_ASSOC);
		} catch(Exception $e) {
			$this->errorCode = 'PLUGIN_CONFIG';
			$this->error = 'Failed to fetch the database record!'.$e->getMessage();
			return false;
		}
		if (!$userInfo) {
			$this->errorCode = 'USERNAME_NOT_FOUND';//allows fall back to local authentication
			$this->error = 'The provided username is not valid';
			return false;
		}
		return array(
			'remoteRecord' => $userInfo,
			'userData' => array(
				'name' => $userInfo['username'],
				'email' => $userInfo['username']
			),
			'userPerms' => array(),
			'userGroups' => array('CMS Made Simple FEU')
		);
	}
	function singleSignOn() {
		$rs = $this->dbConnect();
		if (!$rs) {return false;}
		$rootPath = realpath($this->getSetting('path'));
		$session_key = substr(md5($rootPath), 0, 8);
		$session_key = 'CMSSESSID'.$session_key;
		@session_name($session_key);
		session_start();
		try {
			$query = 'SELECT * FROM `'.$this->cmsconfig['db_prefix'].'module_feusers_loggedin` WHERE `sessionid`='.$this->dbh->quote(session_id()).'';
			$rs = $this->dbh->query($query);
		} catch(Exception $e) {
			$this->errorCode = 'PLUGIN_CONFIG';
			$this->error = 'Failed to query database for session data!'.$e->getMessage();
			return false;
		}
		try {
			$record = $rs->fetch(PDO::FETCH_ASSOC);
		} catch(Exception $e) {
			$this->errorCode = 'PLUGIN_CONFIG';
			$this->error = 'Failed to fetch the session record!'.$e->getMessage();
			return false;
		}
		if (!$record['userid']) {
			return false;
		}
		$userInfo = $this->getUserInfo(false, $record['userid']);
		if ($userInfo['remoteRecord']['username']) {
			return $userInfo['remoteRecord']['username'];
		}
	}
	function authenticate($username, $password) {
		$rs = $this->dbConnect();
		if (!$rs) {return false;}
		$userInfo = $this->getUserInfo($username);
		if (!$userInfo) {return false;}
		try {
			$query = 'SELECT * FROM `'.$this->cmsconfig['db_prefix'].'siteprefs` WHERE `sitepref_name`=\'FrontEndUsers_mapi_pref_pwsalt\'';
			$rs = $this->dbh->query($query);
		} catch(Exception $e) {
			$this->errorCode = 'PLUGIN_CONFIG';
			$this->error = 'Failed to query database for sitemask!'.$e->getMessage();
			return false;
		}
		try {
			$record = $rs->fetch(PDO::FETCH_ASSOC);
		} catch(Exception $e) {
			$this->errorCode = 'PLUGIN_CONFIG';
			$this->error = 'Failed to fetch the sitemask record!'.$e->getMessage();
			return false;
		}
		$pwsalt = $record['sitepref_value'];
		$match = (md5(trim($password).$pwsalt) == $userInfo['remoteRecord']['password']);
		if (!$match) {
			$this->errorCode = 'WRONG_PASS';
			$this->error = "Invalid password.";
			return false;
		} else {
			return $userInfo;
		}
	}
}
