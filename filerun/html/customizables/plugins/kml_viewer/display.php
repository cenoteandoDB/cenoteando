<?php
global $settings;
?>
<!DOCTYPE html>
<html>
<head>
	<meta name="viewport" content="initial-scale=1.0">
	<meta charset="utf-8">
	<title><?php echo $this->JSconfig['title'];?>: <?php echo \S::safeHTML(\S::forHTML($this->data['fileName']));?></title>
	<style>
		/* Always set the map height explicitly to define the size of the div
		 * element that contains the map. */
		#map {
			height: 100%;
		}
		/* Optional: Makes the sample page fill the window. */
		html, body {
			height: 100%;
			margin: 0;
			padding: 0;
		}
	</style>
</head>
<body>
<div id="map"></div>
<script>
	function initMap() {
		var map = new google.maps.Map(document.getElementById('map'), {
			zoom: 2,
			center: {lat: 0, lng: 0}
		});

		var ctaLayer = new google.maps.KmlLayer({
			url: '<?php echo \S::safeJS($url);?>',
			preserveViewport: false,
			map: map
		});
	}
</script>
<script src="https://maps.googleapis.com/maps/api/js?key=<?php echo self::getSetting('APIKey');?>&callback=initMap" async defer></script>
</body>
</html>