// SVG Pan/Zoom that can be used with autoscaled SVGs by Remco Tukker (2014)
// Distributed under a Apache V2 license

var addPanZoomToSVG = function(config) {

    /* ===== take care of config =====                                             */

    var defaultConfig = {
        svgID: svg,             // ID of the svg element that should catch mouse clicks and touches
        panzoomID: panzoom,     // ID of the element that should be panzoomed
        scrollSpeed: 5,         // Speed of scroll zooming
        pinchSpeed: 1,          // Speed of pinch zooming (5 times smaller than scrollSpeed is an ok choice)
        upOnMouseOut: false     // treat mouse leaving svg area as a mouseup event
    }
    config = config || {};
    for (var key in defaultConfig) if (typeof config[key] == "undefined") config[key] = defaultConfig[key];

    // set up the panzoom transform we're going to use
    var svg = document.getElementById(config.svgID);       
    var panzoom = document.getElementById(config.panzoomID); 
    panzoom.transform.baseVal.appendItem(panzoom.transform.baseVal.createSVGTransformFromMatrix(svg.createSVGMatrix()));
    var tf = panzoom.transform.baseVal.getItem(panzoom.transform.baseVal.numberOfItems - 1);
    var tfMatrix = tf.matrix;

    // mouse and touches state; this object will hold all the locations of touches / mouse, accessed by a touch ID
    var ongoingTouches = {};


    /* ===== functions for panning and zooming =====                               */

    // Convert screen-based coordinates (eg from mouse events) into the panzoom coordinate system
    function screenToPanZoomCoords(x, y) {
      var pt = svg.createSVGPoint();
      pt.x = x;
      pt.y = y;
      return pt.matrixTransform(panzoom.getScreenCTM().inverse());
    }

    // pan the image a certain distance (from screen coords to screen coords)
    function pan(xold, yold, xnew, ynew) {
      var pt1 = screenToPanZoomCoords(xold, yold); // to make sure we always use the newest transform
      var pt2 = screenToPanZoomCoords(xnew, ynew);
      tfMatrix = tfMatrix.translate(pt2.x - pt1.x, pt2.y - pt1.y);
      tf.setMatrix(tfMatrix);
    }

    // zoom the image at a certain x y location (in screen coordinates)
    function zoom(x, y, factor) {  
      var pt = screenToPanZoomCoords(x, y);
      tfMatrix = tfMatrix.translate(pt.x, pt.y).scale(factor).translate(-pt.x, -pt.y); // first translate x and y to origin, then zoom, then translate origin back to x y
      tf.setMatrix(tfMatrix);
    }


    /* ===== functions for handling of events =====                                */

    // Calculate average point of ongoingTouches and the total distance from that point to touches; ongoingTouches must not be empty! 
    function touchLocationAndRadius() { 
      var x = 0, y = 0, rsquared = 0;
      for (var key in ongoingTouches) {
          x += ongoingTouches[key].x;
          y += ongoingTouches[key].y;
      }
      x /= Object.keys(ongoingTouches).length; y /= Object.keys(ongoingTouches).length;
      for (var key in ongoingTouches) rsquared += (ongoingTouches[key].x - x) * (ongoingTouches[key].x - x) + (ongoingTouches[key].y - y) * (ongoingTouches[key].y - y);
      return {x: x, y: y, rsquared: rsquared};
    }

    // mousedown / touchstart handling: add item to ongoingTouches object
    function down(evt) {
      if (!evt.changedTouches) evt.changedTouches = [{identifier: "mouse", clientX: evt.clientX, clientY: evt.clientY}]; // make mouse event look like touch event
      for (var i=0; i < evt.changedTouches.length; i++) ongoingTouches[evt.changedTouches[i].identifier] = {x: evt.changedTouches[i].clientX, y: evt.changedTouches[i].clientY};
    }

    // mousemove / touchmove handling
    function move(evt) {

      var touchIds = Object.keys(ongoingTouches);
      if (touchIds.length == 0) return;  // no touches going on / mouse not pressed
      evt.preventDefault();              // no scrolling of whole webpage with fingers

      if (!evt.changedTouches) evt.changedTouches = [{identifier: "mouse", clientX: evt.clientX, clientY: evt.clientY}]; // make mouse look like finger

      if (touchIds.length == 1) {   // just one finger or mouse => do panning
        pan(ongoingTouches[touchIds[0]].x, ongoingTouches[touchIds[0]].y, evt.changedTouches[0].clientX, evt.changedTouches[0].clientY);
        ongoingTouches[touchIds[0]].x = evt.changedTouches[0].clientX; // update touch info
        ongoingTouches[touchIds[0]].y = evt.changedTouches[0].clientY;  

      } else {                      // multiple fingers => do panning and zooming
        var oldGesture = touchLocationAndRadius();            // get old location and radius
        for (var i=0; i < evt.changedTouches.length; i++) {   // update touch info
          ongoingTouches[evt.changedTouches[i].identifier].x = evt.changedTouches[i].clientX;
          ongoingTouches[evt.changedTouches[i].identifier].y = evt.changedTouches[i].clientY;
        } 
        var newGesture = touchLocationAndRadius();            // get new location and radius

        pan(oldGesture.x, oldGesture.y, newGesture.x, newGesture.y);               // first handle any panning
        var z = Math.pow(newGesture.rsquared / oldGesture.rsquared, config.pinchSpeed);   // find out how much we want to zoom
        zoom(newGesture.x, newGesture.y, z);                                       // and then zoom in

      }
    }

    // mousewheel handling
    function wheel(evt) {
      var z = 1 + (0.01 * evt.deltaY / Math.abs(evt.deltaY)) * config.scrollSpeed;         // calculate how much we want to scale
                                // the Math.abs is to deal with some nasty browser differences in deltaY numbers
      zoom(evt.clientX, evt.clientY, z);                                                // and then zoom in
      evt.preventDefault();                                                             // prevent scrolling of page
    }

    // mouseup / touchend handling
    function up(evt) {
      if (!evt.changedTouches) evt.changedTouches = [{identifier: "mouse"}];            // make mouse look like touch
      for (var i=0; i < evt.changedTouches.length; i++) delete ongoingTouches[evt.changedTouches[i].identifier]; 
    }


    /* ===== registering event handlers =====                                      */

    svg.addEventListener('mousedown', down);
    svg.addEventListener('touchstart', down);
    svg.addEventListener('mouseup', up);
    svg.addEventListener('touchend', up);
    svg.addEventListener('touchcancel', up);
    svg.addEventListener('mouseleave', function(evt){ if (config.upOnMouseOut) return up(evt); }); 
    svg.addEventListener('mousemove', move);
    svg.addEventListener('touchmove', move);
    // The "wheel" event is rather new, see if it works on some older browsers (IE9 comes to mind..)
    svg.addEventListener('wheel', wheel);

    svg.addEventListener('dragstart', function(evt) {evt.preventDefault(); }); // no dragging away svg elements please

};
