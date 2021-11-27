<div style="white-space:nowrap">File path: <?php echo S::forHTML(\FileRun\Files\Utils::humanRelPath($data['relative_path']))?></div>
<?php if (\FileRun\Perms::isSuperUser()) { ?>
	<div style="white-space:nowrap">Full path: <?php echo S::forHTML($data['full_path'])?></div>
<?php } ?>
<div style="white-space:nowrap">
<?php
if ($data['label']) {
	echo '<span style="border:1px solid '.$data['label']['color'].'">'.nl2br(\S::safeForHtml($data['label']['text'])).'</span>';
} else {
	echo '<span style="font-style:oblique">Label removed</span>';
}
?>
</div>