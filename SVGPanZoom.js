    // SVG Pan/Zoom that can be used with autoscaled SVGs by Remco Tukker (2014)
    // Distributed under a Apache V2 license
    //
    // It is intended to work on modern browsers (Firefox, Chrome, IE9+, Android Browser 4+)
    //
    //   If going to IE10+ and Android 4.4+, we could maybe improve responsiveness by using requestAnimationFrame 
    //       TODO: use requestAnimationFrame if it is available
    //
    //       TODO: test on multiple browsers, then try to improve with getting/setting code below and test on multiple browsers again
    //
    // inspired by SVGPan ( https://code.google.com/p/svgpan/ ) by Andrea Leofreddi
    // (also see http://www.cyberz.org/blog/2009/12/08/svgpan-a-javascript-svg-panzoomdrag-library/)
    // and http://www.petercollingridge.co.uk/interactive-svg-components/pan-and-zoom-control
    // alt matrix transform getting/setting (does it work in other browsers?) elem.transform.baseVal.getItem(0).setMatrix(matrix);
        // Getting
    //    var xforms = myElement.transform.baseVal; // An SVGTransformList
    //    var firstXForm = xforms.getItem(0);       // An SVGTransform
    //    if (firstXForm.type == SVGTransform.SVG_TRANSFORM_TRANSLATE){
    //      var firstX = firstXForm.matrix.e,
    //          firstY = firstXForm.matrix.f;
    //    }
        // Setting
    //    myElement.transform.baseVal.getItem(0).setTranslate(30,100);
    //
    // the main svg container and the group that we want to pan/zoom
    // define as follows:
    // &lt;svg blablabla id="svggraph" &gt;
    // &lt;g id="svgpanzoom" transform="matrix(a,b,c,d,e,f)" &gt;  with a and d scale and e and f translation 
    console.log("panzoom loaded")

    var svggraph = document.getElementById("svgtiger");
    var svgpanzoom = svggraph.getElementById("tigerpanzoom");    

    // config
    var zoomSensitivity = 5;   // speed of zooming
    var ignoreMouseOut = true; // ignore mouse out or handle it as a mouseup event
      // TODO see why mouseout events are being generated when not really going out and how to fix that
    
    // the currently used transformation (note that getCTM gives us a wrong result due to autoscaling of image)
    var tfstring = svgpanzoom.getAttribute("transform");
    var tfmatrixelements = [];
    tfstring = tfstring.slice( tfstring.indexOf("(") + 1 );
    tfmatrixelements[0] = parseFloat(tfstring);
    for (var i = 1; i < 6; i++) {
        tfstring = tfstring.slice( (tfstring.indexOf(",") + 1 ) || (tfstring.indexOf(" ") + 1 ) );
        tfmatrixelements[i] = parseFloat(tfstring);
    }
    console.log(tfmatrixelements);
    var tf = svggraph.createSVGMatrix(); 
    tf.a = tfmatrixelements[0]; tf.b = tfmatrixelements[1]; tf.c = tfmatrixelements[2]; 
    tf.d = tfmatrixelements[3]; tf.e = tfmatrixelements[4]; tf.f = tfmatrixelements[5]; 

    // mouse state
    var mousePressed = false, lastX, lastY;

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
    svggraph.addEventListener('mouseup', function(evt){ return mouseUp(evt); });
    svggraph.addEventListener('mouseout', function(evt){ return ignoreMouseOut || mouseUp(evt); });
    svggraph.addEventListener('mousemove', function(evt){ return mouseMove(evt); });

    // the "wheel" event is rather new, but if it doesnt work due to old browser, too bad, not important..
    // TODO: does this work in mobile browser when pinching though? I do want _that_
    svggraph.addEventListener('wheel', function(evt){ return wheel(evt) });

    svgpanzoom.addEventListener('dragstart', function(evt) {evt.preventDefault(); }); // no dragging away svg elements please
    
