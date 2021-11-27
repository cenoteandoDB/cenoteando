<?php
if (\FileRun\Perms::check('read_comments')) {
	echo nl2br(S::safeForHtml($details['comment_info']['val']));
}