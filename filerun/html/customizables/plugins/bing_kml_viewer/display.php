<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
	<title><?php echo $this->JSconfig['title'];?></title>
	<script type="text/javascript">
		function GetMap() {
			map = new Microsoft.Maps.Map('#myMap', { credentials:'<?php echo self::getSetting('APIKey');?>' });
			//Load the GeoXml module.
			Microsoft.Maps.loadModule('Microsoft.Maps.GeoXml', function () {
				//Parse the XML data.
				Microsoft.Maps.GeoXml.readFromUrl('<?php echo $url; ?>', null, function (data) {
					//Do something with the parsed XML data, in this case render it.
					renderGeoXmlDataSet(data);
				});
			});
		}
		function renderGeoXmlDataSet(data) {
			//Add all shapes that are not in layers to the map.
			if (data.shapes) {
				map.entities.push(data.shapes);
			}

			//Add all data layers to the map.
			if (data.layers) {
				for (var i = 0, len = data.layers.length; i < len; i++) {
					map.layers.insert(data.layers[i]);
				}
			}

			//Add all screen overlays to the map.
			if (data.screenOverlays) {
				for (var i = 0, len = data.screenOverlays.length; i < len; i++) {
					map.layers.insert(data.screenOverlays[i]);
				}
			}

			if (data.summary && data.summary.bounds) {
				//Set the map view to focus show the data.
				map.setView({ bounds: data.summary.bounds, padding: 30 });
			}
		}
	</script>
	<script type='text/javascript' src='https://www.bing.com/api/maps/mapcontrol?callback=GetMap' async defer></script>
	<style>
		body {margin:0;padding:0;border:0;}
	</style>
</head>
<body>
<div id="myMap" style="position:absolute;width: 100%; height: 100%;"></div>
</body>
</html>