import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { PointI, SvgT } from '../interface/canvas.interface';
import { CanvasGeometryService } from '../service/canvas-geometry.service';
import { CanvasHelpersService } from '../service/canvas-helpers.service';
import { CanvasPalleteService } from '../service/canvas-pallete.service';
import { CanvasService } from '../service/canvas.service';
import { CoreService } from '../service/core.service';
import { FabricService } from '../service/fabric.service';

@Component({
  selector: 'app-face-canvas',
  templateUrl: './face-canvas.component.html',
  styleUrls: ['./face-canvas.component.scss']
})
export class FaceCanvasComponent implements OnInit {




  canvasScale:number = 1; 
  selectedFile:any = {
    path: './assets/img/jennifer-lopez.jpg'
  }

  fabricCanvas: any;
  ctxFabric: any;

  dummyCanvas: any;
  dummyCtx:any;

  faceParts = {
    lips:<SvgT[]> [],
    eyes:<SvgT[]> [],
    nose:<SvgT[]> [],
    ears:<SvgT[]> [],
    chin:<SvgT[]> [],
    hair:<SvgT[]> []
  }

 // @ViewChild('confusionTmpl', {static: true}) confusionTmpl: TemplateRef<any> | any; 


  constructor(
    public canvasService: CanvasService,
    public fabricService: FabricService,
    public coreService: CoreService,
    public geoHelpers: CanvasGeometryService,
    public helpers: CanvasHelpersService,
    public pallete: CanvasPalleteService,
    public sanitizer: DomSanitizer
    ) { }



    ngOnInit(): void {
      setTimeout(()=>{
        this.initCanvas();
      })
     
    }
  
    initCanvas(){
     
      let box:any = document.getElementById('canvas-container');
      let width = box.offsetWidth;
      this.initFabricCanvas(width-4, 500);
      this.getFaceSvgFiles();
      console.log(width, '!!!!')
      // this.canvasService.initCanvasWithImage('canvas-container', this.selectedFile.path).subscribe((image)=>{
      //   let box:any = document.getElementById('canvas-container');
      //   let width = box.offsetWidth;
      //   let scale = Number((width/image.width).toFixed(2));
      //   this.canvasScale = scale > 1 ? 1 : scale;
      //   this.initFabricCanvas(image.width, image.height);
      //   this.dummyCanvas = document.getElementById('dummy-canvas');
      //   this.dummyCanvas.width = image.width;
      //   this.dummyCanvas.height = image.height;      
      //   this.dummyCtx = this.dummyCanvas.getContext('2d');
      //   this.getFaceSvgFiles();
      // })
  
    }

    initFabricCanvas(width: number, height: number){
      this.fabricService.giveFabricCanvas('fabricCanvas', {
        width: width,
        height: height, backgroundColor: 'white' }).
      subscribe((canvas)=>{
        this.fabricCanvas = canvas;
        this.fabricCanvas.appStatus = 'appStatus';
        this.fabricCanvas.preserveObjectStacking = false;
        this.ctxFabric = this.fabricCanvas.getContext('2d');
      });
    }

    getFaceSvgFiles(){
      this.coreService.getData(`./assets/json/svg-lips.json`).subscribe((data)=>{
        this.faceParts.lips = data;
        console.log(this.faceParts)
      });
    }

    addSVGIcon(svg: SvgT){
      let  opts = {
          path: svg.svg,
          left: this.fabricCanvas.width/2,
          top: this.fabricCanvas.height/2,
          name: 'svg-icon',
          scale: 1,
          opacity: .7,
          fill: 'red',
          stroke: 'black'
      }   
      this.fabricService.loadSVGFromString(this.fabricCanvas, opts);
    }

    mpla(){
      console.log(JSON.stringify(this.fabricCanvas._objects[0].points))
    }



}
