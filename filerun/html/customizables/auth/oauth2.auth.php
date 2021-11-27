<?php
/*
 * Plugin for authenticating FileRun users via an OAuth2 server
 * For help, see: https://docs.filerun.com/oauth2
 *
 * */

use \FileRun\OAuth2\Client\GenericProvider;


class customAuth_oauth2 {

	var $error, $errorCode, $cid, $userRecord, $resourceOwnerData;

	static function pluginDetails() {
		return [
			'name' => 'OAuth2',
			'description' => 'Authenticate users via OAuth2. [<a href="https://docs.filerun.com/oauth2" target="_blank">Help</a>]',
			'fields' => [
				[
					'label' => 'Redirect URL',
					'default' => self::getRedirectURL()
				],
				[
					'name' => 'clientId',
					'label' => 'Client ID',
					'default' => '',
					'required' => true
				],
				[
					'name' => 'clientSecret',
					'label' => 'Client Secret',
					'default' => '',
					'required' => true
				],
				[
					'name' => 'urlAuthorize',
					'label' => 'Authorization URL',
					'default' => '',
					'required' => true
				],
				[
					'name' => 'urlAccessToken',
					'label' => 'Access Token URL',
					'default' => '',
					'required' => true
				],
				[
					'name' => 'accessTokenExpires',
					'label' => 'Token requires refresh',
					'default' => 'no',
					'required' => true,
					'helpText' => '"yes" or "no"'
				],
				[
					'name' => 'scopes',
					'label' => 'List of scopes',
					'default' => ''
				],
				[
					'name' => 'scopeSeparator',
					'label' => 'Scopes separator character',
					'default' => ','
				],
				[
					'name' => 'urlResourceOwnerDetails',
					'label' => 'User info API URL',
					'default' => '',
					'required' => true
				],
				[
					'name' => 'resourceOwnerHTTPMethod',
					'label' => 'User info HTTP method',
					'default' => 'GET',
					'required' => true,
					'helpText' => '"POST" or "GET"'
				],
				[
					'name' => 'debugResourceOwnerServerResponse',
					'label' => 'Debug server response',
					'default' => 'no',
					'helpText' => 'Set this to "yes" to view the server\'s API response.'
				],
				[
					'name' => 'mapping_username',
					'label' => 'Username mapping',
					'default' => '$.username',
					'required' => true,
					'helpText' => 'JSONPath selector'
				],
				[
					'name' => 'mapping_name',
					'label' => 'First name mapping',
					'default' => '$.name.given_name',
					'required' => true,
					'helpText' => 'JSONPath selector'
				],
				[
					'name' => 'mapping_name2',
					'label' => 'Last name mapping',
					'default' => '$.name.surname',
					'helpText' => 'JSONPath selector'
				],
				[
					'name' => 'mapping_email',
					'label' => 'E-mail mapping',
					'default' => '$.email',
					'helpText' => 'JSONPath selector'
				]
			]
		];
	}

	static function getSetting($fieldName) {
		global $settings;
		$keyName = 'auth_plugin_oauth2_'.$fieldName;
		return $settings->$keyName;
	}

	static function getRedirectURL() {
		global $config;
		return $config['url']['root'].'/?module=fileman&page=sso';
	}

	static function getProvider($opts) {
		if ($opts['auth_plugin_oauth2_resourceOwnerHTTPMethod']) {
			GenericProvider::$resourceOwnerHTTPMethod = $opts['auth_plugin_oauth2_resourceOwnerHTTPMethod'];
		}
		return new GenericProvider([
			'clientId'                => $opts['auth_plugin_oauth2_clientId'],
			'clientSecret'            => $opts['auth_plugin_oauth2_clientSecret'],
			'redirectUri'             => self::getRedirectURL(),
			'urlAuthorize'            => $opts['auth_plugin_oauth2_urlAuthorize'],
			'urlAccessToken'          => $opts['auth_plugin_oauth2_urlAccessToken'],
			'urlResourceOwnerDetails' => $opts['auth_plugin_oauth2_urlResourceOwnerDetails'],
			'scopes'                  => explode($opts['auth_plugin_oauth2_scopeSeparator'], $opts['auth_plugin_oauth2_scopes']),
			'scopeSeparator'          => $opts['auth_plugin_oauth2_scopeSeparator']
		]);
	}

	static function pluginTest($opts) {
		$pluginInfo = self::pluginDetails();
		//check required fields
		foreach($pluginInfo['fields'] as $field) {
			if ($field['required'] && !$opts['auth_plugin_oauth2_'.$field['name']]) {
				return 'The field "'.$field['label'].'" needs to have a value.';
			}
		}
		$provider = self::getProvider($opts);
		$authorizationUrl = $provider->getAuthorizationUrl();
		echo 'Click <a href="'.$authorizationUrl.'" target="_blank">here</a> to test the OAuth2 server\'s consent page.';
		return false;
	}

	function singleSignOn() {
		global $settings, $auth;
		$provider = self::getProvider($settings->toArray());
		$auth->initPHPSession();

		if (isset($_SESSION['oauth2_access_token'])) {
			$accessToken = $_SESSION['oauth2_access_token'];
			if ($accessToken && self::getSetting('accessTokenExpires') == 'yes' && $accessToken->hasExpired()) {
				try {
					$accessToken = $provider->getAccessToken('refresh_token', [
						'refresh_token' => $accessToken->getRefreshToken()
					]);
				} catch (\League\OAuth2\Client\Provider\Exception\IdentityProviderException $e) {
					$rs = $e->getResponseBody();
					$this->error = 'Oauth2 error ('.$e->getCode().'): Failed to refresh access token: '.$rs['error_description'];
					$this->errorCode = 'OTHER';
					return false;
				}
			}
		} else {
			if (!isset($_GET['code'])) {
				$authorizationUrl = $provider->getAuthorizationUrl();
				$_SESSION['oauth2state'] = $provider->getState();
				header('Location: ' . $authorizationUrl);
				exit();
			}
			if (!empty($_GET['state']) && $_GET['state'] !== $_SESSION['oauth2state']) {
				$this->error = 'OAuth2 error: the provided state is not matching the stored one!';
				$this->errorCode = 'OTHER';
				return false;
			}
			try {
				$accessToken = $provider->getAccessToken('authorization_code', [
					'code' => $_GET['code']
				]);
			} catch (\League\OAuth2\Client\Provider\Exception\IdentityProviderException $e) {
				$rs = $e->getResponseBody();
				$this->error = 'OAuth2 error ('.$e->getCode().'): Failed to retrieve access token: '.$rs['error_description'];
				$this->errorCode = 'OTHER';
				return false;
			}
			$_SESSION['oauth2_access_token'] = $accessToken;
		}
		$resourceOwner = $provider->getResourceOwner($accessToken);
		$resourceOwnerDetails = $resourceOwner->toArray();
		$this->resourceOwnerData = $this->parseResorceOwnerData($resourceOwnerDetails);

		if (self::getSetting('debugResourceOwnerServerResponse') == 'yes') {
			header('Content-type: text/plain');
			echo 'Debugging server response and user details mapping.';
			echo "\r\n\r\n";
			echo 'To skip this step, set "Debug server response" to "no" in the OAuth2 authentication plugin settings.';
			echo "\r\n\r\n";
			print_r([
				'Server response' => $resourceOwnerDetails,
				'Mapping settings' => [
					'Username' => self::getSetting('mapping_username'),
					'First name' => self::getSetting('mapping_username'),
					'Last name' => self::getSetting('mapping_name2'),
					'E-mail address' => self::getSetting('mapping_email')
				],
				'Values after mapping' => $this->resourceOwnerData
			]);
			echo "\r\n\r\n";
			if ($this->resourceOwnerData['username']) {
				echo 'You are being signed into FileRun with the following username: ' . $this->resourceOwnerData['username'];
			} else {
				echo 'Looks like the mapping settings are not correct, as no username was assigned!';
			}
			exit();
		}
		return $this->resourceOwnerData['username'];
	}

	function parseResorceOwnerData(array $data) {
		$jsonPath = new \Flow\JSONPath\JSONPath($data);
		$data = [];
		$data['username'] = $this->getField($jsonPath, 'username');
		$data['name'] = $this->getField($jsonPath, 'name');
		$data['name2'] = $this->getField($jsonPath, 'name2');
		$data['email'] = $this->getField($jsonPath, 'email');
		return $data;
	}

	function getField(\Flow\JSONPath\JSONPath $jsonPath, $fieldName) {
		$selector = self::getSetting('mapping_'.$fieldName);
		$value = $jsonPath->find($selector)[0];
		$data[$fieldName] = is_string($value) ? $value : false;
		if (!is_string($value) || empty($value)) {
			$this->errorCode = 'PLUGIN_OATH2_MAP_FAIL';
			$this->error = 'Error: Failed to retrieve the field "'.$fieldName.'" using the JSONPath selector "'.$selector.'" from: <pre>'.var_export($jsonPath->data(), true).'</pre>';
			return false;
		}
		return $value;
	}

	function getUserInfo($username) {
		return [
			'userData' => $this->resourceOwnerData,
			'userPerms' => [],
			'userGroups' => ['OAuth2']
		];
	}

	function authenticate($username, $password) {
		$this->error = "Please use the SSO (Single Sign On) button.";
		$this->errorCode = 'USERNAME_NOT_FOUND';//allows local user accounts to login, if enabled
		return false;
	}

	function logout() {
		if (isset($_SESSION['oauth2_access_token'])) {
			unset($_SESSION['oauth2_access_token']);
		}
	}
}
