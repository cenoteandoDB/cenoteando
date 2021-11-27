<?php 
global $config, $settings;
?>
<html dir="ltr">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/> 
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
	<title><?php echo \S::safeHTML(\S::forHTML($this->data['fileName']));?></title>
	<script src="<?php echo $this->url;?>/webodf.js" type="text/javascript" charset="utf-8"></script>
</head>
<body id="theBODY">
	<div id="odf"></div>
	<script type="text/javascript">
		(new odf.OdfCanvas(document.getElementById("odf"))).load('<?php echo S::safeJS($url);?>');
	</script>
</body>
</html>