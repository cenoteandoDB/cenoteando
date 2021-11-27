<?php

function customAuth_ldap_test($opts) {
	if (!function_exists('ldap_connect')) {
		return 'PHP is missing LDAP support! Make sure the LDAP PHP extension is enabled.';
	}
	$cid = ldap_connect($opts['auth_plugin_ldap_host'], $opts['auth_plugin_ldap_port']);
	if (!$cid) {
		return 'Connection to the LDAP server failed! Make sure the hostname and the port number are correct.';
	}
	ldap_set_option($cid, LDAP_OPT_PROTOCOL_VERSION, 3);
	ldap_set_option($cid, LDAP_OPT_REFERRALS, 0);

	$user_dn = false;

	if ($opts['auth_plugin_ldap_bind_dn']) {
		$rs = @ldap_bind($cid, $opts['auth_plugin_ldap_bind_dn'], $opts['auth_plugin_ldap_bind_password']);
		if (!$rs) {
			return "Bind with bind DN failed: ".ldap_error($cid);
		} else {
			echo 'Bind with bind DN successful!';
			echo '<br>';
		}
	} else {
		$user_dn = str_replace('{USERNAME}', $opts['auth_plugin_ldap_test_username'], $opts['auth_plugin_ldap_user_dn']);
		$rs = @ldap_bind($cid, $user_dn, $opts['auth_plugin_ldap_test_password']);
		if (!$rs) {
			return "Bind with test account failed: ".ldap_error($cid);
		} else {
			echo 'Bind with test account successful!';
			echo '<br>';
		}
	}

	if (mb_strpos($opts['auth_plugin_ldap_search_filter'], '{USERNAME}') === false) {
		return 'The "Search filter template:" needs to contain the {USERNAME} variable!';
	}

	$filter = str_replace("{USERNAME}", $opts['auth_plugin_ldap_test_username'], $opts['auth_plugin_ldap_search_filter']);
	echo 'Searching with filter: '.$filter;
	echo '<br>';
	$rs = @ldap_search($cid, $opts['auth_plugin_ldap_search_dn'], $filter);
	if (!$rs) {
		return "Failed to search for the LDAP record: ".ldap_error($cid);
	}
	$entry = ldap_first_entry($cid, $rs);
	if (!$entry) {
		return 'LDAP record not found. Verify the search filter.';
	}
	if ($opts['auth_plugin_ldap_bind_dn']) {
		$user_dn = ldap_get_dn($cid, $entry);
		echo 'User DN retrieved: '.$user_dn;
		echo '<br>';
		$rs = @ldap_bind($cid, $user_dn, $opts['auth_plugin_ldap_test_password']);
		if (!$rs) {
			return "Bind with test account failed: " . ldap_error($cid);
		} else {
			echo 'Bind with test account successful!';
			echo '<br>';
		}
	}
	echo 'Record found:';
	$attr = ldap_get_attributes($cid, $entry);
	$values = array();
	if (array($attr)) {
		echo '<div style="background-color:whitesmoke;margin:5px;border:1px solid silver">';
		foreach ($attr as $k => $a) {
			if (!is_numeric($k) && $k != 'count') {
				$values[$k] = $a[0];
				echo '<div style="margin-left:10px;">'.S::safeHTML($k).': '.S::safeHTML($a[0]).'</div>';
			}
		}
		echo '</div>';
	}

	$n = customAuth_ldap::formatName($values, $opts['auth_plugin_ldap_mapping_name'], $opts['auth_plugin_ldap_mapping_name2']);
	$name = $n[0];
	$name2 = $n[1];

	echo 'Fields mapping:';
	echo '<div style="background-color:whitesmoke;margin:5px;padding:5px;border:1px solid silver">';
	echo 'Name ('.$opts['auth_plugin_ldap_mapping_name'].'): '.S::safeHTML($name);
	echo '<br>Last name ('.$opts['auth_plugin_ldap_mapping_name2'].'): '.S::safeHTML($name2);
	echo '<br>E-mail ('.$opts['auth_plugin_ldap_mapping_email'].'): '.S::safeHTML($values[$opts['auth_plugin_ldap_mapping_email']]);
	if ($opts['auth_plugin_ldap_mapping_company']) {
		echo '<br>Company (' . $opts['auth_plugin_ldap_mapping_company'] . '): ' . S::safeHTML($values[$opts['auth_plugin_ldap_mapping_company']]);
	}
	echo '</div>';


	$groups = [];
	$groupsToImport = false;
	if (strlen($opts['auth_plugin_ldap_groups_to_import']) > 0) {
		$rs = trim_array(explode(',', mb_strtolower($opts['auth_plugin_ldap_groups_to_import'])));
		$temp = [];
		foreach ($rs as $groupName) {
			$t = trim($groupName);
			if ($t) {
				$temp[] = $t;
			}
		}
		if (sizeof($temp) > 0) {
			$groupsToImport = $temp;
		}
	}

	/*
	if ($opts['auth_plugin_ldap_use_memberOf'] == 'yes') {
	} else
	*/

	if ($opts['auth_plugin_ldap_groups_ad_chain'] == 'yes') {
		echo 'Retrieving groups using LDAP_MATCHING_RULE_IN_CHAIN: ';

		$filter = "(member:1.2.840.113556.1.4.1941:=".$user_dn.")";
		$search = @ldap_search($cid, $opts['auth_plugin_ldap_search_dn'], $filter, ['dn', 'description', 'count'], 1);
		if (!$search) {
			return "Failed to search for groups: ".ldap_error($cid);
		}
		$entries = ldap_get_entries($cid, $search);
		if (!$entries) {
			return 'No group entries found!';
		}
		echo $entries['count'] . '<br>';
		if ($entries['count'] > 0) {
			foreach ($entries as $key => $entry) {
				$groupDN = ldap_explode_dn($entry['dn'], 1);
				$groupName = $groupDN[0];
				if ($groupsToImport) {
					if (in_array(mb_strtolower($groupName), $groupsToImport)) {
						$groups[] = [
							'name' => $groupName
						];
					}
				}

			}
		} else {
			echo 'No groups found!<br>';
		}
	} else if ($opts['auth_plugin_ldap_groups_search_filter']) {
		echo 'Retrieving all groups: ';
		$a = ['cn', 'description', 'count', 'parent'];
		$a[] = $opts['auth_plugin_ldap_groups_member_attribute'];

		$searchForGroups = ldap_search($cid, $opts['auth_plugin_ldap_search_dn'], $opts['auth_plugin_ldap_groups_search_filter'], $a);
		if (!$searchForGroups) {
			return "Failed to search for groups: ".ldap_error($cid);
		}
		$entries = ldap_get_entries($cid, $searchForGroups);
		if (!$entries) {
			return 'No group entries found!';
		}
		echo $entries['count'] . '<br>';
		if ($entries['count'] > 0) {
			foreach ($entries as $key => $entry) {
				if ($key == 'count') {continue;}
				$members = $entry[$opts['auth_plugin_ldap_groups_member_attribute']];
				if (!$members) {continue;}
				$groupName = $entry['cn'][0];
				if ($groupsToImport) {
					if (!in_array(mb_strtolower($groupName), $groupsToImport)) {
						continue;
					}
				}
				if (in_array($user_dn, $members)) {
					$groups[] = [
						'name' => $groupName,
						'description' => $entry['description'][0]
					];
				}
			}
		} else {
			echo 'No groups found!<br>';
		}
	}

	if (sizeof($groups) > 0) {
		echo 'Group membership:';
		echo '<div style="background-color:whitesmoke;margin:5px;padding:5px;border:1px solid silver">';
		foreach ($groups as $group) {
			echo "\t" . $group['name'];
			if ($group['description']) {
				echo ' (' . $group['description'] . ')';
			}
			echo '<br>';
		}
		echo '</div>';
	}


	if ($opts['auth_plugin_ldap_groups_to_allow_access']) {
		$rs = trim_array(explode(',', mb_strtolower($opts['auth_plugin_ldap_groups_to_allow_access'])));
		$groupsToAllow = [];
		foreach ($rs as $groupName) {
			$t = trim($groupName);
			if ($t) {
				$groupsToAllow[] = $t;
			}
		}
		if ($groupsToImport === false || sizeof($groupsToImport) == 0) {
			return 'If you set "Groups to allow access to" you need to set at least one group name as "Groups to import"!';
		}
		if (sizeof($groups) == 0) {
			return '"Groups to allow access to" is set, however, no groups where found for the user!';
		}
		$foundInGroup = false;
		foreach($groups as $group) {
			if (in_array(mb_strtolower($group['name']), $groupsToAllow)) {
				echo 'Group "'.$group['name'].'" was found under "Groups to allow access to".<br>';
				$foundInGroup = true;
				break;
			}
		}
		if (!$foundInGroup) {
			return 'None of the user\'s found groups is listed under "Groups to allow access to"!';
		}
	}

	return 'The test was successful';
}