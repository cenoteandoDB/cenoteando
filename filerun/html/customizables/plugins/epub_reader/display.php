<?php
global $config, $settings;
?>
<!DOCTYPE html>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
	<meta name="viewport" content="width=device-width, user-scalable=no">
	<meta name="apple-mobile-web-app-capable" content="yes">
	<title></title>
	<link rel="stylesheet" href="<?php echo $config['url']['root'];?>/css/normalize.css">
	<link rel="stylesheet" href="<?php echo $this->url;?>/css/main.css">
	<link rel="stylesheet" href="<?php echo $this->url;?>/css/popup.css">

	<script src="<?php echo $config['url']['root'];?>/js/jquery/jquery.min.js"></script>
	<script src="<?php echo $this->url;?>/js/libs/zip.min.js"></script>
	<script src="<?php echo $this->url;?>/js/libs/screenfull.min.js"></script>
	<script src="<?php echo $this->url;?>/js/epub.min.js"></script>
	<script src="<?php echo $this->url;?>/js/reader.min.js"></script>
	<script>
		"use strict";
		document.onreadystatechange = function () {
			if (document.readyState == "complete") {
				window.reader = ePubReader('<?php echo \S::safeJS($url);?>', {
					bookKey: 'EPUB-<?php echo md5($this->data['fullPath']);?>',
					contained:true,
					restore: true,
					storage: true
				});
			}
		};
	</script>
</head>
<body>
<div id="sidebar">
	<div id="panels">
          <a id="show-Toc" class="show_view icon-list-1 active" data-view="Toc"><?php echo self::t('TOC');?></a>
          <a id="show-Bookmarks" class="show_view icon-bookmark" data-view="Bookmarks"><?php echo self::t('Bookmarks');?></a>
        </div>
	<div id="tocView" class="view">
	</div>
	<div id="bookmarksView" class="view">
      <ul id="bookmarks"></ul>
    </div>
</div>
<div id="main">
	<div id="titlebar">
		<div id="opener">
			<a id="slider" title="<?php echo self::t('Menu');?>" class="icon-menu"><?php echo self::t('Menu');?></a>
		</div>
		<div id="metainfo">
			<span id="book-title"></span>
			<span id="title-seperator">&nbsp;&nbsp;–&nbsp;&nbsp;</span>
			<span id="chapter-title"></span>
		</div>
		<div id="title-controls">
			<a id="bookmark" class="icon-bookmark-empty"><?php echo self::t('Bookmark');?></a>
			<a id="fullscreen" title="<?php echo self::t('Fullscreen');?>" class="icon-resize-full"><?php echo self::t('Fullscreen');?></a>
		</div>
	</div>
	<div id="divider"></div>
	<div id="prev" class="arrow">‹</div>
	<div id="viewer"></div>
	<div id="next" class="arrow">›</div>
	<div id="loader"><img src="<?php echo $this->url;?>/img/loader.gif"></div>
</div>
<div class="overlay"></div>
</body>
</html>