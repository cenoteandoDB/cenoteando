<?php
namespace FileRun\Utils;
use \S;

class Downloads {

	static $downloadMethod = 'regular';
	static $bytesSentToBrowser = 0;

	private static function sendWithXAccel($path) {
		global $config;
		if (stristr($_SERVER["SERVER_SOFTWARE"], 'nginx') === false) {return false;}
		if (!is_array($config['x_accel_paths'])) {
			header("X-Accel-Redirect: ".$path);
			return true;
		}
		foreach($config['x_accel_paths'] as $folder) {
			if (\FM::inPath($path, $folder)) {
				header("X-Accel-Redirect: ".$path);
				return true;
			}
		}
		return false;
	}

	private static function sendWithXSendfile($path) {
		if (stristr($_SERVER["SERVER_SOFTWARE"], 'apache') === false) {return false;}
		if (\FM::getOS() == 'win') {
			//on Windows OS, the filenames are stored as ISO-8859-1 and not UTF-8
			$path = S::convert2UTF8($path, "ISO-8859-1");
		}
		header("X-Sendfile: ".$path);
		return true;
	}

	private static function sendWithLightSpeed($path) {
		global $config;
		if (stristr($_SERVER["SERVER_SOFTWARE"], 'litespeed') === false) {return false;}
		if (!$config['x_lightspeed_root']) {return false;}
		$len = mb_strlen($config['x_lightspeed_root']);
		$path = mb_substr($path, $len);
		header("X-LiteSpeed-Location: ".$path);
		return true;
	}

	private static function sendDefault($path, $fileSize) {
		header("Accept-Ranges: bytes");
		if ($_SERVER['REQUEST_METHOD'] == "HEAD") {return false;}
		$rs = self::outputRangeHeadersAndGetOffset($fileSize);
		$offset = $rs[0];
		$length = $rs[1];
		self::outputFile($path, $offset, $length);
		if (
			(self::$bytesSentToBrowser == $fileSize) //100% of the file sent in one request
			||
			($offset > 0 && $offset+$length >= $fileSize && self::$bytesSentToBrowser == $length) //partial request, but includes the bottom of the file
		) {
			return "final";
		}
		return "partial";
	}

	static function isMSIE(): bool {return stripos($_SERVER['HTTP_USER_AGENT'], 'MSIE') !== false;}
	static function isEdge(): bool {return stripos($_SERVER['HTTP_USER_AGENT'], 'Edge') !== false;}

	static function encodeFileName($fileName): string {
		$fileName = \S::convert2UTF8($fileName);
		return '"'.((self::isMSIE() || self::isEdge()) ? \S::forURL($fileName) : $fileName).'"';
	}

	static function sendHTTPFile($path, $changeFilenameTo = "") {
		global $settings;
		if (!file_exists($path)) {
			header("HTTP/1.1 404 Not Found");
			return false;
		}

		$filename = $changeFilenameTo ?: \FM::basename($path);
		header("Content-Type: application/octet-stream; charset=UTF-8");
		header('Content-Disposition: attachment; filename='.self::encodeFileName($filename));
		if (self::isMSIE()) {
			header("Cache-Control: cache, must-revalidate");
			header("Pragma: public");
		}

		$fileSize = \FM::getFileSize($path);

		if ($settings->download_accelerator) {
			$rs = false;
			if ($settings->download_accelerator == 'x_accel') {
				$rs = self::sendWithXAccel($path);
			} else if ($settings->download_accelerator == 'xsendfile') {
				$rs = self::sendWithXSendfile($path);
			} else if ($settings->download_accelerator == 'lightspeed') {
				$rs = self::sendWithLightSpeed($path);
			}
			if ($rs) {
				self::$downloadMethod = $settings->download_accelerator;
				self::$bytesSentToBrowser = $fileSize;
				return "unknown";
			}
		}

		return self::sendDefault($path, $fileSize);
	}

	static function sendFileToBrowser($path, $changeFilenameTo = "") {
		global $settings;
		if (!file_exists($path)) {
			header("HTTP/1.1 404 Not Found");
			echo "The file was not found";
			return false;
		}

		$mtime = @filemtime($path);
		$RFC2616 = false;
		if ($mtime) {
			$RFC2616 = gmdate('D, d M Y H:i:s T', $mtime);
			if(isset($_SERVER['HTTP_IF_MODIFIED_SINCE'])) {
				if (S::forHTML($_SERVER['HTTP_IF_MODIFIED_SINCE']) == $RFC2616) {
					header('HTTP/1.0 304 Not Modified', true, 304);
					self::$bytesSentToBrowser = 0;
					return "unknown";
				}
			}
		}
		if ($RFC2616) {
			header('Last-Modified: '. $RFC2616);
		}

		$filename = \FM::basename($path);
		$ext = \FM::getExtension($filename);
		if ($changeFilenameTo) {$filename = $changeFilenameTo;}
		$mime_type = \FM::mime_type($filename);
		header('Content-Type: '.$mime_type);
		if ($mime_type == "application/octet-stream") {
			$disposition = 'attachment';
		} else {
			$disposition = 'inline';
		}
		header('Content-Disposition: '.$disposition.'; filename='.self::encodeFileName($filename).'');

		$fileSize = \FM::getFileSize($path);

		if ($settings->download_accelerator) {
			$rs = false;
			if ($settings->download_accelerator == 'x_accel') {
				$rs = self::sendWithXAccel($path);
			} else if ($settings->download_accelerator == 'xsendfile') {
				$rs = self::sendWithXSendfile($path);
			} else if ($settings->download_accelerator == 'lightspeed') {
				$rs = self::sendWithLightSpeed($path);
			}
			if ($rs) {
				self::$downloadMethod = $settings->download_accelerator;
				self::$bytesSentToBrowser = $fileSize;
				return "unknown";
			}
		}

		if (self::isMSIE()) {
			header("Cache-Control: cache, must-revalidate");
			header("Pragma: public");
		}
		if ($ext == "pdf" && self::isMSIE()) {//disable range download for MSIE with PDFs
			header("Accept-Ranges: none");
			header("Content-Length: ".$fileSize);
			$offset = false;
			$length = false;
		} else {
			$rs = self::outputRangeHeadersAndGetOffset($fileSize);
			$offset = $rs[0];
			$length = $rs[1];
		}
		if ($_SERVER['REQUEST_METHOD'] == "HEAD") {return false;}
		self::outputFile($path, $offset, $length);
		if (
			(self::$bytesSentToBrowser == $fileSize) //100% of the file sent in one request
			||
			($offset > 0 && $offset+$length >= $fileSize && self::$bytesSentToBrowser == $length) //partial request, but includes the bottom of the file
		) {
			return "final";
		}
		return "partial";
	}

	static function outputRangeHeadersAndGetOffset($fileSize) {
		header('Accept-Ranges: bytes');
		$start = 0;
		$new_length = 0;
		if (isset($_SERVER['HTTP_RANGE'])) {
			$r = substr($_SERVER['HTTP_RANGE'], 6);
			if (strstr($r, ",")) {
				//multirange requests are not supported
				header("Content-Length: ".$fileSize);
			} else {
				$range = $r;
				$parts = explode('-', $range);
				$start = $parts[0];
				if (strlen($start) == 0) {$start = 0;}
				$end = $parts[1];
				if (strlen($end) == 0 || $end > $fileSize) {
					$end = $fileSize-1;
				}
				if ($start > $end) {
					header("HTTP/1.1 416 Requested Range Not Satisfiable");
					header("Content-Range: bytes */".$fileSize); // Required in 416.
					exit();
				}
				if ($end == $start) {
					$new_length = 1;
				} else {
					$new_length = $end-$start;
					if ($new_length < $fileSize) {
						$new_length++;
					}
				}
				header("HTTP/1.1 206 Partial Content");
				header("Content-Range: bytes ".$start."-".$end."/".$fileSize);
				header("Content-Length: ".$new_length);
			}
		} else {
			header("Content-Length: ".$fileSize);
		}
		return [$start, $new_length];
	}

	static function outputFile($path, $offset = false, $length = false) {
		self::$bytesSentToBrowser = 0;
		ignore_user_abort(true);
		@session_write_close();//avoid hanging
		@set_time_limit(86400);
		$context = stream_context_create();
		$handle = fopen($path, "rb", false, $context);
		if (!$handle) {return false;}
		if ($offset) {
			fseek($handle, $offset);
		}
		$chunkSize = 16384;
		$count = 0;
		while (!feof($handle)) {
			if ($length && $count+$chunkSize > $length) {
				$chunkSize = $length-$count;//remaining data is smaller than a chunk
			}
			$chunk = stream_get_contents($handle, $chunkSize);
			$thisChunkSize = strlen($chunk);
			$count = $count+$thisChunkSize;
			echo $chunk;
			self::$bytesSentToBrowser += $thisChunkSize;
			if ($length && $count >= $length) {
				//we hit out length
				break;
			}
			//flush();
			//@ob_flush();
			if (connection_aborted()) {
				return "aborted";
			}
		}
		fclose($handle);
		if (connection_aborted()) {
			return "aborted";
		}
		return true;
	}

	static function sendImageToBrowser($src, $maxCacheAge = 3600) {
		$fileSize = \FM::getFileSize($src);
		$fileName = \FM::basename($src);
		$last_modified_time = filemtime($src);
		$eTag = md5($fileSize.$last_modified_time);

		$d = new \DateTime($_SERVER['HTTP_IF_MODIFIED_SINCE']);
		$if_modified_since_unix_timestamp = $d->format("U");
		$gmt_last_modified = gmdate("U", $last_modified_time);

		$requestETag = str_replace('"', '', S::fromHTML($_SERVER['HTTP_IF_NONE_MATCH']));

		if ($requestETag == $eTag && $if_modified_since_unix_timestamp == $gmt_last_modified) {
			header('HTTP/1.1 304 Not Modified');
		}

		header('Etag: "'.$eTag.'"');
		header("Cache-Control: private, max-age=".$maxCacheAge);
		header("Last-Modified: ".gmdate("D, d M Y H:i:s", $last_modified_time)." GMT");

		if ($requestETag != $eTag || $if_modified_since_unix_timestamp != $gmt_last_modified) {
			header('Content-Disposition: inline; filename='.self::encodeFileName($fileName));
			header("Content-Type: image/png");
			header("Content-Length: ".$fileSize);
			self::outputFile($src);
		}
	}

}