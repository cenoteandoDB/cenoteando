<?php
global $settings, $config;
$translationCode = self::getTranslationCode();

$nonce = base64_encode(random_bytes(20));
$csp = "default-src 'none'; base-uri 'self'; form-action 'none';".
	"script-src 'self' 'unsafe-eval' 'nonce-".$nonce."'; " .
	"connect-src ".$config['url']['root']."/customizables/plugins/html_editor/; " .
	"navigate-to 'none'; " .
	"font-src 'self'; " .
	"img-src 'self' data:; style-src 'self' 'unsafe-inline';";
header('Content-Security-Policy: '.$csp);
?>
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<title><?php echo \S::safeHTML(\S::forHTML($this->data['fileName']));?></title>
	<?php \FileRun\UI\CSS::insertLink(['baseURL' => $config['url']['root'].'/']);?>
	<link href="<?php echo $this->url;?>/summernote/bootstrap/bootstrap.min.css" rel="stylesheet">
	<link rel="stylesheet" href="<?php echo $this->url;?>/summernote/summernote.min.css">
	<script src="<?php echo $config['url']['root'];?>/js/min.php?extjs=1&v=<?php echo $settings->currentVersion;?><?php if ($config['misc']['developmentMode']) {echo '&debug=1';}?>"></script>
	<script src="<?php echo $this->url;?>/app.js?v=<?php echo $settings->currentVersion;?>"></script>
	<script src="<?php echo $config['url']['root'];?>/?module=fileman&section=utils&page=translation.js&sec=<?php echo \S::forURL("Custom Actions: HTML Editor")?>&lang=<?php echo \S::forURL(\FileRun\Lang::getCurrent())?>"></script>
	<script src="<?php echo $config['url']['root'];?>/js/jquery/jquery.min.js"></script>
	<script src="<?php echo $this->url;?>/summernote/bootstrap/bootstrap.min.js"></script>
	<script src="<?php echo $this->url;?>/summernote/summernote.min.js"></script>
	<script src="<?php echo $this->url;?>/summernote/summernote-ext-print.js"></script>
	<?php if ($translationCode) { ?>
	<script nonce="<?php echo $nonce;?>" src="<?php echo $this->url;?>/summernote/lang/summernote-<?php echo $translationCode;?>.js"></script>
	<?php } ?>
	<script nonce="<?php echo $nonce;?>">
		var URLRoot = '<?php echo \S::safeJS($config['url']['root'])?>';
		var path = '<?php echo \S::safeJS($this->data['relativePath'])?>';
		var filename = '<?php echo \S::safeJS($this->data['fileName'])?>';
		var windowId = '<?php echo \S::safeJS(\S::fromHTML($_REQUEST['_popup_id']))?>';
		var language = <?php echo $translationCode ? '\''.\S::safeJS($translationCode).'\'' : 'false';?>;
	</script>
	<style>
		.note-editor ol {padding-left:20px;list-style-type: decimal;}
		.note-editor ul {padding-left:20px;list-style-type: disc;}
		.panel {border-radius:0;}
		.note-editor.note-frame {height:100%;border-color:#D9D9D9;}
		.ext-el-mask { background-color: white; }
		body,
		.x-toolbar {
			background-color: transparent;
		}
	</style>
</head>

<body id="theBODY">

<textarea style="display:none" id="textContents"><?php
	$this->data['contents'] = \S::convert2UTF8($this->data['contents']);

	if ($this->getSetting('use_purifier')) {
		require $config['path']['classes'] . '/vendor/HTMLPurifier/HTMLPurifier.auto.php';
		$cfg = HTMLPurifier_Config::createDefault();
		$cfg->set('Cache.SerializerPath', $config['path']['temp'].'/smarty/');
		$purifier = new HTMLPurifier($cfg);
		$this->data['contents'] = $purifier->purify($this->data['contents']);
	}

	echo \S::safeHTML($this->data['contents']);
?></textarea>

</body>
</html>