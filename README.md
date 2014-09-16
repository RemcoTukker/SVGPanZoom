SVGPanZoom V1.0
==========

Sweet, short and simple stand-alone SVG Pan Zoom code including support for autoscaled SVGs and touch control (pinch to zoom). Apache V2 license. 

Should work on: IE9+, FF, Chrome, Chrome mobile, Android 4+, ...? 

Tests (so far only inline svg followed by inline javascript):
Working on: Opera Mobile, FF, Chrome, Chrome mobile, IE11
To be tested on: Opera mini (doesnt support inline SVG), Apple stuff

This code is inspired on [SVGPan](https://code.google.com/p/svgpan/) by Andrea Leofreddi (also see [his blogpost](http://www.cyberz.org/blog/2009/12/08/svgpan-a-javascript-svg-panzoomdrag-library/)) and [code by Peter Collingridge](http://www.petercollingridge.co.uk/interactive-svg-components/pan-and-zoom-control). Their code is starting to get old, however, due to sketchy and sometimes quickly changing SVG browser implementations. Also, I needed support for autoscaled SVGs. 


How to use:
 * The code can be embedded in SVG image (dont forget to use <![CDATA[ ... ]]> in that case) or anywhere else in the page. 
 * After the code is loaded, use addPanZoomToSVG({svgID: ..., panzoomID: ...,scrollSpeed: ..., pinchSpeed: ..., upOnMouseOut: ...}). All config is optional, default svgID and panzoomID are "svg" and "panzoom". 
 * Make sure the svgID and panzoomID options are matching the ID tags in your svg elements. For svgID your svg tag is recommended, since it is used to attach the events to, and for the panzoomID a g tag can be used for example.

Demo can be found at [my personal github page](http://remcotukker.github.io/SVGPanZoom/)

## Roadmap

## V1.1

* Add rotation, in particular attractive for mobile use
* Make a proper distribution including a minified version, a data-uri version and a AMD module version
* More testing, both inline and in separate SVG, fix any incompatibility issues for main browsers

## V1.2

* Use requestAnimationFrame when it is available

## V2.0

* Allow for inertia-based pan/zooming (in particular for smooth zooming :-)

