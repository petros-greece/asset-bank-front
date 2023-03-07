import { Component, Input, OnInit, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { PointI, PolyT, SvgT } from 'src/app/interface/canvas.interface';
import { CoreService } from 'src/app/service/core.service';
import { FabricService } from 'src/app/service/fabric.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';


@Component({
  selector: 'app-mini-fabric',
  templateUrl: './mini-fabric.component.html',
  styleUrls: ['./mini-fabric.component.scss']
})
export class MiniFabricComponent implements OnInit, AfterViewInit {

  @Input() width : number = 200;
  @Input() height: number = 200;
  @Output() onEmitPath = new EventEmitter<any>();

  fabricCanvas:any;
  fabricCtx:any;
  center:PointI = {x:0, y: 0}

  color: string = 'red';

  constructor(
    public coreService: CoreService,
    public fabricService: FabricService,
    public sanitizer: DomSanitizer
    ) { }

  ngOnInit(): void {
    this.center = {
      x: Math.round(this.width/2),
      y: Math.round(this.height/2)
    }

    this.fabricService.giveFabricCanvas('miniFabricCanvas', {width: this.width, height: this.height }).subscribe((canvas)=>{
      this.fabricCanvas = canvas;
      this.fabricCtx = this.fabricCanvas.getContext('2d');
    });

  }

  ngAfterViewInit(): void { }


  addSVGIcon(svg: SvgT){
    let opts:any = {};
    if(svg.type){
      opts = {
        path: svg.svg,
        left: this.center.x,
        top: this.center.y,
        name: 'svg-icon',
        scale: 1.5,
      }
    } 
    else{
      opts = {
        path: svg.svg,
        fill: this.color,
        stroke: '#000',
        strokeWidth: 0,
        scale: 1.5,
        left: this.center.x,
        top: this.center.y,
        name: 'svg-icon'
      }
    }
    this.fabricService.loadSVGFromString(this.fabricCanvas, opts);
  }

  addRect(){
    //this.fabricCanvas.clear();
    this.fabricService.addRect(this.fabricCanvas, {left: this.center.x,top: this.center.y, fill: this.color});
  }

  addCircle(){
    //this.fabricCanvas.clear();
    this.fabricService.addPolygon(this.fabricCanvas, 60, 50, {left: this.center.x, top: this.center.y, name: 'circle', fill: this.color} )
    //this.fabricService.addCircle(this.fabricCanvas, {left: this.center.x,top: this.center.y });
  }

  addEditablePolygon(){
    //this.fabricCanvas.clear();
    this.fabricService.addEditablePolygon(this.fabricCanvas, 7, 50, {left: this.center.x, top: this.center.y, fill: this.color})
  }

  emitPath(){

    let objs = [];
    for(let i =0; i < this.fabricCanvas._objects.length; i+=1){
      let obj = this.fabricCanvas._objects[i];
      if(obj.radius && obj.radius === 5){
        continue;
      }
      let path:any;
      let color:string;
      if(obj._objects || (obj.name && obj.name.includes('cirlce-handler'))){
        continue;
      }
      else{
        path = this.getPathFromObj(obj);
        color = obj.fill;
        objs.push({path: path, color: color});
      }

    }

    this.onEmitPath.emit(objs);

  }

  colorChange(color: string){
    this.color = color;
    this.fabricCanvas.getActiveObject().set({fill: color});
    this.fabricCanvas.renderAll();
  }
  
  getPathFromObj(obj:any) : any{
    let path:PolyT = [];
    console.log(obj)
    if(!obj){
      this.coreService.giveSnackbar('Select a pattern first!')
      return;
    }
    if(obj.name && obj.name === 'rect'){
      let sides = ['tl', 'tr', 'br', 'bl'];
      for(let i=0;i<4;i+=1){
        path.push([obj.aCoords[sides[i]].x, obj.aCoords[sides[i]].y]);
      }
    }
    else if(obj.name && (obj.name === 'circle' || obj.name.includes('control-poly')) ){
      path = obj.points.map((point:PointI)=>{
        return [obj.left + (point.x* obj.scaleX), obj.top + (point.y* obj.scaleY)]
      });
    }
    else if(obj.fromSVG){
      path = obj.path.map((point:any[])=>{
      let angleX = Math.cos(obj.angle*(Math.PI/180));
      let angleY = Math.sin(obj.angle*(Math.PI/180));
      let x = (point[1] * obj.scaleX * angleX) - (point[2] * obj.scaleY * angleY)
      let y = (point[1] * obj.scaleX * angleY) + (point[2] * obj.scaleY * angleX)
      return [obj.left + x, obj.top +y]
      }); 
      path.pop() 
    }
    if(obj._objects){
      this.coreService.giveSnackbar('The current object cannot be used in pattern!')
      return;      
    }
    return path;
  }

  clear(){
   // this.fabricCanvas.loadFromJSON({});
    this.fabricCanvas.dispose()

    this.fabricService.giveFabricCanvas('miniFabricCanvas', {width: this.width, height: this.height }).subscribe((canvas)=>{
      this.fabricCanvas = canvas;
      this.fabricCtx = this.fabricCanvas.getContext('2d');
      //this.addRect(); 
    });

    
   // console.log(this.fabricCanvas)
  }

}
