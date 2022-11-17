import { Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import { Observable } from 'rxjs';
import { CoreService } from 'src/app/service/core.service';
import { saveAs } from 'file-saver';
import { ApiService } from 'src/app/service/api.service';
import { FabricService } from 'src/app/service/fabric.service';
import { fabric } from 'fabric';

let filters:any = fabric.Image.filters;
filters.Greenify= fabric.util.createClass({
  type: 'greenify',
  applyTo: function(canvasEl:any) {
    var context = canvasEl.getContext('2d'),
        imageData = context.getImageData(0, 0, canvasEl.width, canvasEl.height),
        data = imageData.data;

    for (var i = 0, len = data.length; i < len; i += 4) {
      //kill red
      data[i] = 0;
      //kill blue
      data[i + 2] = 0;
    }

    context.putImageData(imageData, 0, 0);
  }
});

@Component({
  selector: 'app-canvas-new',
  templateUrl: './canvas-new.component.html',
  styleUrls: ['./canvas-new.component.scss']
})
export class CanvasNewComponent implements OnInit {

  canvas:any;
  dummyCanvas:any;
  ctx:any;
  width = 0;
  height = 0;
  image: any;
  imageData:any;
  selectedFilePath = 'http://localhost/asset-bank-api/public/api/assets/1/U-1667596642/jpg';

  constructor(public fabricService: FabricService, public apiService: ApiService) { }

  ngOnInit(): void {

    this.fabricService.giveFabricCanvas('my-canvas', { width: 0, height: 0 }).subscribe((canvas)=>{
      this.canvas = canvas;
      this.ctx = this.canvas.getContext('2d');
      this.fabricService.showImage(this.selectedFilePath, {selectable: false}).subscribe((img:any)=>{
        this.width = img.width;
        this.height = img.height;
        this.image = img;
        this.image.id = 'main-image';
        this.canvas.setDimensions({width:this.width, height:this.height});
        this.canvas.add(img);
         
        this.fabricService.addRect(this.canvas, {width: 300, height: 300, fill: 'black', backgroundColor: 'red'});
     
        this.canvas.renderAll(); 
        //this.renderEffects();
        //this.getImageData();
        
        // this.renderEffectForAll(
        //     ()=>{
        //         let i = -4;
        //         let len = this.imageData.data.length;
        //         while ( (i +=  4) < len ) {
        //           this.imageData.data[i] += 100;
        //           this.imageData.data[i + 1] -= 100;
        //           this.imageData.data[i + 2] += 100;
        //         }
        //     } 
        // )

      });        
    }); 
 
  }

  getImageData(){
    this.imageData = this.ctx.getImageData(0, 0, this.width, this.height); 
    //console.log(this.imageData); 
  }


  effects = {
    blendColor: {color: 'rgba(0,255,0,1)'},
    brightness: {factor: .5},
    colorMathix: {factor: []},
    contrast: {factor: 3},
    convolute: {},
    grayscale: {},
    invert: {},
    noise: {factor: 700},
    pixelate: {factor: 100},
    saturation: {factor: 10},
    sepia: {},
  }

  renderEffects(){
    


    //this.fabricService.blendColor(this.image, 'rgba(0,255,0,1)');
    //this.fabricService.brightness(this.image, .5);
    //this.fabricService.colorMatrix(this.image);
    //this.fabricService.contrast(this.image, 3);
    //this.fabricService.convolute(this.image);    
    //this.fabricService.grayscale(this.image);
    //this.fabricService.invert(this.image);    
    //this.fabricService.noise(this.image, 700);
    //this.fabricService.pixelate(this.image, 100);
    //this.fabricService.saturation(this.image, 10);
    //this.fabricService.sepia(this.image)

    //////this.fabricService.blendImage(this.image);

    /////this.fabricService.gradientTransparency(this.image, 10)

    /////this.fabricService.mask(this.image, 0);
    /////this.fabricService.multiply(this.image, 'rgba(0,255,0,1)');

    /////this.fabricService.removeWhite(this.image, 700, 90);
    /////this.fabricService.resize(this.image);
    /////this.fabricService.sepia2(this.image) 
    /////this.fabricService.tint(this.image, 'rgba(0,255,0,1)', 1)
    this.canvas.renderAll();
  }


  renderEffectForAll(func: any){

    this.canvas.renderAll();
    this.getImageData();

    func();

    this.ctx.putImageData(this.imageData, 0, 0);   
    
    let canvas:any = document.getElementById('my-canvas');
    let dataURL = canvas.toDataURL();
    
    fabric.Image.fromURL(dataURL, (img) => {
      img.left = 0;
      img.top = 0;
      img.selectable = false;
      this.canvas.add(img);
      this.canvas.renderAll();
    });

  }

  renderEffectForImage(func: any){
    let objs:any[] = [];
    this.canvas._objects.forEach((obj:any)=>{
      if(!obj.id || obj.id !== 'main-image'){
        objs.push(obj);
        this.canvas.remove(obj);
      }
    });
    this.canvas.renderAll();
    this.getImageData();

    func();

    this.ctx.putImageData(this.imageData, 0, 0);   
    let canvas:any = document.getElementById('my-canvas');
    let dataURL = canvas.toDataURL();
    
    fabric.Image.fromURL(dataURL, (img) => {
      img.left = 0;
      img.top = 0;
      img.selectable = false;

      this.canvas.add(img);
      objs.forEach((obj:any)=>{
        this.canvas.add(obj);
      });
      
      this.canvas.renderAll();
    });

  }


  test(){



    this.fabricService.showImage(this.selectedFilePath, {selectable: false}).subscribe((img:any)=>{
      //this.renderEffectForImage(()=>{
        this.fabricService.brightness(img, this.effects.brightness.factor);
        this.canvas.add(img);
        this.image = img;
        this.canvas.renderAll(); 
      //});
     
    });
  }
  
 





}
