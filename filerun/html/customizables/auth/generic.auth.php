<?php
/*
 * Plugin for authenticating users from various database sources
 *
 * */
class customAuth_generic {
	function pluginDetails() {
		return array(
			'name' => 'Generic (SQL)',
			'description' => 'Authenticate users against an SQL database. It uses PHP\'s PDO extension which supports MySQL, PostgreSQL, SQLite, MS SQL, Oracle, IBM, etc.',
			'fields' => array(
				array(
					'label' => 'DSN',
					'name' => 'dsn',
					'default' => 'mysql:host=localhost;dbname=temp_wordpress',
					'required' => true
				),
				array(
					'label' => 'Username',
					'name' => 'username'
				),
				array(
					'label' => 'Password',
					'name' => 'password'
				),
				array(
					'label' => 'Table name',
					'name' => 'table',
					'default' => 'wp_users',
					'required' => true
				),
				array(
					'label' => 'Username column name',
					'name' => 'username_column',
					'default' => 'user_login',
					'required' => true
				),
				array(
					'label' => 'Password column name',
					'name' => 'password_column',
					'default' => 'user_pass',
					'required' => true
				),
				array(
					'label' => 'Password encryption method (plain, md5, sha1, password_hash, custom)',
					'name' => 'encryption_method',
					'default' => 'md5',
					'required' => true
				),
				array(
					'label' => 'First name column name',
					'name' => 'name_column',
					'default' => 'display_name',
					'required' => true
				),
				array(
					'label' => 'Last name column name',
					'name' => 'name2_column',
					'default' => ''
				),
				array(
					'label' => 'E-mail column name',
					'name' => 'email_column',
					'default' => 'user_email'
				),
				array(
					'label' => 'Test username',
					'name' => 'test_username',
					'default' => 'wpadmin'
				),
				array(
					'label' => 'Test password',
					'name' => 'test_password',
					'default' => 'password'
				)
			)
		);
	}
	function getSetting($fieldName) {
		global $settings;
		$keyName = 'auth_plugin_generic_'.$fieldName;
		return $settings->$keyName;
	}
	function pluginTest($opts) {

		$pluginInfo = self::pluginDetails();
		foreach($pluginInfo['fields'] as $field) {
			if ($field['required'] && !$opts['auth_plugin_generic_'.$field['name']]) {
				return 'The field "'.$field['label'].'" needs to have a value.';
			}
		}
		try {
			$dbh = new PDO($opts['auth_plugin_generic_dsn'], $opts['auth_plugin_generic_username'], $opts['auth_plugin_generic_password']);
			$dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		} catch (PDOException $e) {
			echo "Failed to connect: ".$e->getMessage()."\n";
			return false;
		}
		echo 'Successfully connected to the database.';
		try {
			$query = 'SELECT * FROM `'.$opts['auth_plugin_generic_table'].'` WHERE `'.$opts['auth_plugin_generic_username_column'].'`='.$dbh->quote($opts['auth_plugin_generic_test_username']);
			$rs = $dbh->query($query);
		} catch(Exception $e) {
			echo 'Select query failed'.$e->getMessage();
			return false;
		}
		echo '<br>';
		echo 'Select query executed successfully.';
		try {
			$record = $rs->fetch(PDO::FETCH_ASSOC);
		} catch(Exception $e) {
			echo 'Fetching record failed'.$e->getMessage();
			return false;
		}
		if (array($record)) {
			echo '<br>Record fetched:';
			echo '<div style="background-color:whitesmoke;margin:5px;border:1px solid silver">';
			foreach ($record as $k => $a) {
				echo '<div style="margin-left:10px;">'.S::safeHTML($k).': '.S::safeHTML($a).'</div>';
			}
			echo '</div>';
		}
		echo 'Fields mapping:';
		echo '<div style="background-color:whitesmoke;margin:5px;border:1px solid silver">';
		echo '<div style="margin-left:10px;">First name ('.$opts['auth_plugin_generic_name_column'].'): '.S::safeHTML($record[$opts['auth_plugin_generic_name_column']]).'</div>';
		echo '<div style="margin-left:10px;">Last name ('.$opts['auth_plugin_generic_name2_column'].'): '.S::safeHTML($record[$opts['auth_plugin_generic_name2_column']]).'</div>';
		echo '<div style="margin-left:10px;">E-mail ('.$opts['auth_plugin_generic_email_column'].'): '.S::safeHTML($record[$opts['auth_plugin_generic_email_column']]).'</div>';
		echo '</div>';

		$typedPass = $opts['auth_plugin_generic_test_password'];
		$storedPass = $record[$opts['auth_plugin_generic_password_column']];
		if (!$storedPass) {
			echo 'No password found. Make sure the password column name is correct.';
		}
		$method = $opts['auth_plugin_generic_encryption_method'];

		if (self::verifyPassword($method, $typedPass, $storedPass)) {
			echo 'Password successfully verified.';
		} else {
			echo 'Password verification failed!';
		}
	}
	static function encryptPass($method, $typed, $storedPass = false) {
		if ($method == 'plain') {
			return $typed;
		} else if ($method == 'md5') {
			return md5($typed);
		} else if ($method == 'sha1') {
			return sha1($typed);
		} else if ($method == 'md5salted') {
			$parts = explode(':', $storedPass);
			return md5($typed.$parts[1]).':'.$parts[1];
		} else if ($method == 'password_hash') {
			return password_hash($typed, PASSWORD_DEFAULT);
		} else {
			$funcName = 'encryptPass_'.$method;
			if (method_exists('customAuth_generic', $funcName)) {
				return self::$funcName($typed);
			}
		}
	}
	//example custom password encryption function
	function encryptPass_custom($typed) {
		return $typed;//do something here with the password
	}
	static function verifyPassword($method, $typed, $stored) {
		if ($method == 'password_hash') {
			return password_verify($typed, $stored);
		} else if ($method == 'md5salted') {
			$parts = explode(':', $stored);
			return (md5($typed.$parts[1]).':'.$parts[1] == $stored);
		} else {
			$encrypted = self::encryptPass($method, $typed);
			return ($encrypted == $stored);
		}
	}
	function dbConnect() {
		try {
			$this->dbh = new PDO($this->getSetting('dsn'), $this->getSetting('username'), $this->getSetting('password'));
			$this->dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		} catch (PDOException $e) {
			$this->errorCode = 'PLUGIN_CONFIG';
			$this->error = 'Connection to the database failed!'.$e->getMessage();
			return false;
		}
	}
	function getUserInfo($username) {
		if (!$this->dbh) {
			$this->dbConnect();
		}
		try {
			$query = 'SELECT * FROM `'.$this->getSetting('table').'` WHERE `'.$this->getSetting('username_column').'`='.$this->dbh->quote($username);
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
				'name' => $userInfo[$this->getSetting('name_column')],
				'name2' => $userInfo[$this->getSetting('name2_column')],
				'email' => $userInfo[$this->getSetting('email_column')]
			),
			'userPerms' => array(),
			'userGroups' => array('Generic/PDO')
		);
	}
	function authenticate($username, $password) {
		$this->dbConnect();
		$userInfo = $this->getUserInfo($username);
		if (!$userInfo) {return false;}
		$match = $this->verifyPassword($this->getSetting('encryption_method'), $password, $userInfo['remoteRecord'][$this->getSetting('password_column')]);
		if (!$match) {
			$this->errorCode = 'WRONG_PASS';//allows FileRun to keep track of failed attempts
			$this->error = "Invalid password.";
			return false;
		} else {
			return $userInfo;
		}
	}
}