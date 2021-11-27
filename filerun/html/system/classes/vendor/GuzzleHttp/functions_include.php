<?php

// Don't redefine the functions if included multiple times.
if (!function_exists('GuzzleHttp\uri_template')) {
	require __DIR__ . '/functions.php';
	require(__DIR__ .'/Psr7/functions.php');
	require(__DIR__ .'/Promise/functions.php');
}
