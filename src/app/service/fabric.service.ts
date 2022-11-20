import { asNativeElements, Injectable } from '@angular/core';
import { Observable, reduce } from 'rxjs';
import { fabric } from 'fabric';
import { ICanvasOptions, IImageOptions, IRectOptions, ITextboxOptions } from 'fabric/fabric-impl';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class FabricService {

  constructor(private apiService: ApiService) { }


  giveFabricCanvas(name: string, opts: ICanvasOptions) : Observable<any>{
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

  addBrush(fabricCanvas:any, brushOpts:any){
    fabricCanvas.isDrawingMode = true;
    fabricCanvas.selection = false;

    let PencilBrush = new fabric.PencilBrush(fabricCanvas);
    PencilBrush.color = brushOpts.color;
    PencilBrush.width = brushOpts.width;
    PencilBrush.strokeLineCap = brushOpts.strokeLineCap;//'butt','round', 'square'
    fabricCanvas.freeDrawingBrush = PencilBrush;
  }

  addTextBox(fabricCanvas:any, textboxOpts:ITextboxOptions){
    fabricCanvas.isDrawingMode = false;
    fabricCanvas.selection = true;

    let textbox = new fabric.Textbox('Add Text', {
      name: 'my-textbox',
      stroke: textboxOpts.stroke,
      fill: textboxOpts.stroke,
      //cornerStrokeColor: textboxOpts.stroke,
      //textBackgroundColor: textboxOpts.stroke,
      top: 30,
      left: 30,
      fontSize: textboxOpts.fontSize,
      width: 200,
      textAlign: 'center',
      fontStyle: 'normal',
      borderColor: textboxOpts.borderColor,
      paintFirst: 'fill',
      selectionBackgroundColor: textboxOpts.selectionBackgroundColor,
      backgroundColor: textboxOpts.backgroundColor,
      hasControls: true,  
      fontFamily: textboxOpts.fontFamily
    });
    fabricCanvas.add(textbox);
  }

  addRect(fabricCanvas:any, opts:IRectOptions){
    let rect = new fabric.Rect(opts);
    fabricCanvas.add(rect);
  }

  addRolygon(fabricCanvas:any){
    var rect = new fabric.Polygon([{x: 10, y: 10}, {x: 100, y: 10}, {x: 80, y: 100}, {x: 10, y: 100}], {selectable: true}); 
    fabricCanvas.add(rect);
  }
  // this.ctx = this.fabricCanvas.getContext('2d');

  showImage(link: string, opts: IImageOptions = {}){

    return new Observable((observer)=>{
    
      fabric.Image.fromURL(link, 
      (img)=>{

        if(!img.width){
          console.log('No usage rights to share this image!');
          //this.coreService.giveSnackbar('No usage rights to share this image!');
          return;
        }
        let options = {
          cropX: 0,
          cropY: 0,
          width: img.width,
          height: img.height,
        };
        Object.assign(options, opts);
        img.set(options);
        observer.next(img);  
      }, 
      { 
        crossOrigin: "anonymous"
      });  
    });
  }

  showImagesFromService(links:string[]) : Observable<any>{
    return new Observable((observer)=>{
      let images:any = [];
      links.forEach((link, i) => {
        const image = new Image();
        image.onload = () => {
          let fabricImage:any = new fabric.Image(image, {});
          fabricImage.id = `image-${i}`;
          images.push(fabricImage);
          if(i === (links.length-1)){
            observer.next(images);
          }
        }
        image.src = link;   
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
    let fill = opts.backgroundColor;
    let stroke = opts.stroke;
    //text
    let textbox:any = new fabric.Textbox(msg, {
      name: 'my-textbox',
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

  loadSVGFromString(canvas:any, opts:any){

    fabric.loadSVGFromString(opts.path, function(objects, options) {
      console.log(objects, options)
      objects.forEach((object)=>{
        object.fill= opts.fill;
        object.stroke = opts.stroke;
        object.strokeWidth = opts.strokeWidth;
        //object.originY = 'center';
        //object.originX = 'center';
        //canvas.add(object);
      });
      let obj = fabric.util.groupSVGElements(objects, {
        name: 'svg-group'
      });
      obj.scaleX = opts.scale;
      obj.scaleY = opts.scale;
  
      canvas.add(obj).renderAll();
      
    })

  }

  /** FILTERS  *****************/
  
  blendColor(image:any, color:string){
    let filter = new fabric.Image.filters.BlendColor({ color: color, mode: 'multiply' });
    image.filters.push(filter);
    image.applyFilters();
  }
  blendImage(image:any){  
    let filter = new fabric.Image.filters.BlendImage({});
    image.filters.push(filter);
    image.applyFilters();
  }
  brightness(image:any, brightness:number){  
    let filter = new fabric.Image.filters.Brightness({brightness: brightness});
    image.filters.push(filter);
    image.applyFilters();
  }
  colorMatrix(image:any){  
    let filter = new fabric.Image.filters.ColorMatrix({matrix: [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0]});
    image.filters.push(filter);
    image.applyFilters();
  }
  contrast(image:any, contrast:number){  
    let filter = new fabric.Image.filters.Contrast({contrast: contrast});
    image.filters.push(filter);
    image.applyFilters();
  }
  convolute(image:any){  
    let filter = new fabric.Image.filters.Convolute({matrix: [ 1,   1,  1, 1, 0.7, -1, -1,  -1, -1 ]});
    image.filters.push(filter);
    image.applyFilters();
  }
  gradientTransparency(image:any, threshold:number){  
    let filter = new fabric.Image.filters.GradientTransparency({threshold: threshold});
    image.filters.push(filter);
    image.applyFilters();
  }
  grayscale(image:any){  
    let filter = new fabric.Image.filters.Grayscale({});
    image.filters.push(filter);
    image.applyFilters();
  }
  invert(image:any){  
    let filter = new fabric.Image.filters.Invert({});
    image.filters.push(filter);
    image.applyFilters();
  }
  mask(image:any, channel:number){  
    let filter = new fabric.Image.filters.Mask({channel:channel});
    image.filters.push(filter);
    image.applyFilters();
  }
  multiply(image:any, color: string){  
    let filter = new fabric.Image.filters.Multiply({color: color});
    image.filters.push(filter);
    image.applyFilters();
  }
  noise(image:any, noise: number){  
    let filter = new fabric.Image.filters.Noise({noise: noise});
    image.filters.push(filter);
    image.applyFilters();
  }
  pixelate(image:any, blocksize: number = 6){
    let filter = new fabric.Image.filters.Pixelate({ blocksize: blocksize });
    image.filters.push(filter);
    image.applyFilters();
  }
  removeWhite(image:any, threshold:number, distance:number){  let filter = new fabric.Image.filters.RemoveWhite({threshold: threshold, distance: distance});
    image.filters.push(filter);
    image.applyFilters();
  }
  //
  resize(image:any){  let filter = new fabric.Image.filters.Resize({ scaleX: 2, scaleY: 2 });
    image.filters.push(filter);
    image.applyFilters();
  }
  saturation(image:any, saturation: number){  
    let filter = new fabric.Image.filters.Saturation({saturation: saturation});
    image.filters.push(filter);
    image.applyFilters();
  }
  //
  sepia2(image:any){  
    let filter = new fabric.Image.filters.Sepia2({});
    image.filters.push(filter);
    image.applyFilters();
  }
  sepia(image:any){  
    let filter = new fabric.Image.filters.Sepia({});
    image.filters.push(filter);
    image.applyFilters();
  }
  tint(image:any, color: string, opacity: number){  
    let filter = new fabric.Image.filters.Tint({color: color, opacity: opacity});
    image.filters.push(filter);
    image.applyFilters();
  }

}
