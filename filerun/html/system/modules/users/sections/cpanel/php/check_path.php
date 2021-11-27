<?php
namespace FileRun;
Lang::setSection("Admin: Users");

if (!Perms::isSuperUser() && !Perms::isSimpleAdmin()) {
	exit();
}

$path = \S::fromHTML($_POST['path']);
$path = rtrim($path, "/");

if ($config['misc']['demoMode']) {
	echo "<div class=\"error\">".Lang::t("Action unavailable in this demo version of the software!")."</div>";
	exit();
}
if (strlen($path) < 1) {
	echo "<div class=\"error\">".Lang::t("Please specify a path!")."</div>";
	exit();
}

if (strstr($path, "\\")) {
	echo "<div class=\"error\">".Lang::t("Please replace the back slashes (\\) with forward slashes (/)!")."</div>";
	exit();
}

if (\FM::getOS() == "win") {
	if (substr($path, 1, 1) != ":" && substr($path, 0, 2) != "//") {
		echo "<div class=\"error\">".Lang::t("The path should start with a drive letter! Example: C:/files/")."</div>";
		exit();
	}
} else {
	if (substr($path, 0, 1) != "/") {
		echo "<div class=\"error\">".Lang::t("The path should start with a forward slash! Example: /files/")."</div>";
		exit();
	}
}

$parts = explode("/", $path);
$noOfParts = count($parts);
$htmlParts = [];
$lastBadPath = false;

for ($i = 0 ; $i <= $noOfParts; $i++) {
	$partialPath = implode("/", $parts);
	$oneDir = \FM::basename($partialPath);
	if (strlen($oneDir) > 0) {
		$rs = @is_dir($partialPath);
		if ($rs) {
			$htmlParts[] = "<span style=\"background-color:green;color:white;\">".$partialPath."</span>";
			break;
		}
		$htmlParts[] = "<span style=\"background-color:#E11B00;color:white;\">".$oneDir."</span>";
		$lastBadPath = $partialPath;
		array_pop($parts);
	}
}

if ($lastBadPath) {
	echo "<div class=\"error\">".Lang::t("Invalid folder!")."</div>";
	echo implode("/", array_reverse($htmlParts));
	echo "<br><br>".Lang::t("The folder \"%1\" does not exists or it is not accessible by PHP.", false, [$lastBadPath]);
} else {
	echo "<div class=\"ok\">".Lang::t("The path is valid.")."</div>";

	$d = Perms::getTable();
	$countUsage = $d->selectOneCol('COUNT(*)', [
		['homefolder', '=', $d->q($path)]
	]);
	if ($countUsage > 0) {
		echo "<div>".Lang::t('Note: This path is currently assigned to at least one user account.')."</div>";
	}
}