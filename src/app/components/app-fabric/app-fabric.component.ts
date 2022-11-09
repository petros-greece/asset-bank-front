import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { fabric } from 'fabric';
import { FabricService } from 'src/app/service/fabric.service';

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
    background: 'rgba(255, 255, 255, 1)',
    color: 'rgba(50,50,50,1)',
    fontSize: 30,
  }



  constructor(public fabricService: FabricService) { }

  ngOnInit(): void {
    
    this.fabricService.giveFabricCanvas('fabricCanvas', this.opts).subscribe((canvas)=>{
      this.fabricCanvas = canvas;
      this.ctx = this.fabricCanvas.getContext('2d');
      this.onEmitCTX.emit({ctx: this.ctx, canvas: this.fabricCanvas});
      this.fabricService.loadSVG(this.fabricCanvas, {
        path: 'cloud.svg',
        fill: 'yellow',
        stroke: 'purple'
      }); 
    });
    
    
    //this.addRolygon();
    //this.addBrush();
    //setTimeout(()=>{this.mlpa()}, 90)

    this.fabricCanvas.on('before:path:created', (opt:any) => {
      console.log(opt);
    });
    
   
  }


  /** */


  removeSelection(){
    let activeObject = this.fabricCanvas.getActiveObject();
    console.log(activeObject);
    this.fabricCanvas.remove(activeObject);
  }

  eraseBrush(){
    let EraseBrush = this.fabricCanvas.SprayBrush();
  }




  mlpa(){
  

    fabric.Image.fromURL('https://i.stack.imgur.com/KlKne.png', 
    (img)=>{

console.log(fabric)
      // img.set({
      //   cropX: 70,
      //   cropY: 140,
      //   width: 200,
      //   height: 150,
      // });
      // this.fabricCanvas.add(img);     
    });    
  }






 

}
