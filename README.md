SVGPanZoom V0.9
==========

Sweet, short and simple stand-alone SVG Pan Zoom code including support for autoscaled SVGs and touch events. Apache V2 license. Should work on: IE9+, FF, Chrome, Android 4+, ...? 

This code is inspired on [SVGPan](https://code.google.com/p/svgpan/) by Andrea Leofreddi (also see [his blogpost](http://www.cyberz.org/blog/2009/12/08/svgpan-a-javascript-svg-panzoomdrag-library/)) and [code by Peter Collingridge](http://www.petercollingridge.co.uk/interactive-svg-components/pan-and-zoom-control). Their code is starting to get old, however, due to sketchy and sometimes quickly changing SVG browser implementations. Also, I needed support for autoscaled SVGs. 

The code can be embedded in SVG image (dont forget to use <![CDATA[ ... ]]>) or anywhere else in the page. 
Requirements:
* The svg element and the panzoom group have IDs that match the ID in the code (should be easier in V1.0, see roadmap).
* The panzoom group should have a matrix transform defined (Requirement should be dropped by V1.1, see roadmap).

Demo can be found at [my personal github page](http://remcotukker.github.io/SVGPanZoom/)

## Roadmap

## V1.0

* Better setting/getting of SVG transform matrix
* Make it a proper module with easy initialization of the IDs you want to use (and other config)
* Touch up docu
* Add touch events
* Testing on browsers (so far, Chrome (incl mobile), FF, IE11 seem to work), both inline and in separate SVG

## V1.1

* Use requestAnimationFrame when it is available
* Add a unity matrix to the panzoom group if no matrix is defined yet

## V2.0

* Allow for inertia-based pan/zooming (in particular for smooth zooming :-)
