<!DOCTYPE html>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
	<title><?php echo \S::safeHTML(\S::forHTML($this->data['fileName']));?></title>
	<?php \FileRun\UI\CSS::insertLink(['baseURL' => $config['url']['root'].'/']);?>
	<link rel="stylesheet" href="<?php echo $this->url;?>/jspreadsheet/jsuites.css" />
	<link rel="stylesheet" href="<?php echo $this->url;?>/jspreadsheet/jspreadsheet.css" />

	<script src="<?php echo $config['url']['root'];?>/js/min.php?extjs=1&v=<?php echo $settings->currentVersion;?><?php if ($config['misc']['developmentMode']) {echo '&debug=1';}?>"></script>
	<script src="<?php echo $this->url;?>/app.js?v=<?php echo $settings->currentVersion;?>"></script>
	<script src="<?php echo $config['url']['root'];?>/?module=fileman&section=utils&page=translation.js&sec=<?php echo \S::forURL("Custom Actions: CSV Editor")?>&lang=<?php echo \S::forURL(\FileRun\Lang::getCurrent())?>"></script>
	<script src="<?php echo $this->url;?>/jspreadsheet/index.min.js"></script>
	<script src="<?php echo $this->url;?>/jspreadsheet/jsuites.min.js"></script>
	<script>
		FR.settings = <?php echo $vars;?>;
	</script>
</head>

<body id="theBODY" onload="FR.init()">


</body>
</html>