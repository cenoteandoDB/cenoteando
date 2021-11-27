<div style="white-space:nowrap">ID: <?php echo \S::forHTML($data['id'])?></div>
<div style="white-space:nowrap">Username: <?php echo \S::safeForHtml($data['username'])?></div>
<div style="white-space:nowrap">Name: <?php echo \S::safeForHtml(\FileRun\Users::formatFullName($data))?></div>
<?php if ($data['email']) {?><div style="white-space:nowrap">E-mail: <?php echo \S::safeForHtml($data['email'])?></div><?php }?>
<?php if ($data['IP']) {?><div style="white-space:nowrap">IP address: <?php echo \S::safeForHtml($data['IP'])?></div><?php }?>
<?php if ($data['company']) {?><div style="white-space:nowrap">Company: <?php echo \S::safeForHtml($data['company'])?></div><?php }?>
<?php if ($data['website']) {?><div style="white-space:nowrap;overflow:auto">Website: <?php echo \S::safeForHtml($data['website'])?></div><?php }?>
<?php if ($data['description']) {?><div style="white-space:nowrap;overflow:auto"><?php echo \S::safeForHtml($data['description'])?></div><?php }?>