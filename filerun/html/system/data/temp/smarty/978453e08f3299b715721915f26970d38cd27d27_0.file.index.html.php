<?php
/* Smarty version 3.1.30, created on 2021-11-21 20:05:00
  from "/var/www/html/system/modules/fileman/sections/default/html/pages/index.html" */

/* @var Smarty_Internal_Template $_smarty_tpl */
if ($_smarty_tpl->_decodeProperties($_smarty_tpl, array (
  'version' => '3.1.30',
  'unifunc' => 'content_619aa66c6b48b2_78852957',
  'has_nocache_code' => false,
  'file_dependency' => 
  array (
    '978453e08f3299b715721915f26970d38cd27d27' => 
    array (
      0 => '/var/www/html/system/modules/fileman/sections/default/html/pages/index.html',
      1 => 1577271814,
      2 => 'file',
    ),
  ),
  'includes' => 
  array (
    'file:customizables/include.html' => 1,
  ),
),false)) {
function content_619aa66c6b48b2_78852957 (Smarty_Internal_Template $_smarty_tpl) {
echo smarty_function_lang(array('section'=>"Main Interface"),$_smarty_tpl);?>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
<title><?php echo \S::forHTML($_smarty_tpl->tpl_vars['app']->value['settings']['app_title']);?>
</title>
<?php if ($_smarty_tpl->tpl_vars['app']->value['config']['app']['ui']['enable_favicon_ico']) {?>
	<link rel="icon" type="image/x-icon" href="favicon.ico" />
<?php } else { ?>
	<link rel="icon" type="image/png" href="data:image/png;base64,iVBORw0KGgo=" />
<?php }
$_block_plugin1 = isset($_smarty_tpl->smarty->registered_plugins['block']['insertCSSLink'][0][0]) ? $_smarty_tpl->smarty->registered_plugins['block']['insertCSSLink'][0][0] : null;
if (!is_callable(array($_block_plugin1, 'insertLink'))) {
throw new SmartyException('block tag \'insertCSSLink\' not callable or registered');
}
$_smarty_tpl->smarty->_cache['_tag_stack'][] = array('insertCSSLink', array());
$_block_repeat1=true;
echo $_block_plugin1::insertLink(array(), null, $_smarty_tpl, $_block_repeat1);
while ($_block_repeat1) {
ob_start();
$_block_repeat1=false;
echo $_block_plugin1::insertLink(array(), ob_get_clean(), $_smarty_tpl, $_block_repeat1);
}
array_pop($_smarty_tpl->smarty->_cache['_tag_stack']);?>

<style>
	.tmbInner { height: <?php echo $_smarty_tpl->tpl_vars['app']->value['settings']['thumbnails_size'];?>
px;width: <?php echo $_smarty_tpl->tpl_vars['app']->value['settings']['thumbnails_size'];?>
px; }
	.tmbItem { width: <?php echo $_smarty_tpl->tpl_vars['app']->value['settings']['thumbnails_size'];?>
px; }
	#FR-Grid-Panel .photoMode .tmbItem { height: <?php echo $_smarty_tpl->tpl_vars['app']->value['settings']['ui_photos_thumbnail_size'];?>
px; }
	#FR-Grid-Panel .photoMode .x-grid3-body { grid-template-columns: repeat(auto-fill, minmax(<?php echo $_smarty_tpl->tpl_vars['app']->value['settings']['ui_photos_thumbnail_size'];?>
px, 1fr)); }
</style>
</head>
<body id="theBODY">
<div id="loadMsg"><div><?php $_block_plugin1 = isset($_smarty_tpl->smarty->registered_plugins['block']['t'][0]) ? $_smarty_tpl->smarty->registered_plugins['block']['t'][0] : null;
if (!is_callable($_block_plugin1)) {
throw new SmartyException('block tag \'t\' not callable or registered');
}
$_smarty_tpl->smarty->_cache['_tag_stack'][] = array('t', array());
$_block_repeat1=true;
echo $_block_plugin1(array(), null, $_smarty_tpl, $_block_repeat1);
while ($_block_repeat1) {
ob_start();
?>
Loading...<?php $_block_repeat1=false;
echo $_block_plugin1(array(), ob_get_clean(), $_smarty_tpl, $_block_repeat1);
}
array_pop($_smarty_tpl->smarty->_cache['_tag_stack']);?>
</div></div>

<?php echo '<script'; ?>
 src="js/min.php?extjs=1<?php if ($_smarty_tpl->tpl_vars['app']->value['config']['misc']['developmentMode']) {?>&debug=1<?php }?>&v=<?php echo \S::forURL($_smarty_tpl->tpl_vars['app']->value['settings']['currentVersion']);?>
"><?php echo '</script'; ?>
>
<?php echo '<script'; ?>
 src="js/min.php?v=<?php echo \S::forURL($_smarty_tpl->tpl_vars['app']->value['settings']['currentVersion']);
if ($_smarty_tpl->tpl_vars['app']->value['config']['misc']['developmentMode']) {?>&debug=1<?php }?>"><?php echo '</script'; ?>
>
<?php echo '<script'; ?>
 src="?module=fileman&section=utils&page=custom_actions.js&language=<?php echo \S::forURL($_smarty_tpl->tpl_vars['app']->value['language']);?>
&v=<?php echo \S::forURL($_smarty_tpl->tpl_vars['app']->value['settings']['currentVersion']);?>
&last_update=<?php echo \S::forURL($_smarty_tpl->tpl_vars['app']->value['settings']['last_custom_actions_settings_update']);?>
"><?php echo '</script'; ?>
>
<?php echo '<script'; ?>
 src="?module=fileman&section=utils&page=translation.js&sec=Main%20Interface&lang=<?php echo \S::forURL($_smarty_tpl->tpl_vars['app']->value['language']);?>
&v=<?php echo \S::forURL($_smarty_tpl->tpl_vars['app']->value['settings']['currentVersion']);?>
"><?php echo '</script'; ?>
>
<?php echo '<script'; ?>
 src="?module=fileman&section=utils&page=meta.js&v=<?php echo \S::forURL($_smarty_tpl->tpl_vars['app']->value['settings']['currentVersion']);?>
&uid=<?php echo $_smarty_tpl->tpl_vars['app']->value['user']['info']['id'];?>
&last_update=<?php echo \S::forURL($_smarty_tpl->tpl_vars['app']->value['settings']['last_metadata_structure_update']);?>
"><?php echo '</script'; ?>
>
<?php if ($_smarty_tpl->tpl_vars['app']->value['settings']['pushercom_enable'] && !$_smarty_tpl->tpl_vars['app']->value['settings']['disable_file_history']) {
echo '<script'; ?>
 src="https://js.pusher.com/4.1/pusher.min.js"><?php echo '</script'; ?>
>
<?php }
if ($_smarty_tpl->tpl_vars['app']->value['config']['app']['ui']['custom_js_url']) {
echo '<script'; ?>
 src="<?php echo $_smarty_tpl->tpl_vars['app']->value['config']['app']['ui']['custom_js_url'];?>
?v=<?php echo \S::forURL($_smarty_tpl->tpl_vars['app']->value['settings']['currentVersion']);?>
"><?php echo '</script'; ?>
>
<?php }
echo '<script'; ?>
>
	FR.language = '<?php echo $_smarty_tpl->tpl_vars['app']->value['language'];?>
';
	FR.homeFolderCfg = <?php echo $_smarty_tpl->tpl_vars['app']->value['homeFolderCfg'];?>
;
	var URLRoot = '<?php echo $_smarty_tpl->tpl_vars['app']->value['url']['root'];?>
';
	var Settings = <?php echo $_smarty_tpl->tpl_vars['app']->value['UISettings'];?>
;
	var User = <?php echo $_smarty_tpl->tpl_vars['app']->value['UIUser'];?>
;
	var Sharing = <?php echo $_smarty_tpl->tpl_vars['app']->value['usersWithShares'];?>
;
	var AnonShares = <?php echo $_smarty_tpl->tpl_vars['app']->value['anonShares'];?>
;
<?php echo '</script'; ?>
>

	<?php $_smarty_tpl->_subTemplateRender("file:customizables/include.html", $_smarty_tpl->cache_id, $_smarty_tpl->compile_id, 0, $_smarty_tpl->cache_lifetime, array('page'=>"index"), 0, false);
?>

	<?php if ($_smarty_tpl->tpl_vars['app']->value['settings']['tracker_codes']) {
echo $_smarty_tpl->tpl_vars['app']->value['settings']['tracker_codes'];
}?>
</body>
</html><?php }
}
