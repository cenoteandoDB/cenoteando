Ext.ux.GridDragSelector = function (cfg) {
	cfg = cfg || {};
	var grid, view, mb, regions, proxy, tracker;
	var rs, bodyRegion, dragRegion = new Ext.lib.Region(0, 0, 0, 0);
	var dragSafe = cfg.dragSafe === true;
	this.init = function (grd) {
		grid = grd;
		view = grd.getView();
		grid.on('render', onRender);
	};
	function fillRegions() {
		rs = [];
		var gr = view.getRows();
		for (var j = 0; j < gr.length; j++) {
			rs[rs.length] = Ext.get(gr[j]).getRegion();
		}
		bodyRegion = mb.getRegion();
	}
	function cancelClick() {return false;}
	function onBeforeStart(e) {
		var r = new Ext.lib.Region(mb.getTop(), mb.getLeft() + mb.getViewSize().width, mb.getTop() + mb.getViewSize().height, mb.getLeft());
		var b = (e.getTarget() == mb.dom || e.getTarget() == view.mainBody.dom);
		return dragSafe && b;
	}
	function onStart(e) {
		grid.on('containerclick', cancelClick, view, {
			single: true
		});
		proxy = mb.parent().first('.x-view-selector');
		if (!proxy) {
			proxy = mb.parent().createChild({cls: 'x-view-selector'});
		}
		fillRegions();
		grid.getSelectionModel().clearSelections();
	}
	function onDrag(e) {
		var startXY = tracker.startXY;
		var xy = tracker.getXY();
		var x = Math.min(startXY[0], xy[0]);
		var y = Math.min(startXY[1], xy[1]);
		var w = Math.abs(startXY[0] - xy[0]);
		var h = Math.abs(startXY[1] - xy[1]);
		dragRegion.left = x;
		dragRegion.top = y;
		dragRegion.right = x + w;
		dragRegion.bottom = y + h;
		dragRegion.constrainTo(bodyRegion);
		proxy.setRegion(dragRegion);
		for (var i = 0, len = rs.length; i < len; i++) {
			var r = rs[i],
				sel = dragRegion.intersect(r);
			if (sel && !r.selected) {
				r.selected = true;
				grid.getSelectionModel().selectRow(i, true);
			} else if (!sel && r.selected) {
				r.selected = false;
				grid.getSelectionModel().deselectRow(i);
			}
		}
	}
	function onEnd(e) {if (proxy) {proxy.remove();}}
	function onRender(grd) {
		tracker = new Ext.dd.DragTracker({
			onBeforeStart: onBeforeStart,
			onStart: onStart,
			onDrag: onDrag,
			onEnd: onEnd
		});
		mb = grd.getView().scroller;
		tracker.initEl(mb);
	}
};