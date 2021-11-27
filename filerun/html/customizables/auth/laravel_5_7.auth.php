<?php
/*
 * Plugin for allowing Laravel users to access FileRun
 *
 * */

class customAuth_laravel_5_7 {

	function pluginDetails() {
		return [
			'name' => 'Laravel (v5.7)',
			'description' => 'Authenticate users against your existing Laravel users database.<br>(For single-sign-on, FileRun needs to be installed on the same hostname as the Laravel installation.)',
			'fields' => [
				[
					'label' => 'Server path of your Laravel installation folder',
					'name' => 'path',
					'required' => true
				],
				[
					'name' => 'test_email',
					'label' => 'Test email',
					'default' => ''
				],
				[
					'name' => 'test_password',
					'label' => 'Test password',
					'default' => ''
				]
			]
		];
	}

	static function getSetting($fieldName) {
		global $settings;
		$keyName = 'auth_plugin_laravel_5_7_'.$fieldName;
		return $settings->$keyName;
	}

	function pluginTest($opts) {
		$pluginInfo = self::pluginDetails();
		//check required fields
		foreach($pluginInfo['fields'] as $field) {
			if ($field['required'] && !$opts['auth_plugin_laravel_5_7_'.$field['name']]) {
				return 'The field "'.$field['label'].'" needs to have a value.';
			}
		}
		//check folder
		if (!is_dir($opts['auth_plugin_laravel_5_7_path'])) {
			return 'The folder you specified for the Laravel installation does not exist.';
		}
		//check for required files
		$requiredFiles = [
			'vendor/autoload.php',
			'bootstrap/app.php'
		];
		foreach($requiredFiles as $file) {
			$filePath = gluePath($opts['auth_plugin_laravel_5_7_path'], $file);
			if (!is_file($filePath)) {
				return 'The required Laravel file "'.$file.'" was not found.';
			}
		}
		$laravel = self::loadFrameWork(['root' => $opts['auth_plugin_laravel_5_7_path']]);
		if ($laravel) {
			echo 'Found Laravel '.$laravel->version();
			if ($opts['auth_plugin_laravel_5_7_test_email']) {
				echo '<br>';
				if (!\Illuminate\Support\Facades\DB::table('users')->where('email', $opts['auth_plugin_laravel_5_7_test_email'])->first()) {
					return 'The test e-mail address was not found in the Laravel database!';
				}
				$credentials = [
					'email' => $opts['auth_plugin_laravel_5_7_test_email'],
					'password' => $opts['auth_plugin_laravel_5_7_test_password']
				];
				$success = \Illuminate\Support\Facades\Auth::attempt($credentials);
				if ($success) {
					return 'The test credentials have been successfully verified.';
				}
				return 'The test credentials were rejected!';
			}
		} else {
			return 'Failed to load Laravel!';
		}
	}

	static function loadFrameWork($opts = []) {
		$root = $opts['root'] ?: self::getSetting('path');
		require gluePath($root, 'vendor/autoload.php');
		$laravel = require gluePath($root, 'bootstrap/app.php');
		$laravel->make('Illuminate\Contracts\Http\Kernel')->handle(\Illuminate\Http\Request::capture());
		@error_reporting(E_ALL & ~E_NOTICE & ~E_STRICT & ~E_DEPRECATED);
		return $laravel;
	}

	function singleSignOn() {
		self::loadFrameWork();
		if (!\Illuminate\Support\Facades\Auth::check()) {return false;}
		$userInfo = $this->getUserInfo();
		return $userInfo['userData']['email'];
	}

	function getUserInfo($username = false) {
		$user = \Illuminate\Support\Facades\Auth::user();
		return [
			'userData' => [
				'name' => $user->name,
				'name2' => '',
				'email' => (string) $user->email
			],
			'userPerms' => [],
			'userGroups' => ['Laravel']
		];
	}

	function authenticate($username, $password) {
		self::loadFrameWork();
		if (!\Illuminate\Support\Facades\DB::table('users')->where('email', $username)->first()) {
			$this->error = 'E-mail address was not found!';
			$this->errorCode = 'USERNAME_NOT_FOUND';//allows local user accounts to login, if enabled
			return false;
		}
		$success = \Illuminate\Support\Facades\Auth::attempt([
			'email' => $username,
			'password' => $password
		]);
		if (!$success) {
			$this->errorCode = 'WRONG_PASS';//allows FileRun to keep track of failed attempts
			$this->error = 'The provided credentials are not valid!';
			return false;
		}
		return $this->getUserInfo();
	}
}