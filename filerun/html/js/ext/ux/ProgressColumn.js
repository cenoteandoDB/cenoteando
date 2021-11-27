Ext.ux.ProgressColumn = Ext.extend(Ext.grid.Column, {

    tpl: new Ext.XTemplate(
        '<tpl if="align == \'left\'">',
            '<div class="ux-progress-cell-inner ux-progress-cell-inner-{align} ux-progress-cell-background">',
                '<div>{value}</div>',
            '</div>',
            '<div class="ux-progress-cell-inner ux-progress-cell-inner-{align} ux-progress-cell-foreground {cls}" style="width:{pct}%" ext:qtip="{qtip}">',
                '<div ext:qtip="{qtip}">{value}</div>',
            '</div>',
        '</tpl>',
        '<tpl if="align != \'left\'">',
            '<div class="ux-progress-cell-inner ux-progress-cell-inner-{align} ux-progress-cell-foreground {cls}" ext:qtip="{qtip}">',
                '<div ext:qtip="{qtip}">{value}</div>',
            '</div>',
            '<div class="ux-progress-cell-inner ux-progress-cell-inner-{align} ux-progress-cell-background" style="left:{pct}%">',
                '<div style="left:-{pct}%">{value}</div>',
            '</div>',
        '</tpl>'
    ),
    constructor: function(config) {
        this.baseRenderer = config.renderer;
        Ext.grid.Column.call(this, config);
        this.renderer = Ext.ux.ProgressColumn.prototype.renderer.createDelegate(this);
    },
    // private
    renderer: function(val, meta, record, rowIndex, colIndex, store) {
	    var display = this.baseRenderer.apply(this, arguments);
	    if (!display) {display = Math.floor(val*100)+'%';}
	    if (val == 0 || val == 1) {
		    return display;
	    } else {
	        meta.css += ' x-grid3-td-progress-cell';
	        return this.tpl.apply({
	            align: this.align || 'left',
	            value: display,
	            pct: Math.floor(val*100)
	        });
	    }
    }
});