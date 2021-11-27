<html>
<head>
	<title></title>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	<?php \FileRun\UI\CSS::insertLink();?>
</head>
<body>
<script>
	function openDocument() {
		var windowId = '<?php echo S::safeJS(S::fromHTML($_REQUEST['_popup_id']))?>';
		window.open('<?php echo $URL?>');
		window.parent.FR.UI.popups[windowId].close();
	}
</script>
<table width="100%" height="100%">
	<tr>
		<td align="center" valign="middle">

			<a href="javascript:openDocument()" class="fr-btn-default fr-btn-in-form " style="font-size:1.5em;"><?php \FileRun\Lang::d('Open preview', \custom_libreoffice_viewer::$localeSection);?></a>

		</td>
	</tr>
</table>
</body>
</html>