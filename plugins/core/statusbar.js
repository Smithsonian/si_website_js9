/*
 * status plugin (February 20, 2020)
 */

/*global $, JS9 */

"use strict";

// create our namespace, and specify some meta-information and params
JS9.Statusbar = {};
JS9.Statusbar.CLASS = "JS9";      // class of plugins (1st part of div class)
JS9.Statusbar.NAME = "Statusbar"; // name of this plugin (2nd part of div class)
JS9.Statusbar.WIDTH =  512;       // width of light window
JS9.Statusbar.HEIGHT = "auto";        // height of light window
JS9.Statusbar.COLORWIDTH =  135;  // width of colorbar, if present
JS9.Statusbar.COLORHEIGHT = 14;   // height of colorbar, if present
JS9.Statusbar.BASE = JS9.Statusbar.CLASS + JS9.Statusbar.NAME;

// when an item is clicked, we want to highlight it
JS9.Statusbar.setup = function(target){
    // unhighlight
    $(target).removeClass("JS9StatusbarItemNoHighlight");
    $(target).addClass("JS9StatusbarItemHighlight");
};

// try to display a control plugin for a given menu
JS9.Statusbar.xeq = function(target, id){
    let s, arr;
    // unhighlight
    $(target).removeClass("JS9StatusbarItemHighlight");
    $(target).addClass("JS9StatusbarItemNoHighlight");
    // look at the html for this element
    s = $(target).attr("name");
    if( s ){
	// is there a hint about what sort of menu status it contains?
	arr = s.match(/file|image|edit|view|zoom|scale|color|regions|wcs|analysis/i);
    }
    // bring up a control plugin, if possible
    if( arr && arr[0] ){
	switch(arr[0]){
	case "file":
	case "image":
	    JS9.DisplayPlugin("FITSBinning", {display: id});
	    break;
	case "edit":
	    break;
	case "view":
	    break;
	case "zoom":
	    break;
	case "scale":
	    JS9.DisplayPlugin("JS9Scale", {display: id});
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
    let i, s, t, oarr, arr, elements, index;
    let html = "";
    let delim = /;/;
    if( im && JS9.globalOpts.statusBar ){
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
	if( JS9.globalOpts.statusBar !== im.tmp.statusbar ){
	    // original statusbar items
	    oarr = JS9.globalOpts.statusBar.split(delim);
	    // current values of items in the status bar
	    arr = s.split(delim);
	    for(i=0; i<arr.length; i++){
		t = `<div name='__dummy__' class='JS9StatusbarItem JS9StatusbarItemNoHighlight' onmousedown='JS9.Statusbar.setup(this)' onmouseup='JS9.Statusbar.xeq(this, "${this.display.id}")'>${arr[i]}</div>&nbsp;`
		.replace(/\$img\(([^()]+)\)/g, "<img src='$1' name='$1' class='JS9StatusbarImageItem JS9StatusbarItemNoHighlight'>")
		.replace(/\$colorbar/g, `<div name='JS9Colorbar' id='${this.id.replace(/Statusbar/, "Colorbar")}' class='JS9Colorbar JS9StatusbarPluginItem' data-width="${this.colorwidth}px" data-height="${this.colorheight}px" data-showTicks="false" ></div>`)
		.replace(/__dummy__/, oarr[i].replace(/\s+/, "_"));
		html += t;
	    }
	    // set statusbar
	    this.statusContainer.html(html);
	    // colorbar plugin: run AddDivs, remove colorbar from resize list
	    if( JS9.globalOpts.statusBar.match(/\$colorbar/) ){
		JS9.AddDivs({display: im});
		index = JS9.globalOpts.resizeDivs.indexOf("JS9Colorbar");
		if( index >= 0 ){
		    JS9.globalOpts.resizeDivs.splice(index, 1);
		}
	    }
	    // save the format to detect changes
	    im.tmp.statusbar = JS9.globalOpts.statusBar;
	} else {
	    // elements associated with items in statusbar
	    elements = this.divjq.find(`.JS9StatusbarItem`);
	    arr = s.split(delim);
	    // for each element ...
	    for(i=0; i<elements.length; i++){
		// that is not a plugin ...
		if( !arr[i].match(/\$colorbar/) ){
		    // set new value
		    $(elements[i]).html(arr[i]);
		}
	    }
	}
    } else {
	// clear statusbar
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
    this.colorwidth = parseInt(this.divjq.attr("data-colorbarwidth"), 10) || JS9.Statusbar.COLORWIDTH;
    this.colorheight = parseInt(this.divjq.attr("data-colorbarheight"), 10) || JS9.Statusbar.COLORHEIGHT;
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
		    onsetwcssys: JS9.Statusbar.imagedisplay,
		    onsetwcsunits: JS9.Statusbar.imagedisplay,
		    help: "help/status.html",
		    winTitle: "Status",
		    winDims: [JS9.Statusbar.WIDTH, JS9.Statusbar.HEIGHT]});
