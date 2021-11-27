(function (factory) {
	factory(window.jQuery);
}(function ($) {

// Extends plugins for print plugin.
$.extend($.summernote.plugins, {

	'print': function (context) {
		var self = this;
		var ui = $.summernote.ui;
		var $editor = context.layoutInfo.editor;
		var options = context.options;

		var isFF = function () {
			const userAgent = navigator.userAgent;
			const isEdge = /Edge\/\d+/.test(userAgent);
			return !isEdge && /firefox/i.test(userAgent)
		};

		var fillContentAndPrint = function($frame, content) {
			$frame.contents().find('body').html(content);
			setTimeout(function () {
			  $frame[0].contentWindow.focus();
			  $frame[0].contentWindow.print();
			  $frame.remove();
			  $frame = null;
			}, 250);
		};

		var getPrintframe = function ($container) {
			var $frame = $(
			  '<iframe name="summernotePrintFrame"' +
			  'width="0" height="0" frameborder="0" src="about:blank" style="visibility:hidden">' +
			  '</iframe>');
			$frame.appendTo($editor.parent());
			var $head = $frame.contents().find('head');
			if (options.print && options.print.stylesheetUrl) {
			  // Use dedicated styles
			  var css = document.createElement('link');
			  css.href = options.print.stylesheetUrl;
			  css.rel = 'stylesheet';
			  css.type = 'text/css';
			  $head.append(css);
			}
			return $frame;
		};

		// add print button
		context.memo('button.print', function () {
			// create button
			var button = ui.button({
			  contents: '<i class="fa fa-print" style="color:black;font-weight:600;line-height: 1.6em"></i>',
			  tooltip: FR.T('Print'),
			  container: options.container,
			  click: function () {
				var $frame = getPrintframe();
				var content = context.invoke('code');
				if (isFF()) {
					$frame[0].onload = function () {
						fillContentAndPrint($frame, content);
					};
				} else {
					fillContentAndPrint($frame, content);
				}
			  }
			});
			return button.render();
		});
		}
	});
}));
