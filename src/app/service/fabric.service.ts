import { asNativeElements, Injectable } from '@angular/core';
import { Observable, reduce } from 'rxjs';
import { fabric } from 'fabric';

@Injectable({
  providedIn: 'root'
})
export class FabricService {

  constructor() { }


  giveFabricCanvas(name: string, opts: any) : Observable<any>{
    return new Observable((observer)=>{

      let canvas = new fabric.Canvas(name, {
        //controlsAboveOverlay: true,
        backgroundColor: 'rgba(0,0,0,0)',
        selection: false,
        //selectionColor: 'yellow',
        //selectionBorderColor: 'black',
        //selectionLineWidth: 5,
        isDrawingMode: false,
        preserveObjectStacking: true,
        freeDrawingCursor: 'pointer',
        width: opts.width,
        height: opts.height,
      });
      observer.next(canvas);

    });
  }

  ungroup(canvas: any, group: any) {
    let items = group._objects;
    group._restoreObjectsState();
    canvas.remove(group);
    for (var i = 0; i < items.length; i++) {
        canvas.add(items[i]);
    }
    // if you have disabled render on addition
    canvas.renderAll();
};


  addFromUrl(canvas:any){
   
    return new Observable((observer)=>{
      fabric.Image.fromURL('https://i.stack.imgur.com/KlKne.png', 
      (img)=>{
        console.log(fabric)
        // img.set({
        //   cropX: 70,
        //   cropY: 140,
        //   width: 200,
        //   height: 150,
        // });
        canvas.add(img);     
      });   
    });

 
    
  }

  addBrush(fabricCanvas:any, brushOpts:any){
    fabricCanvas.isDrawingMode = true;
    fabricCanvas.selection = false;
    let PencilBrush = new fabric.PencilBrush(fabricCanvas);
    PencilBrush.color = brushOpts.color;
    PencilBrush.width = brushOpts.width;
    PencilBrush.strokeLineCap = brushOpts.strokeLineCap;//'butt','round', 'square'
    //PencilBrush.strokeDashArray = [25, 50]
    fabricCanvas.freeDrawingBrush = PencilBrush;
  }

  addTextBox(fabricCanvas:any, textboxOpts:any){
    fabricCanvas.isDrawingMode = false;
    fabricCanvas.selection = true;

    let textbox = new fabric.Textbox('Add Text', {
      stroke: textboxOpts.color,
      fill: textboxOpts.color,
      //cornerStrokeColor: textboxOpts.color,
      //textBackgroundColor: textboxOpts.color,
      top: 30,
      left: 30,
      fontSize: textboxOpts.fontSize,
      width: 200,
      textAlign: 'center',
      fontStyle: 'normal',
      borderColor: textboxOpts.background,
      paintFirst: 'fill',
      selectionBackgroundColor: textboxOpts.background,
      backgroundColor: textboxOpts.background,
      hasControls: true,  
      //fontFamily:
    });
    fabricCanvas.add(textbox);
  }

  addRect(fabricCanvas:any){
    var rect = new fabric.Rect({
      left: 100,
      top: 50,
      fill: '#D81B60',
      width: 50,
      height: 50,
      strokeWidth: 2,
      stroke: "#880E4F",
      rx: 10,
      ry: 10,
      angle: 45,
      scaleX: 3,
      scaleY: 3,
      hasControls: true,
    });
    
    fabricCanvas.add(rect);
  }

  addRolygon(fabricCanvas:any){
    var rect = new fabric.Polygon([{x: 10, y: 10}, {x: 100, y: 10}, {x: 80, y: 100}, {x: 10, y: 100}], {selectable: true}); 
    fabricCanvas.add(rect);
  }
  // this.ctx = this.fabricCanvas.getContext('2d');

  showImage(link: string){
    return new Observable((observer)=>{
      fabric.Image.fromURL(link, 
      (img)=>{
        if(!img.width){
          //this.coreService.giveSnackbar('No usage rights to share this iamge!');
          return;
        }
        img.set({
          cropX: 0,
          cropY: 0,
          width: img.width,
          height: img.height,
        });
        observer.next(img);
        //this.fabricCanvas.setDimensions({width:img.width, height:img.height});
        //this.fabricCanvas.add(img);   
      }, { 
        crossOrigin: "anonymous"
      });  
    });
  }

  speechBubble(canvas:any, opts:any){
    //configuration
    let boxPadding = 36;
    let arrowWidth = 16;
    let strokeWidth = 2;
    let handleSize = 24;
    let msg = 'Text';
    let fill = opts.background;
    let stroke = opts.color;
    //text
    let textbox:any = new fabric.Textbox(msg, {
      left: 200,
      top: 80,
      width: 180,
      fontSize: opts.fontSize,
      originY: 'center',
      originX: 'center',
      stroke: stroke
    });

    //call setCoords whenever the textbox moved

    let setCoords = textbox.setCoords.bind(textbox);

    textbox.on({
      moving: setCoords,
      scaling: setCoords,
      rotating: setCoords
    });

    //to detect changes in the textbox position and update the handle when the textbox was moved, 
    //let's store the last known coords
    textbox.lastLeft = textbox.left;
    textbox.lastTop = textbox.top;
    textbox.id = `speech-textbox-`+new Date().getTime();

    //speech bubble tail handle
    let handle = new fabric.Rect({
      fill: 'transparent',
      left: 128,
      top: 160,
      width: handleSize,
      height: handleSize,
      hasRotatingPoint: false,
      hasControls: false,
      originY: 'center',
      originX: 'center'
    });

    //speech bubble background box
    let rect = new fabric.Rect({
      fill: fill,
      stroke: 'black',
      strokeWidth: strokeWidth,
      rx: 8,
      ry: 8,
      objectCaching: false
    });

    //speech bubble tail polygon
    let poly = new fabric.Polygon(
      [{x:0,y:0},{x:1,y:1},{x:1,y:0}],
      {
        fill: fill,
        stroke: 'black',
        strokeWidth: strokeWidth,
        objectCaching: false
      }
    );

    //2nd tail poly to overlay the bubble stroke
    let poly2 = new fabric.Polygon(
      [{x:0,y:0},{x:1,y:1},{x:1,y:0}],
      {
        fill: fill,
        objectCaching: false
      }
    );

    //let group = new fabric.Group([poly, rect, poly2, textbox], {});

    canvas.add(poly, rect, poly2, textbox);
    canvas.add(handle);
    canvas.setActiveObject(handle);
    canvas.on('after:render', (opt:any) => {
      updateBubble(handle,poly,poly2);
    });
    canvas.on('object:removed', (opt:any) => {
      console.log(opt.target.id)
      if(opt.target.id && (opt.target.id).indexOf('speech-textbox-') !== -1){
        canvas.remove(poly, rect, poly2, textbox);
      }
    });
    
    updateBubble(handle,poly,poly2);

    function updateBubble(handle:any,poly:any,poly2:any) {
      
      //lets spare us some typing
      var x = textbox.left;
      var y = textbox.top;
      
      //update rect
      var bound = textbox.getBoundingRect();
      rect.left = bound.left - boxPadding;
      rect.top = bound.top - boxPadding;
      rect.width = bound.width + (boxPadding*2);
      rect.height = bound.height + (boxPadding*2);
      
      //if the textbox was moved, update the handle position too
      if(x !== textbox.lastLeft || 
        y !== textbox.lastTop) {
        handle.left += (x - textbox.lastLeft);
        handle.top += (y - textbox.lastTop);
        handle.setCoords();
      }
      
      //to support 360° thick tails we have to do some triangulation
      var halfPi = Math.PI/2;
      var angleRadians = Math.atan2(handle.top - y, handle.left - x);
      var offsetX = Math.cos(angleRadians + halfPi);
      var offsetY = Math.sin(angleRadians + halfPi);
      
      //update tail poly
      poly.points[0].x = handle.left;
      poly.points[0].y = handle.top;
      poly.points[1].x = x - (offsetX * arrowWidth);
      poly.points[1].y = y - (offsetY * arrowWidth); 
      poly.points[2].x = x + (offsetX * arrowWidth);
      poly.points[2].y = y + (offsetY * arrowWidth);
      
      //white overlay poly (prevent dividing line)
      var halfStroke = strokeWidth/2;
      poly2.points[0].x = handle.left;
      poly2.points[0].y = handle.top;
      poly2.points[1].x = x - offsetX * (arrowWidth - halfStroke);
      poly2.points[1].y = y - offsetY * (arrowWidth - halfStroke);
      poly2.points[2].x = x + offsetX * (arrowWidth - halfStroke);
      poly2.points[2].y = y + offsetY * (arrowWidth - halfStroke);
      
      //remember current position to detect further changes
      textbox.lastLeft = x;
      textbox.lastTop = y;
    }


  }

  loadSVG(canvas:any, opts:any){

    fabric.loadSVGFromString(`
    <svg>
    <path d="M142.81,1c2,.26,4.06.45,6.06.8a46,46,0,0,1,23.86,11.61,34.93,34.93,0,0,1,9.89,15.67,1.74,1.74,0,0,0,.17.33c1.53-.48,3-1,4.53-1.41a57.66,57.66,0,0,1,33.2.31c9.12,2.87,16.36,7.71,21,15.13a23.31,23.31,0,0,1,3.35,9.49,4.34,4.34,0,0,0,.17.69v4.27c-.34,1.58-.57,3.19-1,4.74-1.92,6.3-6,11.46-11.66,15.81l-1,.73a.42.42,0,0,0-.08.12c1.15,1.34,2.38,2.64,3.44,4a22.32,22.32,0,0,1-1.74,30.56c-5.67,5.82-13,9.41-21.55,11.31a62.55,62.55,0,0,1-36.44-2.6,1.39,1.39,0,0,0-1.6.22c-10.19,7.75-22.16,11.14-35.78,10.4A52.79,52.79,0,0,1,118,128.35a1,1,0,0,0-1.16,0,47.47,47.47,0,0,1-20.68,7.92,59.32,59.32,0,0,1-32.91-4.11c-7.54-3.28-13.6-7.95-17.6-14.38a7,7,0,0,1-.75-1.36c-.3-.93-1-1.11-2.06-1.2C30,114,18.83,109.83,10.62,101,6,96,3.69,90.29,4,83.91a23,23,0,0,1,7-15c5.82-6,13.42-9.62,22.17-11.62,1.52-.35,3.08-.6,4.61-.89-.9-1.51-1.88-3-2.68-4.52-5.5-10.52-3.12-22,6.36-30.24a39.43,39.43,0,0,1,19.41-8.75A57,57,0,0,1,100,19.76l.85.5.74-1Q112,5,131.4,1.66c1.73-.29,3.5-.44,5.25-.66Z"/>
    </svg>`, function(objects, options) {
      console.log(objects, options)
      objects.forEach((object)=>{
        object.fill= opts.fill;
        object.stroke = opts.stroke;
      });
      let obj = fabric.util.groupSVGElements(objects, { });
      
      canvas.add(obj).renderAll();
      
    })

  }

  


}
