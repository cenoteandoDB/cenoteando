<html>
<head>
	<meta charset="UTF-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<title><?php echo \S::safeHTML(\S::forHTML($this->data['fileName']));?></title>
	<style>
		body {
			border: 0px;
			margin: 0px;
			padding: 0px;
			overflow:hidden;
		}
	</style>
</head>

<body oncontextmenu="return false;">

<table border="0" cellpadding="0" cellspacing="0" height="100%" width="100%" style="height:100%" border="0">
<tr>
	<td align="center" valign="middle">
	<object classid="clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B" codebase="http://www.apple.com/qtactivex/qtplugin.cab" height="100%" width="100%" align="center">
	<param name="src" value="<?php echo $URL?>">
	<param name="autoplay" value="true">
	<param name="controller" value="true">
	<embed height="100%" width="100%" align="center" src="<?php echo $URL?>" autoplay="true" controller="true">
	</object>
	</td>
</tr>
</table>
</body>
</html>