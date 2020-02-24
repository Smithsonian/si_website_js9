/*
 * status plugin (February 20, 2020)
 */

/*global $, sprintf, JS9 */

"use strict";

// create our namespace, and specify some meta-information and params
JS9.Statusbar = {};
JS9.Statusbar.CLASS = "JS9";      // class of plugins (1st part of div class)
JS9.Statusbar.NAME = "Statusbar"; // name of this plugin (2nd part of div class)
JS9.Statusbar.WIDTH =  512;       // width of light window
JS9.Statusbar.HEIGHT = 24;        // height of light window
JS9.Statusbar.BASE = JS9.Statusbar.CLASS + JS9.Statusbar.NAME;

// when an item is clicked, we want to highlight it
JS9.Statusbar.setup = function(target){
    // unhighlight
    $(target).removeClass("JS9StatusbarItemNoHighlight");
    $(target).addClass("JS9StatusbarItemHighlight");
};

// try to display a control plugin for a given menu
JS9.Statusbar.xeq = function(target){
    let s, arr;
    // unhighlight
    $(target).removeClass("JS9StatusbarItemHighlight");
    $(target).addClass("JS9StatusbarItemNoHighlight");
    // look at the html for this element
    s = $(target).html();
    if( s ){
	// is there a hint about what sort of menu status it contains?
	arr = s.match(/file|edit|view|zoom|scale|color|regions|wcs|analysis/i);
    }
    // bring up a control plugin, if possible
    if( arr && arr[0] ){
	switch(arr[0]){
	case "file":
	    break;
	case "edit":
	    break;
	case "view":
	    break;
	case "zoom":
	    break;
	case "scale":
	    JS9.DisplayPlugin("JS9Scale");
	    break;
	case "color":
	    break;
	case "regions":
	    break;
	case "wcs":
	    break;
	case "analysis":
	    break;
	}
    }
}

// redraw status on display
JS9.Statusbar.display = function(im){
    let i, status;
    let s = "";
    if( im && JS9.globalOpts.statusBar ){
	if( $.isArray(JS9.globalOpts.statusBar) ){
	    // array of parameter names
	    for(i=0; i<JS9.globalOpts.statusBar.length; i++){
		status = JS9.globalOpts.statusBar[i];
		s += sprintf("<span class='JS9StatusbarItemContainer JS9StatusbarItemNoHighlight' onmousedown='JS9.Statusbar.setup(this)' onmouseup='JS9.Statusbar.xeq(this)'>%s: <span class='JS9StatusbarItemValue'>$%s</span></span>", status, status);
	    }
	} else {
	    // formatted string
	    // escape brackets and parens before macro expansion, then unescape
	    s = JS9.globalOpts.statusBar
	        .replace(/\(/g, " __OP__ ")
	        .replace(/\)/g, " __CP__ ")
	        .replace(/\[/g, " __OB__ ")
	        .replace(/\]/g, " __CB__ ");
	    s = im.expandMacro(s)
	        .replace(/ __OP__ /g, "(")
	        .replace(/ __CP__ /g, ")")
	        .replace(/ __OB__ /g, "[")
	        .replace(/ __CB__ /g, "]");
	    // wrap in element containers
	    s = `<span class='JS9StatusbarItemContainer JS9StatusbarItemNoHighlight' onmousedown='JS9.Statusbar.setup(this)' onmouseup='JS9.Statusbar.xeq(this)'>${s}</span>`
	        .replace(/; */g, "</span>&nbsp;<span class='JS9StatusbarItemContainer JS9StatusbarItemNoHighlight' onmousedown='JS9.Statusbar.setup(this)' onmouseup='JS9.Statusbar.xeq(this)'>")
	        .replace(/\$img\(([^()]+)\)/g, "<img src='$1' name='$1' class='JS9StatusbarImage JS9StatusbarImageOption'>");
	}
	this.statusContainer.html(s);
    } else {
	this.statusContainer.html("");
    }
};

// constructor: add HTML elements to the plugin
// eslint-disable-next-line no-unused-vars
JS9.Statusbar.init = function(width, height){
    // on entry, these elements have already been defined:
    // this.div:      the DOM element representing the div for this plugin
    // this.divjq:    the jquery object representing the div for this plugin
    // this.id:       the id of the div (or the plugin name as a default)
    // this.display:  the display object associated with this plugin
    // this.dispMode: display mode (for internal use)
    //
    // set width and height of plugin itself
    this.width = this.divjq.attr("data-width");
    if( !this.width  ){
	this.width = width || JS9.Statusbar.WIDTH;
    }
    this.divjq.css("width", this.width);
    this.width = parseInt(this.divjq.css("width"), 10);
    this.height = this.divjq.attr("data-height");
    if( !this.height  ){
	this.height = height || JS9.Statusbar.HEIGHT;
    }
    this.divjq.css("height", this.height);
    this.height = parseInt(this.divjq.css("height"), 10);
    // clean plugin container
    this.divjq.html("");
    // status container
    this.statusContainer = $("<div>")
	.addClass(`${JS9.Statusbar.BASE}Container`)
	.attr("id", `${this.id}Container`)
        .attr("width", this.width)
        .attr("height", this.height)
	.appendTo(this.divjq);
    // display current status, if necessary
    if( this.display.image ){
	JS9.Statusbar.display.call(this, this.display.image);
    }
};

// callback when image is (re-)displayed
JS9.Statusbar.imagedisplay = function(im){
    if( im ){
	JS9.Statusbar.display.call(this, im);
    }
};

// callback when image is cleared or closed
// eslint-disable-next-line no-unused-vars
JS9.Statusbar.imageclear = function(im){
    JS9.Statusbar.display.call(this, null);
};

// dynamic change
JS9.Statusbar.dynamic = function(im){
    let status;
    if( im ){
	status = im.display.pluginInstances.JS9Statusbar;
	if( status && status.isDynamic ){
	    JS9.Statusbar.imagedisplay.call(this, im);
	}
    }
};

// add this plugin into JS9
JS9.RegisterPlugin(JS9.Statusbar.CLASS, JS9.Statusbar.NAME, JS9.Statusbar.init,
		   {menuItem: "Status",
		    dynamicSelect: true,
		    ondynamicselect: JS9.Statusbar.dynamic,
		    onimagedisplay: JS9.Statusbar.imagedisplay,
		    onimageclear: JS9.Statusbar.imageclear,
		    onimageclose: JS9.Statusbar.imageclear,
		    onsetcolormap: JS9.Statusbar.imagedisplay,
		    onsetcontrastbias: JS9.Statusbar.imagedisplay,
		    onsetpan: JS9.Statusbar.imagedisplay,
		    onsetscale: JS9.Statusbar.imagedisplay,
		    onsetwcssys: JS9.Statusbar.imagedisplay,
		    onsetwcsunits: JS9.Statusbar.imagedisplay,
		    onsetzoom: JS9.Statusbar.imagedisplay,
		    help: "help/status.html",
		    winTitle: "Status",
		    winDims: [JS9.Statusbar.WIDTH, JS9.Statusbar.HEIGHT]});
