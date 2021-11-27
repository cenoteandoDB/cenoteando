<?php
if ($details['label']) {
	echo '<span style="border:1px solid '.$details['label']['color'].'">'.nl2br(S::safeForHtml($details['label']['text'])).'</span>';
} else {
	echo '<span style="font-style:oblique">'.\FileRun\Lang::t('Label removed', 'Files Activity Log').'</span>';
}