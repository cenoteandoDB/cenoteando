<?php
global $config, $settings;
?>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	<title></title>
	<link rel="stylesheet" type="text/css" href="css/style.css?v=<?php echo $settings->currentVersion;?>" />
	<style>
		body {
			background: transparent;
			overflow:auto;
		}
		table {
			background-color:white;
			overflow:auto;
		}
		table.niceborder td {
			white-space: nowrap;
			padding:5px;
		}
	</style>
</head>

<body>
	<table border="0" cellspacing="1" class="niceborder" style="min-width:500px;" align="center">
		<?php
		$limit = 200;
		$i = 1;

		foreach ($list as $key => $item) {
			if ($item['type'] == "file" && $item['path']) {
				if ($item['utf8_encoded']) {
					$srcEnc = "UTF-8";
				} else {
					if ($config['app']['encoding']['unzip']) {//convert from a predefined encoding
						$srcEnc = $config['app']['encoding']['unzip'];
					} else {
						$srcEnc = S::detectEncoding($item['path']);
					}
				}
				$item['path'] = \S::convert2UTF8($item['path'], $srcEnc);
				?>
				<tr>
					<td width="16"><img src="<?php echo \FileRun\UI\Utils::getFileIconURL($item['filename']);?>" border="0" height="16" width="16" /></td>
					<td><div><?php echo S::safeHTML($item['path']);?></div></td>
					<td align="center"><?php echo \FM::formatFileSize($item['filesize']);?></td>
				</tr>
				<?php
				$i++;

				if ($i >= $limit) {
					?>
					<tr>
						<td>&nbsp;</td>
						<td colspan="2">Archive contains more files than displayed in this preview.</td>
					</tr>
					<?php
					break;
				}
			}
		}
		?>
	</table>
</body>
</html>