import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { fabric } from 'fabric';

export interface FabricOptionsI{
  width: number;
  height: number;
  isSelection: boolean;
  isDrawing: boolean;
};

@Component({
  selector: 'app-fabric',
  templateUrl: './app-fabric.component.html',
  styleUrls: ['./app-fabric.component.scss']
})


export class AppFabricComponent implements OnInit {
  @Input()  opts: any;
  @Input()  ctx: any;
  @Output() onEmitCTX = new EventEmitter<any>();
  fabricCanvas: any;


  fabricCanvasOpts = {
    isDrawingMode: false
  }
  brush = {
    color: 'white',
    strokeLineCap: 'butt',
    width: 30
  }
  textbox = {
    background: 'rgba(255, 255, 255, .5)',
    color: 'rgba(100,100,100,1)',
    fontSize: 30,
  }



  constructor() { }

  ngOnInit(): void {
    
    this.fabricCanvas = new fabric.Canvas('fabricCanvas', {
      //controlsAboveOverlay: true,
      backgroundColor: 'rgba(0,0,0,0)',
      selection: true,
      //selectionColor: 'yellow',
      //selectionBorderColor: 'black',
      //selectionLineWidth: 5,
      isDrawingMode: this.fabricCanvasOpts.isDrawingMode,
      preserveObjectStacking: true,
      freeDrawingCursor: 'pointer',
      width: this.opts.width,
      height: this.opts.height,
    });
    this.ctx = this.fabricCanvas.getContext('2d');

    this.onEmitCTX.emit({ctx: this.ctx, canvas: this.fabricCanvas});
    //this.addRolygon();
    //this.addBrush();
    //this.mlpa();
    this.fabricCanvas.on('before:path:created', (opt:any) => {
      console.log(opt);
    });
    
   
  }


  /** */

  addBrush(){
    this.fabricCanvas.isDrawingMode = true;
    this.fabricCanvas.selection = false;
    let PencilBrush = new fabric.PencilBrush(this.fabricCanvas);
    PencilBrush.color =  this.brush.color;//'red';
    PencilBrush.width = this.brush.width;//30;
    PencilBrush.strokeLineCap =  this.brush.strokeLineCap;//'butt','round', 'square'
    //PencilBrush.strokeDashArray = [25, 50]
    this.fabricCanvas.freeDrawingBrush = PencilBrush;

  }

  addTextBox(){
    this.fabricCanvas.isDrawingMode = false;
    this.fabricCanvas.selection = true;
    let textbox = new fabric.Textbox('Add Text', {
      stroke: this.textbox.color,
      //textBackgroundColor: this.textbox.color,
      top: 30,
      left: 30,
      fontSize: this.textbox.fontSize,
      width: 200,
      textAlign: 'center',
      fontStyle: 'normal',
      borderColor: this.textbox.background,
      paintFirst: 'fill',
      selectionBackgroundColor: this.textbox.background,
      backgroundColor: this.textbox.background
      //fontFamily:
    });

    this.fabricCanvas.add(textbox);
  }

  removeSelection(){
    let test = this.fabricCanvas.getActiveObject();
    this.fabricCanvas.remove(test);
   // test.delete;
    console.log(this.fabricCanvas);
  }

  eraseBrush(){
    let EraseBrush = this.fabricCanvas.SprayBrush();
  }

  addRect(){

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
    
    this.fabricCanvas.add(rect);
  }

  addRolygon(){

    var rect = new fabric.Polygon([{x: 10, y: 10}, {x: 100, y: 10}, {x: 80, y: 100}, {x: 10, y: 100}], {selectable: true});
    
    this.fabricCanvas.add(rect);
  }


  mlpa(){
  

    fabric.Image.fromURL('https://cdn.shopify.com/s/files/1/0130/3137/4906/products/GIA9339_HALO_TOP_BLACK_MOVEMENT_FF.jpg?v=1652610308', 
    (img)=>{


      img.set({
        cropX: 70,
        cropY: 140,
        width: 200,
        height: 150,
      });
      this.fabricCanvas.add(img);     
    });    
  }
 // initFabric

}
