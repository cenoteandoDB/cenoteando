<?php
global $config, $settings;
$context = \S::fromHTML($_REQUEST['context']);
?>
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<title></title>
	<?php \FileRun\UI\CSS::insertLink(['baseURL' => $config['url']['root'].'/']);?>
	<link rel="stylesheet" href="<?php echo $this->url;?>/style.css?v=<?php echo $settings->currentVersion;?>" />
	<?php if ($context == 'viewer') { ?>
	<style>body {background: transparent;}</style>
	<?php } ?>
</head>
<body id="theBODY">
<div id="loadMsg"><div><?php echo \FileRun\Lang::t("Loading audio player...", $this->localeSection)?></div></div>
<script src="<?php echo $config['url']['root'];?>/js/min.php?extjs=1&v=<?php echo $settings->currentVersion;?><?php if ($config['misc']['developmentMode']) {echo '&debug=1';}?>"></script>
<script src="<?php echo $this->url;?>/js/app.js?v=<?php echo $settings->currentVersion;?>"></script>
<script src="<?php echo $config['url']['root'];?>/?module=fileman&section=utils&page=translation.js&sec=<?php echo \S::forURL("Custom Actions: Audio Player")?>&lang=<?php echo \S::forURL(\FileRun\Lang::getCurrent())?>"></script>
<script src="<?php echo $this->url;?>/js/howler.min.js?v=<?php echo $settings->currentVersion;?>"></script>
<script src="<?php echo $this->url;?>/js/aurora.js?v=<?php echo $settings->currentVersion;?>"></script>
<script src="<?php echo $this->url;?>/js/alac.js?v=<?php echo $settings->currentVersion;?>"></script>
<script src="<?php echo $this->url;?>/js/aac.js?v=<?php echo $settings->currentVersion;?>"></script>
<script>
	var URLRoot = '<?php echo \S::safeJS($config['url']['root']);?>';
	var fileItem = <?php
		if ($context == 'embedded') { echo '{}';} else {
			$fileData = [
				'filetype' => 'mp3',
				'path' => $this->data['relativePath'],
				'filename' => $this->data['fileName'],
				'ext' => \FM::getExtension($this->data['fileName'])
			];
			if ($this->data['weblink']) {
				$fileData['url'] = $this->data['weblink']['base_url'].'&method=stream';
			}
			echo json_encode([
				'data' => $fileData
			]);
		}
	?>;
	var Settings = <?php echo json_encode([
			'ui_theme' => $settings->ui_theme,
			'default_cover' => \FileRun\UI\Utils::getFileIconURL('filename.mp3'),
			'context' => $context
	]);?>;

</script>
</body>
</html>