    // SVG Pan/Zoom that can be used with autoscaled SVGs by Remco Tukker (2014)
    // Distributed under a Apache V2 license
    //

    var svggraph = document.getElementById("svgtiger");
    var svgpanzoom = svggraph.getElementById("tigerpanzoom");    

    // config
    var zoomSensitivity = 5;   // speed of zooming
    var ignoreMouseOut = true; // ignore mouse out or handle it as a mouseup event
      // mouseout events are being generated when leaving -every- svg element; so, add test for evt.target == svg
    
    // get the currently used transformation; we have to do it this way only because of IE (see better alternative below)
    var tfstring = svgpanzoom.getAttribute("transform");
    if (!tfstring) tfstring = "matrix(1,0,0,1,0,0)";
    var tfmatels = [];
    tfstring = tfstring.slice( tfstring.indexOf("(") + 1 );
    tfmatels[0] = parseFloat(tfstring);
    for (var i = 1; i < 6; i++) {
        tfstring = tfstring.slice( (tfstring.indexOf(",") + 1 ) || (tfstring.indexOf(" ") + 1 ) );
        tfmatels[i] = parseFloat(tfstring);
    }
    var tf = svggraph.createSVGMatrix(); 
    tf.a = tfmatels[0]; tf.b = tfmatels[1]; tf.c = tfmatels[2]; tf.d = tfmatels[3]; tf.e = tfmatels[4]; tf.f = tfmatels[5]; 
    
    /* Alternative that is supported by all browsers except IE: (for V2... Maybe IE 12 will work? One can hope..)
    var tf = svggraph.createSVGMatrix(); 
    var transformList = svgpanzoom.transform.baseVal;
    var panZoomTransform = transformList.createSVGTransformFromMatrix(tf);
    transformList.appendItem(panZoomTransform); // add our own transform to the transforms that are already there
    //panZoomTransform.setMatrix(tf);  // to update transform
    */

    // mouse and touches state
    var mousePressed = false, lastX, lastY;
    var ongoingTouches = {};

    // convert screen-based coordinates (eg from mouse events) into the panzoom coordinate system
    function screenToPanZoomCoords(x, y) {
      var pt = svggraph.createSVGPoint();
      pt.x = x;
      pt.y = y;
      return pt.matrixTransform(svgpanzoom.getScreenCTM().inverse());
    }

    // pan the image a certain x and y distance (in panzoom coordinates!)
    function pan(x, y) {
      tf = tf.translate(x, y);
      svgpanzoom.setAttribute("transform", "matrix(" + tf.a + " " + tf.b + " " + tf.c + " " + tf.d + " " + tf.e + " " + tf.f + ")");
    }

    // zoom the image at a certain x y location (in panzoom coordinates!)
    function zoom(x, y, factor) {  
      // first translate x and y to origin, then zoom, then translate origin back to x y
      tf = tf.translate(x, y).scale(factor).translate(-x, -y);
      svgpanzoom.setAttribute("transform", "matrix(" + tf.a + " " + tf.b + " " + tf.c + " " + tf.d + " " + tf.e + " " + tf.f + ")");
    }

    // functions for processing mouse movements
    function mouseDown(evt) {
      mousePressed = true;
      lastX = evt.clientX;
      lastY = evt.clientY;
      //return false; // prevents browser from dragging elements in some situations
    }

    function touchDown(evt) {
      evt.preventDefault();

      var touches = evt.changedTouches;
      for (var i=0; i < touches.length; i++) {
        ongoingTouches[touches[i].identifier] = {x: touches[i].clientX, y: touches[i].clientY};
      } 
    }

    function touchUp(evt) {
      // remove touches from our list
      evt.preventDefault();
      var touches = evt.changedTouches;
      for (var i=0; i < touches.length; i++) {
        delete ongoingTouches[touches[i].identifier];
      } 
    }

    function touchMove(evt) {
      evt.preventDefault();
      var touches = Object.keys(ongoingTouches);
      if (touches.length == 1) { // pan
        var pt1 = screenToPanZoomCoords(ongoingTouches[touches[0]].x, ongoingTouches[touches[0]].y); // to make sure we always use the newest transform
        var pt2 = screenToPanZoomCoords(evt.changedTouches[0].clientX, evt.changedTouches[0].clientY);
        pan(pt2.x - pt1.x, pt2.y - pt1.y);
        ongoingTouches[touches[0]].x = evt.changedTouches[0].clientX;
        ongoingTouches[touches[0]].y = evt.changedTouches[0].clientY;
      } else { // pinch-zoom
        // find out last center and radius
        var oldx = 0, oldy = 0, oldr = 0;
        for (var key in ongoingTouches) {
          oldx += ongoingTouches[key].x; // we'll divide by touches.length in the end
          oldy += ongoingTouches[key].y;
        }
        oldx /= touches.length; oldy /= touches.length; // clearly, touches shouldnt be empty, lets see if we can break this
        for (var key in ongoingTouches) {
          oldr += (ongoingTouches[key].x - oldx) * (ongoingTouches[key].x - oldx) + (ongoingTouches[key].y - oldy) * (ongoingTouches[key].y - oldy);
        }
        console.log("old: " + oldx + "  " + oldy + "  " + oldr + " length " + touches.length);
        // update touch info
        for (var i=0; i < evt.changedTouches.length; i++) {
          ongoingTouches[evt.changedTouches[i].identifier].x = evt.changedTouches[i].clientX;
          ongoingTouches[evt.changedTouches[i].identifier].y = evt.changedTouches[i].clientY;
        } 

        // find out new center and radius
        var newx = 0, newy = 0, newr = 0;
        for (var key in ongoingTouches) {
          newx += ongoingTouches[key].x; // we'll divide by touches.length in the end
          newy += ongoingTouches[key].y;
        }
        newx /= touches.length; newy /= touches.length; // clearly, touches shouldnt be empty, lets see if we can break this
        for (var key in ongoingTouches) {
          newr += (ongoingTouches[key].x - newx) * (ongoingTouches[key].x - newx) + (ongoingTouches[key].y - newy) * (ongoingTouches[key].y - newy);
        }
         console.log("new: " + newx + "  " + newy + "  " + newr + " length " + Object.keys(ongoingTouches).length);
        // pan and zoom
        var pt1 = screenToPanZoomCoords(oldx, oldy); 
        var pt2 = screenToPanZoomCoords(newx, newy);
        pan(pt2.x - pt1.x, pt2.y - pt1.y);

        var pt = screenToPanZoomCoords(newx, newy); // get newest coords
        var z = Math.pow(newr / oldr, zoomSensitivity/2);         // TODO: this should be done a bit better, preferably similar to mouse
        console.log(z);
        zoom(pt.x, pt.y, z);                                      // and then zoom in

      }

      
    }


    function mouseUp(evt) {
      mousePressed = false;
    }

    function mouseMove(evt) {
      if (!mousePressed) return false; // only have to do something when mouse is pressed    

      var pt1 = screenToPanZoomCoords(lastX, lastY); // to make sure we always use the newest transform
      var pt2 = screenToPanZoomCoords(evt.clientX, evt.clientY)
      pan(pt2.x - pt1.x, pt2.y - pt1.y);

      lastX = evt.clientX;
      lastY = evt.clientY;
   
      return false;
    }

    function wheel(evt) {
      var pt = screenToPanZoomCoords(evt.clientX, evt.clientY); // find out location in panzoom coordinates
      var z = 1 + (0.01 * evt.deltaY / Math.abs(evt.deltaY)) * zoomSensitivity;         // calculate how much we want to scale
                                      // the Math.abs is to deal with some nasty browser differences in deltaY differences
      
      zoom(pt.x, pt.y, z);                                      // and then zoom in
      evt.preventDefault();
      return false; 
    }

    // last but not least, the necessary event listeners
    svggraph.addEventListener('mousedown', function(evt){ return mouseDown(evt); });
    svggraph.addEventListener('touchstart', function(evt){ return touchDown(evt); });
    svggraph.addEventListener('mouseup', function(evt){ return mouseUp(evt); });
    svggraph.addEventListener('touchend', function(evt){ return touchUp(evt); });
    //svggraph.addEventListener('touchleave', function(evt){ return touchUp(evt); });
    svggraph.addEventListener('touchcancel', function(evt){ return touchUp(evt); });
    svggraph.addEventListener('mouseout', function(evt){ return ignoreMouseOut || mouseUp(evt); });
    svggraph.addEventListener('mousemove', function(evt){ return mouseMove(evt); });
    svggraph.addEventListener('touchmove', function(evt){ return touchMove(evt); });

    // the "wheel" event is rather new, but if it doesnt work due to old browser, too bad, not important..
    svggraph.addEventListener('wheel', function(evt){ return wheel(evt) });

    svgpanzoom.addEventListener('dragstart', function(evt) {evt.preventDefault(); }); // no dragging away svg elements please
    
