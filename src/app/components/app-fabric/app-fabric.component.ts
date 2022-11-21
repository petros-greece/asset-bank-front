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
  @Input()  view: string = 'edit'; 


  svgFiles = [
    {
      name: 'textbox',
    },
    {
      name: 'christmas',
    },  
    {
      name: 'superheroes'
    },
    {
      name: 'animals'
    } 
  ];
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

  fonts = ['sans-serif', 'serif', 'Times New Roman', 'Helvetica', 'Arial', 'Verdana', 'Courier New'];

  textbox = {
    backgroundColor: 'rgba(255, 255, 255, 1)',
    stroke: 'rgba(50,50,50, 1)',
    fontSize: 30,
    fontFamily: 'serif'
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
  

    
    // this.fabricCanvas.on('before:path:created', (opt:any) => {
    //   console.log(opt, this.fabricCanvas);
    // });
    
   
  }


  getSvgFile(fname: string){
    this.coreService.getData(`./assets/json/svg-${fname}.json`).subscribe((data)=>{
      this.svgIcons = data;
    });
  }

  /** */

  removeSelection(){
    let activeObject = this.fabricCanvas.getActiveObject();
    this.fabricCanvas.remove(activeObject);
    if(activeObject._objects){
      activeObject._objects.forEach((obj:any) => {
        this.fabricCanvas.remove(obj);
      });
    }
    this.fabricCanvas.discardActiveObject();
  }

  giveSVGIcon(svg: any){
      this.fabricService.loadSVGFromString(this.fabricCanvas, {
        path: svg,
        fill: this.icon.fill,
        stroke: this.icon.stroke,
        strokeWidth: this.icon.strokeWidth,
        scale: this.icon.scale,
      }); 
  }

  changeActiveIcon(){
    let activeObject = this.fabricCanvas.getActiveObject();
    console.log(activeObject);
    if(!activeObject || (!activeObject.fromSVG && activeObject.name !== 'svg-group') ){return}
    if(activeObject._objects){
      activeObject._objects.forEach((obj:any) => {
        obj.set('fill', this.icon.fill);
        obj.set('stroke', this.icon.stroke);
        obj.set('strokeWidth', this.icon.strokeWidth);     
      });
    }
    else{
      activeObject.set('fill', this.icon.fill);
      activeObject.set('stroke', this.icon.stroke);
      activeObject.set('strokeWidth', this.icon.strokeWidth);
    }
    this.fabricCanvas.renderAll();
  }

  changeActiveText(){
    let activeObject = this.fabricCanvas.getActiveObject();
    console.log(activeObject);
    if(!activeObject || (activeObject.name !== 'my-textbox') ){return}
    // if(activeObject._objects){
    //   activeObject._objects.forEach((obj:any) => {
    //     obj.set('fill', this.icon.fill);
    //     obj.set('stroke', this.icon.stroke);
    //     obj.set('strokeWidth', this.icon.strokeWidth);     
    //   });
    // }
    // else{
      activeObject.set('backgroundColor', this.textbox.backgroundColor);
      activeObject.set('stroke', this.textbox.stroke);
      activeObject.set('fontSize', this.textbox.fontSize);
      activeObject.set('fontFamily', this.textbox.fontFamily);
    // }
    this.fabricCanvas.renderAll();
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
        this.coreService.selectedAssets = [];
      },1000);

    });
  }

  duplicateSelection(){

    var object = fabric.util.object.clone(this.fabricCanvas.getActiveObject());
    object.set("top", object.top);
    object.set("left", object.left);
    this.fabricCanvas.add(object);

    // let activeObject;
    // this.fabricCanvas.getActiveObject().clone((cloned:any)=>{
    //   activeObject = cloned;
    // });
    // console.log(activeObject);
    // if(!activeObject){return}
    // this.fabricCanvas.add(activeObject);
    // this.fabricCanvas.renderAll();
  }









 

}
