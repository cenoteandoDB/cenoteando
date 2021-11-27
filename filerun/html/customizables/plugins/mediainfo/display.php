<?php
$getID3 = new getID3;
$fInfo = $getID3->analyze($this->data['fullPath']);
\getid3_lib::CopyTagsToComments($fInfo);
?>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	<link rel="stylesheet" type="text/css" href="css/style.css?v=<?php echo $settings->currentVersion;?>" />
	<style>
		body {
			background-color:white;
			overflow: auto;
		}
	</style>
	<title><?php echo \S::safeHTML(\S::forHTML($this->data['fileName']));?></title>
</head>
<body>
<table style="float:left;width:200px;margin:10px;">
	<tr>
		<td align="center" valign="middle">
			<img src="<?php echo \FileRun\UI\Utils::getFileIconURL($this->data['fileName']);?>" width="96" />
		</td>
	</tr>
	<tr><td align="center"><?php echo $this->data['fileName']?></td></tr>
</table>

	<table class="niceborder" style="float:left;margin:10px;" cellspacing="1" cellpadding="10">
	<?php $this->displayRow('File size', \FM::formatFileSize(\FM::getFileSize($this->data['fullPath'])));?>
	<?php $this->displayRow('Format', $fInfo['fileformat']);?>
	<?php $this->displayRow('Duration', $fInfo['playtime_string']);?>
	<?php $this->displayRow('Width', $fInfo['video']['resolution_x']);?>
	<?php $this->displayRow('Height', $fInfo['video']['resolution_y']);?>
	<?php $this->displayRow('Channels', $fInfo['audio']['channels']);?>
	<?php $this->displayRow('Sample rate', $fInfo['audio']['sample_rate']);?>
	<?php $this->displayRow('Bit rate', round($fInfo['bitrate']/1000));?>
	<?php $this->displayRow('Video codec', $fInfo['video']['codec']);?>
	<?php $this->displayRow('Audio codec', $fInfo['audio']['codec']);?>
	<?php $this->displayRow('Title', $fInfo['comments']['title'][0]);?>
	<?php $this->displayRow('Artist', $fInfo['comments']['artist'][0]);?>
	<?php $this->displayRow('Album', $fInfo['comments']['album'][0]);?>
	<?php $this->displayRow('Year', $fInfo['comments']['year'][0]);?>
	<?php $this->displayRow('Genre', $fInfo['comments']['genre'][0]);?>
	</table>

	<?php
	if (is_array($fInfo['jpg']['exif']['EXIF'])) { ?>
		<table class="niceborder" style="clear:both;margin:10px;" cellspacing="1" cellpadding="5">
			<tr><td align="center" colspan="2">EXIF</td></tr>
			<?php foreach ($fInfo['jpg']['exif']['EXIF'] as $k => $v) {
				$this->displayRow($k, $v);
			}
			?>
		<?php if (is_array($fInfo['jpg']['exif']['IFD0'])) { ?>
			<tr><td align="center" colspan="2">IFD0</td></tr>
			<?php foreach ($fInfo['jpg']['exif']['IFD0'] as $k => $v) {
				$this->displayRow($k, $v);
			}
			?>
		<?php }?>
		</table>
	<?php }?>

	<?php
	if (is_array($fInfo['xmp'])) { ?>
		<table class="niceborder" style="clear:both;margin:10px;" cellspacing="1" cellpadding="5">
			<tr><td align="center" colspan="2">XMP</td></tr>
			<?php foreach ($fInfo['xmp'] as $k => $v) {
				if ($k != 'xmlns') {
					foreach ($v as $sk => $sv) {
						$this->displayRow($k . ' &gt; ' . $sk, $sv);
					}
				}
			}
			?>
		</table>
	<?php }?>

	<?php
	if (is_array($fInfo['jpg']['exif']['GPS']['computed'])) { ?>
		<table class="niceborder" style="clear:both;margin:10px;" cellspacing="1" cellpadding="5">
			<tr><td align="center" colspan="2">GPS</td></tr>
			<?php foreach ($fInfo['jpg']['exif']['GPS']['computed'] as $k => $v) {
				$this->displayRow($k, $v);
			}
			?>
		</table>
	<?php }?>

	<?php
	if (is_array($fInfo['iptc']['IPTCApplication'])) { ?>
		<table class="niceborder" style="clear:both;margin:10px;" cellspacing="1" cellpadding="5">
			<tr><td align="center" colspan="2">IPTC</td></tr>
			<?php foreach ($fInfo['iptc']['IPTCApplication'] as $k => $v) {
				$this->displayRow($k, $v);
			}
			?>
		</table>
	<?php }?>

	<?php if ($fInfo['error']) { ?>
	<table class="niceborder" style="clear:both;margin:10px;" cellspacing="1" cellpadding="5">
		<?php
		$i = 0;
		foreach ($fInfo['error'] as $err) {
			$i++;
			$this->displayRow('Error '.$i, $err);
		}
		?>
	</table>
	<?php } ?>
</body>
</html>