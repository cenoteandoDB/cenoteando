<?php
/*
 * Plugin for authenticating FileRun users against a LDAP directory
 *
 * */
class customAuth_ldap {

	var $error, $errorCode, $cid, $userRecord;

	static function pluginDetails() {
		return [
			'name' => 'LDAP',
			'description' => 'Authenticate users against LDAP.',
			'fields' => [
				[
					'name' => 'host',
					'label' => 'Server hostname',
					'default' => 'ldap.forumsys.com',
					'required' => true,
					'helpText' => 'For a SSL connection start the hostname with "ldaps://"'
				],
				[
					'name' => 'port',
					'label' => 'Server port number',
					'default' => 389
				],
				[
					'name' => 'bind_dn',
					'label' => 'Bind DN',
					'default' => 'cn=read-only-admin,dc=example,dc=com',
					'helpText' => 'If you leave the field empty, the bind will be made anonymously.'
				],
				[
					'name' => 'bind_password',
					'label' => 'Bind password',
					'default' => 'password'
				],
				[
					'name' => 'user_dn',
					'label' => 'User DN template',
					'default' => 'uid={USERNAME},dc=example,dc=com',
					'required' => true,
					'helpText' => 'This takes the username the user typed into the FileRun login form (without the domain) and uses it to construct the bind DN.'
				],
				[
					'name' => 'search_dn',
					'label' => 'Search DN',
					'default' => 'dc=example,dc=com',
					'required' => true,
					'helpText' => 'This is your domain\'s base DN, where the user record search will start from.'
				],
				[
					'name' => 'search_filter',
					'label' => 'Search filter template',
					'default' => '(&(uid={USERNAME})(objectClass=person))',
					'required' => true,
					'helpText' => '{USERNAME} gets replaced with the typed username.'
				]/*,
				[
					'name' => 'use_memberOf',
					'label' => 'Use "memberOf" for groups',
					'default' => 'no'
				]*/,
				[
					'name' => 'groups_ad_chain',
					'label' => 'Use LDAP-MATCHING-RULE-IN-CHAIN to retrieve nested groups',
					'default' => 'no',
					'helpText' => 'If set to "yes", FileRun will retrieve the list of groups the user is member of, when these groups are organized in a hierarchy. Enabling this will disable the use of "Groups search filter".'
				],
				[
					'name' => 'groups_search_filter',
					'label' => 'Groups search filter',
					'default' => '(objectClass=groupOfUniqueNames)',
					'helpText' => 'This option is in use only when "Use LDAP-MATCHING-RULE-IN-CHAIN to retrieve nested groups" is set to "no".<br>It is used to find a user\'s list of groups, based on the configured "Groups member attribute".'
				],
				[
					'name' => 'groups_member_attribute',
					'label' => 'Groups member attribute',
					'default' => 'uniquemember'
				],
				[
					'name' => 'groups_to_import',
					'label' => 'Groups to import',
					'default' => '',
					'helpText' => 'Comma separated list of group names that will be created inside FileRun.'
				],
				[
					'name' => 'groups_to_allow_access',
					'label' => 'Groups to allow access to',
					'default' => '',
					'helpText' => 'Comma separated list of group names the LDAP users need to be members of in order to be allowed access.<br>The groups need to be included in the list of "groups to import".'
				],
				[
					'name' => 'use_homeDirectory',
					'label' => 'Use "homeDirectory"',
					'default' => 'yes',
					'helpText' => 'If set to "yes" and the LDAP user records are configured with "homeDirectory", FileRun will use this path for the user\'s home folders. Please note that this must be a fully qualified local path including the drive letter.'
				],
				[
					'name' => 'allow_iwa_sso',
					'label' => 'Enable IWA SSO',
					'default' => 'no',
					'helpText' => 'Set to "yes" allows users that are authenticated on the local domain using "Windows Integrated Authentication" to get automatically signed into FileRun, without having to type in any username or password.'
				],
				[
					'name' => 'mapping_name',
					'label' => 'First name field',
					'default' => 'cn',
					'required' => true
				],
				[
					'name' => 'mapping_name2',
					'label' => 'Last name field',
					'default' => 'cn'
				],
				[
					'name' => 'mapping_email',
					'label' => 'E-mail field',
					'default' => 'mail'
				],
				[
					'name' => 'mapping_company',
					'label' => 'Company name field',
					'default' => ''
				],
				[
					'name' => 'test_username',
					'label' => 'Test username',
					'default' => 'einstein'
				],
				[
					'name' => 'test_password',
					'label' => 'Test password',
					'default' => 'password'
				]
			]
		];
	}
	static function pluginTest($opts) {
		global $config;
		$pluginInfo = self::pluginDetails();
		//check required fields
		foreach($pluginInfo['fields'] as $field) {
			if ($field['required'] && !$opts['auth_plugin_ldap_'.$field['name']]) {
				return 'The field "'.$field['label'].'" needs to have a value.';
			}
		}
		require_once($config['path']['root'].'/customizables/auth/ldap.test.php');
		echo customAuth_ldap_test($opts);
		return false;
	}

	function getSetting($fieldName) {
		global $settings;
		$keyName = 'auth_plugin_ldap_'.$fieldName;
		return $settings->$keyName;
	}

	function ssoEnabled() {
		if ($this->getSetting('allow_iwa_sso') != 'yes') {
			$this->error = 'IWA SSO needs to be set to "yes" in the authentication plugin\'s settings';
			return false;
		}
		if (!$this->getSetting('bind_dn')) {
			$this->error = 'Plugins requires a bind_dn for SSO to work';
			return false;
		}
		return true;
	}
	
	function singleSignOn() {
		if (!$this->ssoEnabled()) {return false;}
		$rs = $this->ldapConnect();
		if (!$rs) {return false;}
		$username = S::fromHTML($_SERVER['AUTH_USER']);
		$backSlashPos = strpos($username, '\\');
		if ($backSlashPos !== false) {
			$username = substr($username, $backSlashPos+1);
		}
		if (!$username) {return false;}
		return $username;
	}

	function ldapConnect($username = false, $password = false) {
		if ($this->cid) {return true;}
		$this->cid = ldap_connect($this->getSetting('host'), $this->getSetting('port'));
		if (!$this->cid) {
			$this->errorCode = 'PLUGIN_CONFIG';
			$this->error = 'Connection to the LDAP server failed!';
			return false;
		}
		ldap_set_option($this->cid, LDAP_OPT_PROTOCOL_VERSION, 3);
		ldap_set_option($this->cid, LDAP_OPT_REFERRALS, 0);
		if ($this->getSetting('bind_dn')) {
			$rs = @ldap_bind($this->cid, $this->getSetting('bind_dn'), $this->getSetting('bind_password'));
			if (!$rs) {
				//"Bind failed: ".ldap_error($cid);
				$this->errorCode = 'PLUGIN_CONFIG';
				$this->error = 'Authentication with the bind DN failed';
				return false;
			}
		} else {
			$user_bind_dn = str_replace('{USERNAME}', $username, $this->getSetting('user_dn'));
			$rs = @ldap_bind($this->cid, $user_bind_dn, $password);
			if (!$rs) {
				$this->errorCode = 'WRONG_PASS';
				$this->error = "Invalid password.";
				return false;
			}
		}
		return true;
	}

	function getUserInfo($username, $password = false) {
		$this->userRecord = $this->getRemoteUserRecord($username);
		if (!$this->userRecord) {
			$this->errorCode = 'USERNAME_NOT_FOUND';//allows fall back to local authentication
			$this->error = 'The username was not found in the remote database';
			return false;
		}
		$rs = $this->formatUserDetails($this->userRecord);
		if (!$rs) {return false;}
		if ($password) {//not present for SSO
			$rs['userData']['password'] = $password;
		}
		$rs['userGroups'] = $this->getUsersGroups();
		return $rs;
	}

	function formatUserDetails($remoteRecord) {
		if (!is_array($remoteRecord)) {
			$remoteRecord = ldap_get_attributes($this->cid, $remoteRecord);
		}
		$values = [];
		if (is_array($remoteRecord)) {
			foreach ($remoteRecord as $k => $a) {
				if (!is_numeric($k) && $k != 'count') {
					$values[$k] = $a[0];
				}
			}
		}
		$mapName = $this->getSetting('mapping_name');
		$mapName2 = $this->getSetting('mapping_name2');

		$rs = self::formatName($values, $mapName, $mapName2);
		$name = $rs[0];
		$name2 = $rs[1];

		$userData = [
			'name' => $name,
			'name2' => $name2,
			'email' => $values[$this->getSetting('mapping_email')]
		];
		if ($values['uid']) {
			$userData['username'] = $values['uid'];
		}
		if ($values[$this->getSetting('mapping_company')]) {
			$userData['company'] = $values[$this->getSetting('mapping_company')];
		}
		$userPerms = array();
		if ($this->getSetting('use_homeDirectory') == 'yes') {
			if ($values['homeDirectory']) {
				$userPerms['homefolder'] = str_replace('\\', '/', $values['homeDirectory']);
				//$userPerms['homefolder'] = self::checkAndMount($userPerms['homefolder']);
			}
		}
		if (!$userData['name']) {
			$this->error = 'Missing name for the user record';
			return false;
		}
		return [
			'userData' => $userData,
			'userPerms' => $userPerms
		];
	}

	static function checkAndMount($homeFolderPath) {
		/* //MEPSFS01/Users$/testuser */
		if (substr($homeFolderPath, 0, 2) != '//') {
			return $homeFolderPath;
		}
		//is UNC path
		$newPath = substr($homeFolderPath, 2);//strip double-slash
		/* MEPSFS01/Users$/testuser */
		$serverName = 'MEPSFS01';
		$newPath = substr($newPath, 0, strlen($serverName));//strip server name
		/* /Users$/testuser */

		$shareRoot = '/Users$/';
		$newPath = substr($newPath, 0, strlen($shareRoot));//strip share root
		/* testuser */

		$mountRoot = '/files';
		$newPath = gluePath($mountRoot, $newPath);
		/* /files/testuser */

		if (!is_dir($newPath)) {
			//mount $UNC to $userPerms['homefolder']
			$newPath = $homeFolderPath;
		}
		return $newPath;
	}

	function getUsersGroups() {
		/*
		if ($this->getSetting('use_memberOf') == 'yes') {
		} else
		*/
		if ($this->getSetting('groups_ad_chain') == 'yes') {
			return $this->getNestedGroups();
		} else if ($this->getSetting('groups_search_filter')) {
			return $this->getGroupsUsingMemberAttr();
		} else {
			return [];
		}
	}

	function getNestedGroups() {
		$groups = [];
		$user_dn = ldap_get_dn($this->cid, $this->userRecord);
		if (!$user_dn) {return $groups;}
		$groupsToImport = $this->getGroupsToImport();
		$filter = "(member:1.2.840.113556.1.4.1941:=".$user_dn.")";
		$search = ldap_search($this->cid, $this->getSetting('search_dn'), $filter, ['dn'], 1);
		$entries = ldap_get_entries($this->cid, $search);
		if ($entries['count'] > 0) {
			foreach ($entries as $key => $entry) {
				$groupDN = ldap_explode_dn($entry['dn'], 1);
				$groupName = $groupDN[0];
				if ($groupsToImport) {
					if (in_array(mb_strtolower($groupName), $groupsToImport)) {
						$groups[] = $groupName;
					}
				}

			}
		}
		return $groups;
	}

	function getGroupsUsingMemberAttr() {
		$groups = [];
		$user_dn = ldap_get_dn($this->cid, $this->userRecord);
		if (!$user_dn) {return $groups;}
		$groupsToImport = $this->getGroupsToImport();
		$groups_member_attribute = $this->getSetting('groups_member_attribute');
		$a = ['cn', 'description', 'count'];
		$a[] = $groups_member_attribute;
		$searchForGroups = ldap_search($this->cid, $this->getSetting('search_dn'), $this->getSetting('groups_search_filter'), $a);
		$entries = ldap_get_entries($this->cid, $searchForGroups);
		if ($entries['count'] > 0) {
			foreach ($entries as $key => $entry) {
				if ($key == 'count') {continue;}
				$members = $entry[$groups_member_attribute];
				if (!$members) {continue;}
				$groupName = $entry['cn'][0];
				if ($groupsToImport) {
					if (!in_array(mb_strtolower($groupName), $groupsToImport)) {
						continue;
					}
				}
				if (in_array($user_dn, $members)) {
					$groups[] = $groupName;
				}
			}
		}
		return $groups;
	}

	function getGroupsToImport() {
		$val = trim($this->getSetting('groups_to_import'));
		if (strlen($val) == 0) {return false;}
		$rs = trim_array(explode(',', mb_strtolower($val)));
		$items = [];
		foreach($rs as $groupName) {
			if (!$groupName) {continue;}
			$items[] = $groupName;
		}
		return $items;
	}

	function getGroupsToAllow() {
		$val = trim($this->getSetting('groups_to_allow_access'));
		if (strlen($val) == 0) {return false;}
		$rs = trim_array(explode(',', mb_strtolower($val)));
		$items = [];
		foreach($rs as $groupName) {
			if (!$groupName) {continue;}
			$items[] = $groupName;
		}
		return $items;
	}

	static function formatName($values, $mapName, $mapName2) {
		if ($mapName == $mapName2) {
			$name = $values[$mapName];
			$parts = explode(" ", $name);
			$name = array_shift($parts);
			$name2 = implode(" ", $parts);
		} else {
			$name = $values[$mapName];
			$name2 = $values[$mapName2];
		}
		return [$name, $name2];
	}

	function getRemoteUserRecord($username) {
		$filter = str_replace("{USERNAME}", $username, $this->getSetting('search_filter'));
		$rs = @ldap_search($this->cid, $this->getSetting('search_dn'), $filter);
		if (!$rs) {
			$this->errorCode = 'PLUGIN_CONFIG';
			$this->error = "Failed to search for the LDAP record: ".ldap_error($this->cid);
			return false;
		}
		return ldap_first_entry($this->cid, $rs);
	}

	function authenticate($username, $password) {
		$rs = $this->ldapConnect($username, $password);
		if (!$rs) {return false;}
		$this->userRecord = $this->getRemoteUserRecord($username);
		if (!$this->userRecord) {
			$this->errorCode = 'USERNAME_NOT_FOUND';//allows fall back to local authentication
			$this->error = 'The provided username is not valid';
			return false;
		}
		if ($this->getSetting('bind_dn')) {
			//binding was done with predefined credentials
			//check user provided credentials
			$user_dn = ldap_get_dn($this->cid, $this->userRecord);
			if (!$user_dn) {
				$this->errorCode = 'PLUGIN_CONFIG';
				$this->error = 'Failed to retrieve user DN for the found record!';
				return false;
			}
			$rs = @ldap_bind($this->cid, $user_dn, $password);
			if (!$rs) {
				$this->errorCode = 'WRONG_PASS';
				$this->error = "Invalid password.";
				return false;
			}
		}
		$userInfo = $this->getUserInfo($username, $password);
		$groupsToAllow = $this->getGroupsToAllow();
		if ($groupsToAllow) {
			$foundInGroup = false;
			foreach($userInfo['userGroups'] as $groupName) {
				if (in_array(mb_strtolower($groupName), $groupsToAllow)) {
					$foundInGroup = true;
					break;
				}
			}
			if (!$foundInGroup) {
				$this->error = 'Your user account does not have access to this service!';
				return false;
			}
		}
		$userInfo['userGroups'][] = 'LDAP';
		return $userInfo;
	}

	function listAllUsers() {
		$rs = $this->ldapConnect();
		if (!$rs) {return false;}
		$filter = '(objectClass=person)';
		$dn = $this->getSetting('search_dn');
		$rs = @ldap_search($this->cid, $dn, $filter);
		if (!$rs) {
			$this->error = "Failed to retrieve LDAP records: ".ldap_error($this->cid);
			return false;
		}
		$rs = ldap_get_entries($this->cid, $rs);
		if (!is_array($rs)) {return false;}
		array_shift($rs);
		$list = array();
		foreach ($rs as $record) {
			$list[] = $this->formatUserDetails($record);
		}
		return $list;
	}

	function listRemovedUsers() {
		$rs = $this->ldapConnect();
		if (!$rs) {return false;}
		$filter = '(objectClass=person)';
		$dn = "ou=removed,dc=example,dc=com";//you need to configure this
		$rs = @ldap_search($this->cid, $dn, $filter);
		if (!$rs) {
			$this->error = "Failed to retrieve LDAP records: ".ldap_error($this->cid);
			return false;
		}
		$rs = ldap_get_entries($this->cid, $rs);
		if (!is_array($rs)) {return false;}
		array_shift($rs);
		$list = array();
		foreach ($rs as $record) {
			$list[] = $this->formatUserDetails($record);
		}
		return $list;
	}
}
