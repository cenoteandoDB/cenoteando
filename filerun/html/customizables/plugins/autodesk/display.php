<?php
global $app, $settings, $config;
?>
<html>
<head>
	<meta charset="UTF-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
	<title></title>
	<?php \FileRun\UI\CSS::insertLink(['baseURL' => $config['url']['root'].'/']);?>
	<link rel="stylesheet" href="<?php echo $this->apiURL;?>/viewers/6.0/style.min.css" type="text/css">
	<script src="<?php echo $this->apiURL;?>/viewers/6.0/viewer3D.min.js"></script>
	<script src="<?php echo $config['url']['root'];?>/js/min.php?extjs=1&v=<?php echo $settings->currentVersion;?>"></script>
	<script src="<?php echo $this->url;?>/app.js?v=<?php echo $settings->currentVersion;?>"></script>
	<script src="<?php echo $config['url']['root'];?>/?module=fileman&section=utils&page=translation.js&sec=<?php echo S::forURL(self::$localeSection)?>&lang=<?php echo S::forURL(\FileRun\Lang::getCurrent())?>"></script>
	<script>
		var actionURL = '<?php echo S::safeJS($this->actionURL);?>';
		var isWebLink = <?php if ($this->data['weblink']) {echo 'true';} else {echo 'false';}?>;
		<?php if (!$this->data['weblink']) {?>
		var path = '<?php echo S::safeJS($this->data['relativePath']);?>';
		<?php } ?>
		var filename = '<?php echo S::safeJS($this->data['fileName']);?>';
		var windowId = '<?php echo S::safeJS(S::fromHTML($_REQUEST['_popup_id']));?>';
	</script>
</head>

<body id="theBODY">
</body>
</html>