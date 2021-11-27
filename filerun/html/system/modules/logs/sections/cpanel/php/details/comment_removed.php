<?php
namespace FileRun;
?>
<div style="white-space:nowrap;font-weight:bold;"><?php echo \S::forHTML(\FM::basename($data['full_path']))?></div>
<div style="white-space:nowrap">From: <?php echo \S::forHTML(Files\Utils::humanRelPath(\FM::dirname($data['relative_path'])))?></div>
<?php if (Perms::isSuperUser()) { ?>
	<div style="white-space:nowrap">Full path: <?php echo \S::forHTML($data['full_path'])?></div>
<?php } ?>
<div style="white-space:nowrap">Comment: <?php echo \S::safeForHTML($data['comment_info']['val'])?></div>