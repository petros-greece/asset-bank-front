import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { fabric } from 'fabric';
import { CoreService } from 'src/app/service/core.service';
import { FabricService } from 'src/app/service/fabric.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ApiService } from 'src/app/service/api.service';

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
  @Input()  fabricCanvas: any;
  @Input()  ctx: any;
  @Output() onEmitCTX = new EventEmitter<any>();

  svgIcons: any;

  showGallery: boolean = false;
  fabricCanvasOpts = {
    isDrawingMode: false
  }
  brush = {
    color: 'white', 
    strokeLineCap: 'butt',
    width: 30
  }
  textbox = {
    backgroundColor: 'rgba(255, 255, 255, 1)',
    stroke: 'rgba(50,50,50, 1)',
    fontSize: 30,
  }
  icon = {
    fill: 'white',
    stroke: 'black',
    scale: 2,
    strokeWidth: .5
  }


  constructor(
    public apiService: ApiService,
    public fabricService: FabricService,
    public coreService: CoreService,
    public sanitizer: DomSanitizer
    ) { }

  ngOnInit(): void {
  
    this.coreService.getData('./assets/json/icon1.json').subscribe((data)=>{
      this.svgIcons = data;
    });
    
    // this.fabricCanvas.on('before:path:created', (opt:any) => {
    //   console.log(opt);
    // });
    
   
  }


  /** */


  removeSelection(){
    let activeObject = this.fabricCanvas.getActiveObject();
    this.fabricCanvas.remove(activeObject);
  }

  eraseBrush(){
    let EraseBrush = this.fabricCanvas.SprayBrush();
  }

  giveSVGIcon(svg: any){
    console.log('yo')
      this.fabricService.loadSVGFromString(this.fabricCanvas, {
        path: svg,
        fill: this.icon.fill,
        stroke: this.icon.stroke,
        strokeWidth: this.icon.strokeWidth,
        scale: this.icon.scale
      }); 
  }


  onAddSelected(){

    let selectedPaths = ([...this.coreService.selectedAssets]).map((link)=>{
      return this.apiService.srcApiPath(link);
    })

    this.fabricService.showImagesFromService(selectedPaths).subscribe((images)=>{

      images.forEach((img:any) => {
        console.log(img)
        this.fabricCanvas.add(img);
      });
      setTimeout(()=>{
        this.fabricCanvas.renderAll();
      },1000);

    });
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
