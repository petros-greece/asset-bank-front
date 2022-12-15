import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit, AfterContentChecked, AfterContentInit, AfterViewChecked } from '@angular/core';
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


export class AppFabricComponent implements OnInit,  AfterViewChecked{
  @Input()  fabricCanvas: any;
  @Input()  ctxFabric: any;
  @Input()  ctx: any;
  @Input()  view: string = 'edit'; 
  @Input()  images: any[] = []; 

  gotEvent:boolean = false;
  
  svgFiles = [
    { name: 'textbox', },
    { name: 'christmas', },  
    { name: 'superheroes' },
    { name: 'animals' },
    { name: 'face-emotions' },
    { name: 'instruments' },     
  ];
  svgIcons: any;

  fonts = ['sans-serif', 'serif', 'Times New Roman', 'Helvetica', 'Arial', 'Verdana', 'Courier New'];


  showGallery: boolean = false;

  brush = {
    color: 'white', 
    strokeLineCap: 'butt',
    width: 30
  }
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
    console.log('ngOnInit fabric')
    // if(this.fabricConfig){
    //   this.brush = this.fabricConfig.brush;
    //   this.textbox = this.fabricConfig.textbox;
    //   this.icon = this.fabricConfig.icon;
    // }





  }

  ngAfterViewChecked(): void {
    if(this.fabricCanvas && !this.gotEvent){
      console.log('app fabric ngAfterContentInit triggered many times')
      this.gotEvent = true;
      this.fabricCanvas.on('mouse:down', (opt:any) => {

        if(this.fabricCanvas.appStatus.indexOf('colorpicker') > -1){
          let x = Math.round(opt.pointer.x); 
          let y = Math.round(opt.pointer.y);
          let pixel = this.ctxFabric.getImageData(x,y,1,1);
          let color;
          if(pixel && pixel.data[3]){
            color = pixel.data;
          }
          else{
            pixel = this.ctx.getImageData(x,y,1,1);
            color = pixel.data;
          }
          this.fabricCanvas.isDrawingMode = true;
          this.fabricCanvas.selectable = false;

          let rgbColor = `rgba(${color[0]},${color[1]},${color[2]},${color[3]})`;

          if(this.fabricCanvas.appStatus === 'colorpicker-icon'){
            this.icon.fill = rgbColor;
          }
          else if(this.fabricCanvas.appStatus === 'colorpicker-brush'){
            this.fabricCanvas.freeDrawingBrush.color = rgbColor;
            this.brush.color = rgbColor;
          }
          else if(this.fabricCanvas.appStatus === 'colorpicker-textbox'){
            this.textbox.backgroundColor = rgbColor;
          }

          this.fabricCanvas.appStatus = '';

        }

      }); 
    }
 
  }

  ngAfterContentInit(): void {

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
        left: (this.fabricCanvas.width/2)-25,
        top: (this.fabricCanvas.height/2)-25
      }); 
  }

  changeActiveBrush(){
    let activeObject = this.fabricCanvas.getActiveObject();
    //console.log(activeObject);
    if(!activeObject || !activeObject.strokeMiterLimit){return}
    activeObject.set('stroke', this.brush.color);
    activeObject.set('strokeWidth', this.brush.width);
    activeObject.set('strokeLineCap', this.brush.strokeLineCap);  
    this.fabricCanvas.renderAll();
  }

  changeActiveIcon(){
    let activeObject = this.fabricCanvas.getActiveObject();
    //console.log(activeObject);
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
    //console.log(activeObject);
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
    let activeObj = this.fabricCanvas.getActiveObject();
    if(!activeObj){
      this.coreService.giveSnackbar('Select an object first!');
      return;
    }
    if(activeObj._objects){
      this.coreService.giveSnackbar('Can only clone one object at the time!');
      return; 
    //   let object;
    //   activeObj._objects.forEach((obj:any) => {
    //     object = fabric.util.object.clone(obj);
    //     object.set("top", object.top);
    //     object.set("left", object.left);
    //     object.set("width", object.width);
    //     object.set("height", object.height);       
    //     object.set("scaleX", object.scaleX);
    //     object.set("scaleY", object.scaleY); 
    //     //object.set("cacheKey", `texture${this.images.length}`);  
    //     object.set("id", `image-${this.images.length}`);     
    //     this.fabricCanvas.add(object);
    //     this.images.push(object);      
    //   });
    }
    else{
      let clonedObj:any;
      this.fabricCanvas.getActiveObject().clone((clonedObj:any)=>{
        clonedObj.clone((cloned:any)=>{
          this.fabricCanvas.discardActiveObject();
          //object.set("cacheKey", `texture${this.images.length}`);  
          cloned.set("id", `image-${this.images.length}`);     
          this.fabricCanvas.add(cloned);
          this.fabricCanvas.setActiveObject(cloned);
          this.fabricCanvas.requestRenderAll();
          this.images.push(cloned);
        })
      })



             
    }

  }



}
