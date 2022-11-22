import { Component, OnInit, Input, Output, EventEmitter, ViewChild, TemplateRef} from '@angular/core';
import { Observable } from 'rxjs';
import { CoreService } from 'src/app/service/core.service';
import { saveAs } from 'file-saver';
import { ApiService } from 'src/app/service/api.service';
import { FabricService } from 'src/app/service/fabric.service';

@Component({
  selector: 'app-canvas',
  templateUrl: './app-canvas.component.html',
  styleUrls: ['./app-canvas.component.scss']
})
export class AppCanvasComponent implements OnInit {
 
  @Input() selectedFilePath: any;
  @Output() onRemoveFile = new EventEmitter<any>();
  @Output() onAddFile = new EventEmitter<any>();

  @ViewChild('editAssetDialog', {static: true}) editAssetDialog: TemplateRef<any> | any; 

  canvas: any;
  ctx: any;
  
  fabricCanvas: any;
  ctxFabric: any;

  dummyCanvas: any;
  dummyCtx:any;

  width: number = 0;
  height: number = 0;
  image:any;
  imageData: any;

  canvasScale: number = 1;

  runWithReInit: boolean = true;

  colorStops = [ {color: 'rgb(0,255,0)', stop: 100}, {color: 'rgb(255,0,0)', stop: 500}, {color: 'rgb(0,0,0)', stop: 800}, ];
  confusion = { colors: [1,0,0], start: 0, randomness: 20 };
  pixelate = { factor: 3, outline: false, circleFactor: 5, circleOutline: false };
  bnw = { rgb: ['b', 'b', 'b'] };
  negative = { brightness: 255 };
  polychromeNegative = { middlePoint: 127, range: 100 };
  exposure = { distance: 2 };
  whiteNoise = { factor: 30 };
  paradise = {factor: .1};
  intensity = { factor: .1};
  bloom = { factor: 20 };
  outlines = { factor: 10, bgColor: 'rgba(255,255,255,1)', hasBg: false };
  water = { factor: 200 }
  blocks = { factor: 50 };
  frames = { factor: 10, stop: 300 }
  rotatingFrames = { scaleFactor: .25, degreesStop: 360, degreesPlus: 1 };
  cartoonColors = [];
  vinyl = {factor: 0.1};
  holyLight = {factor: 1};
  fluffy = {factor: 5};

  info = {
    averageRgb: {r:0,g:0,b:0},
    colorObj:<any> [],
    colorCount: 0
  }

  
  constructor(
    public fabricService: FabricService,
    public coreService: CoreService, 
    public apiService: ApiService
  ) { 

  }

  ngOnInit(): void {

    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');
    
    this.initImageInfo(true).subscribe((image)=>{
      this.fabricService.giveFabricCanvas('fabricCanvas', {width: image.width, height: image.height }).subscribe((canvas)=>{
        this.fabricCanvas = canvas;
        this.fabricCanvas.preserveObjectStacking = false;
        this.ctxFabric = this.fabricCanvas.getContext('2d');
        this.doScaleCanvas(image.width);
      });
    });
    //console.log(this.apiService.selectedCategory);

  }


  endpointToSrc(endpoint: string){
    let arr = this.selectedFilePath.split('/');
    return arr[arr.length-2]+'.'+arr[arr.length-1];
  }


  removeAsset(){
    let src = this.endpointToSrc(this.selectedFilePath);
    let index = this.apiService.selectedCategory.files.indexOf(src);
    this.apiService.selectedCategory.files.splice(index, 1);
    this.coreService.closeDialogById('previewCanvasDialog');
    this.onRemoveFile.emit(index);
  }

  doScaleCanvas(w: number = 100){
    setTimeout(()=>{
      let box:any = document.getElementById('canvas-container');
      let width = box.offsetWidth;
      let scale = Number((width/w).toFixed(2));
      this.canvasScale = scale > 1 ? 1 : scale;
      this.dummyCanvas = document.getElementById('dummy-canvas');
      this.dummyCtx = this.dummyCanvas.getContext('2d');
    }, 20);
  }


  /** */

  initImageInfo(getFullInfo:boolean = false):Observable<any>{
    this.ctx.clearRect(0,0,this.width, this.height);
    if(this.image){
      return new Observable((observer) => {
          this.ctx.drawImage(
            this.image,
            0,
            0,
            this.image.width,
            this.image.height
          );
  
          setTimeout(()=>{ this.getImageData(); }, 10); 
          
          if(getFullInfo){
            setTimeout(()=>{ this.info.averageRgb = this.getAverageRGB(); }, 10);
            setTimeout(()=>{ this.info.colorObj = this.getColorsObj(); }, 20);
          }
          setTimeout(()=>{ observer.next(this.image) }, 30); 
          
      });
    }

    return new Observable((observer) => {
      this.loadImage().subscribe((image)=>{
        this.ctx.drawImage(
          image,
          0,
          0,
          image.width,
          image.height
        );

        setTimeout(()=>{ this.getImageData(); }, 10); 
        
        if(getFullInfo){
          setTimeout(()=>{ this.info.averageRgb = this.getAverageRGB(); }, 10);
          setTimeout(()=>{ this.info.colorObj = this.getColorsObj(); }, 20);
        }
        setTimeout(()=>{ observer.next(image) }, 30); 
        
       })

    });
 
  }
  
  loadImage():Observable<any>{
    //this.coreService.windowWidth
    return new Observable((observer) => {
      const image = new Image();
      //image.crossOrigin = "Anonymous";
      image.onload = () => {
        this.width = image.width;
        this.height = image.height;

        setTimeout(()=>{
          //console.log(image)
          this.image = image;
          observer.next(image)
        }, 0);
        
      };
      image.src = this.selectedFilePath;
      image.crossOrigin = "Anonymous";
    });
  }

  rgbStrToObj(rgbStr: string){
    let arr = (rgbStr.replace(/[a-z\(\)]/g, '')).split(',');
    return {
      r: Number(arr[0]),
      g: Number(arr[1]),
      b: Number(arr[2])
    }
  }

  /** */

  getImageData(){
    this.imageData = this.ctx.getImageData(0, 0, this.width, this.height);  
  }

  getAverageRGB(blockSize = 5){
    let rgb = {r:0,g:0,b:0};
    let count = 0;
    let i = -4;
    let len = this.imageData.data.length;
    while ( (i += blockSize * 4) < len ) {
        ++count;
        rgb.r += this.imageData.data[i];
        rgb.g += this.imageData.data[i+1];
        rgb.b += this.imageData.data[i+2];
    }

    // ~~ used to floor values
    rgb.r = ~~(rgb.r/count);
    rgb.g = ~~(rgb.g/count);
    rgb.b = ~~(rgb.b/count);

    return rgb;
  }

  getColorsObj(blockSize = 5, howMany = 20){
    let colorsObj:any = {};
    let i = -4;
    let len = this.imageData.data.length;
    while ( (i += blockSize * 4) < len ) {
        let str = `${this.imageData.data[i]},${this.imageData.data[i+1]},${this.imageData.data[i+2]}`;
        if(!colorsObj[str]){
          colorsObj[str] = 1;
        }
        else{
          colorsObj[str]+=1;
        }
    }

      let sortable = [];
      for (var prop in colorsObj) {
          sortable.push([prop, colorsObj[prop]]);
      }
      
      sortable.sort(function(a, b) {
          return b[1] - a[1];
      });
    this.info.colorCount = sortable.length;
    sortable.length = howMany;
    console.log(sortable);
    return sortable.filter((elem)=>{return elem;});
  }

  /** PIXEL MANIPULATION EFFECTS **************/

  replaceColor(color: any, replacer: any){
    let i = -4;
    let len = this.imageData.data.length;
    while ( (i +=  4) < len ) {
      if( (this.imageData.data[i] === color.r) && 
        (this.imageData.data[i+1] === color.g) && 
        (this.imageData.data[i+2] === color.b) ){
        this.imageData.data[i] = replacer.r;
        this.imageData.data[i+1] = replacer.g;
        this.imageData.data[i+2] = replacer.b;
      }
    }
    this.ctx.putImageData(this.imageData, 0, 0)
  }

  lighten(){
    // let i = -4;
    // let len = this.imageData.data.length;
    // while ( (i +=  4) < len ) {
    //   this.imageData.data[i] += 10// Math.floor(Math.round(Math.random()*256));
    //   this.imageData.data[i + 1] += 10//Math.floor(Math.round(Math.random()*256));
    //   this.imageData.data[i + 2] += 10// Math.floor(Math.round(Math.random()*256));
    // }
    // this.ctx.putImageData(this.imageData, 0, 0);
  
    this.doSomethingInLoop((i:number)=>{
      this.imageData.data[i] += 10// Math.floor(Math.round(Math.random()*256));
      this.imageData.data[i + 1] += 10//Math.floor(Math.round(Math.random()*256));
      this.imageData.data[i + 2] += 10// Math.floor(Math.round(Math.random()*256));
    });

  }


  doSomethingInLoop(loopFN:Function){
    let i = -4;
    let len = this.imageData.data.length;
    while ( (i +=  4) < len ) {
      loopFN(i);
    }
    this.ctx.putImageData(this.imageData, 0, 0);    
  }



  brighten(){
    let i = -4;
    let len = this.imageData.data.length;
    while ( (i +=  4) < len ) {
      this.imageData.data[i] -= 10// Math.floor(Math.round(Math.random()*256));
      this.imageData.data[i + 1] -= 10//Math.floor(Math.round(Math.random()*256));
      this.imageData.data[i + 2] -= 10// Math.floor(Math.round(Math.random()*256));
    }
    this.ctx.putImageData(this.imageData, 0, 0);  
  }

  addConfusion(){
    this.runWithReinit(()=>{
      let i = -4;
      let len = this.imageData.data.length;
      while ( (i +=  4) < len ) {
        if(this.confusion.colors[0]){
          this.imageData.data[i] = this.confusion.start + Math.floor(Math.round(Math.random()*this.confusion.randomness));
        }
        if(this.confusion.colors[1]){
          this.imageData.data[i+1] = this.confusion.start + Math.floor(Math.round(Math.random()*this.confusion.randomness));
        }
        if(this.confusion.colors[2]){
          this.imageData.data[i+2] = this.confusion.start + Math.floor(Math.round(Math.random()*this.confusion.randomness));
        }
      }
      this.ctx.putImageData(this.imageData, 0, 0); 
    });   
  }

  makeMultiColor(colors = [{r: 0, g: 0, b: 255, stop: 100}, {r: 0, g: 255, b: 0, stop: 300}, {r: 255, g: 0, b: 0, stop: 766}]){
    let i = -4;
    let len = this.imageData.data.length;
    while ( (i +=  4) < len ) {
        let sumColor = this.imageData.data[i] + this.imageData.data[i+1] + this.imageData.data[i+1];
        let color = (colors.filter((color)=> color.stop > sumColor))[0];
          this.imageData.data[i] = color.r;
          this.imageData.data[i + 1] = color.g;
          this.imageData.data[i + 2] = color.b;
          //this.imageData.data[i + 3] = 255;
    }
    this.ctx.putImageData(this.imageData, 0, 0);
  } 

  pixelateData(){
    this.runWithReinit(()=>{
      let i = -4;
      let len = this.imageData.data.length;
      let point;
      let color;
      let y = 0;
      while ( (i += 4) < len ) { 
        point = {
          x: (i / 4) % this.width,
          y: Math.floor((i / 4) / this.width),
        }
        if( (!(point.x%this.pixelate.factor*3)) && (!(point.y%this.pixelate.factor*3))){  
          color = {
            r: this.imageData.data[i],
            g: this.imageData.data[i+1],
            b: this.imageData.data[i+2],
            a: this.imageData.data[i+3]
          }
          if(this.pixelate.outline){
            this.ctx.strokeStyle = `rgba(${color.r},${color.g},${color.b},${color.a})`;
            this.ctx.strokeRect(point.x - Math.round(this.pixelate.factor/2), point.y - Math.round(this.pixelate.factor/2), this.pixelate.factor, this.pixelate.factor);
          }
          else{
            this.ctx.fillStyle = `rgba(${color.r},${color.g},${color.b},${color.a})`;
            this.ctx.fillRect(point.x - Math.round(this.pixelate.factor/2), point.y - Math.round(this.pixelate.factor/2), this.pixelate.factor, this.pixelate.factor);
          }
        }
        else{
          y = i;
        }      
      }
    });   
  }

  pixelateCircleData(){
    this.runWithReinit(()=>{
      let i = -4;
      let len = this.imageData.data.length;
      let point;
      let color;
      let factor = this.pixelate.circleFactor;
      let y = 0;
      while ( (i += 4) < len ) { 
        point = {
          x: (i / 4) % this.width,
          y: Math.floor((i / 4) / this.width),
        }
        if( (!(point.x%factor)) && (!(point.y%factor))){  
          color = {
            r: this.imageData.data[i],
            g: this.imageData.data[i+1],
            b: this.imageData.data[i+2],
            a: this.imageData.data[i+3]
          }

          if(this.pixelate.circleOutline){
            this.ctx.beginPath();
            this.ctx.strokeStyle = `rgba(${color.r},${color.g},${color.b},${color.a})`;
            this.ctx.arc(point.x, point.y, (factor/2)+Math.round(factor/7), 0, 2 * Math.PI);
            this.ctx.stroke();
          }
          else{
            this.ctx.beginPath();
            this.ctx.fillStyle = `rgba(${color.r},${color.g},${color.b},${color.a})`;
            this.ctx.arc(point.x, point.y, (factor/2)+Math.round(factor/7), 0, 2 * Math.PI);
            this.ctx.fill();
          }

        }
        else{
          y = i;
        }
    
      }

    });  
  }

  blackNWhite(){
    this.runWithReinit(()=>{
      let i = -4;
      let len = this.imageData.data.length;
      let color;
      while ( (i += 4) < len ) { 

        color = {
          r: this.imageData.data[i],
          g: this.imageData.data[i+1],
          b: this.imageData.data[i+2],
          a: this.imageData.data[i+3]
        }

        this.imageData.data[i] = color[this.bnw.rgb[0]];
        this.imageData.data[i+1] = color[this.bnw.rgb[0]];
        this.imageData.data[i+2] = color[this.bnw.rgb[0]];
        
      }
      this.ctx.putImageData(this.imageData, 0, 0);
    });      
  }

  giveNegative(){
    this.runWithReinit(()=>{
      let i = -4;
      let len = this.imageData.data.length;
      let color;

      while ( (i += 4) < len ) { 

        color = {
          r: this.imageData.data[i],
          g: this.imageData.data[i+1],
          b: this.imageData.data[i+2],
          a: this.imageData.data[i+3]
        }

        this.imageData.data[i] = this.negative.brightness - color.r;
        this.imageData.data[i+1] =  this.negative.brightness - color.g;
        this.imageData.data[i+2] = this.negative.brightness - color.b;           
      }
      this.ctx.putImageData(this.imageData, 0, 0);
    });     
  }

  giveExposure(){
    this.runWithReinit(()=>{
      let i = -4;
      let len = this.imageData.data.length;
      let point:any;
      let color;
      while ( (i += 4) < len ) { 

        point = {
          x: (i / 4) % this.width,
          y: Math.floor((i / 4) / this.width),
        }

        color = {
          r: this.imageData.data[i],
          g: this.imageData.data[i+1],
          b: this.imageData.data[i+2],
          a: this.imageData.data[i+3]
        }

        if(this.exposure.distance > 0){
          this.imageData.data[i] = Math.round(color.r*this.exposure.distance);
          this.imageData.data[i+1] = Math.round(color.g*this.exposure.distance);
          this.imageData.data[i+2] = Math.round(color.b*this.exposure.distance); 
        } 
        else{
          this.imageData.data[i] = Math.round(color.r/Math.abs(this.exposure.distance));
          this.imageData.data[i+1] = Math.round(color.g/Math.abs(this.exposure.distance));
          this.imageData.data[i+2] = Math.round(color.b/Math.abs(this.exposure.distance));           
        }
            
      }
      this.ctx.putImageData(this.imageData, 0, 0); 
    });   
  }

  givePolychromeNegative(){
    this.runWithReinit(()=>{
      let i = -4;
      let len = this.imageData.data.length;
      let reverse = this.polychromeNegative.range;
      let middlePoint = this.polychromeNegative.middlePoint;

      while ( (i += 4) < len ) { 
  
        this.imageData.data[i] > middlePoint ? 
        this.imageData.data[i]-=reverse : this.imageData.data[i]+=reverse;
        this.imageData.data[i+1] > middlePoint ? 
        this.imageData.data[i+1]-=reverse : this.imageData.data[i+1]+=reverse;
        this.imageData.data[i+2] > middlePoint ?
        this.imageData.data[i+2]-=reverse : this.imageData.data[i+2]+=reverse;
  
      }
      this.ctx.putImageData(this.imageData, 0, 0);  
       
    });
  }

  giveWhiteNoise(){
    this.runWithReinit(()=>{
      let i = -4;
      let len = this.imageData.data.length;

      while ( (i += 4) < len ) { 
          let rand = -this.whiteNoise.factor + Math.ceil(Math.random()*(2*this.whiteNoise.factor));
          this.imageData.data[i]+=rand;
          this.imageData.data[i+1]+=rand;
          this.imageData.data[i+2]+=rand;       
          
      }
      this.ctx.putImageData(this.imageData, 0, 0);
    });    
  }

  giveParadise(){
    this.runWithReinit(()=>{
      let i = -4;
      let len = this.imageData.data.length;
      let point;
      let center = {x: Math.round(this.width/2), y: Math.round(this.height/2) }
  
      let factor = this.paradise.factor;
  
      while ( (i += 4) < len ) { 
        
        point = { x: (i / 4) % this.width, y: Math.floor((i / 4) / this.width) };
  
        let hypo = Math.hypot(center.x-point.x, center.y-point.y)
          
        this.imageData.data[i]+=factor*hypo;
        this.imageData.data[i+1]+=factor*hypo;
        this.imageData.data[i+2]+=factor*hypo;         
            
      }
      this.ctx.putImageData(this.imageData, 0, 0); 
    });   

  }

  giveIntensity(){
    this.runWithReinit(()=>{
      let i = -4;
      let len = this.imageData.data.length;
      let factor = this.intensity.factor;
  
      while ( (i += 4) < len ) { 
        
        let diffR = this.imageData.data[i] - this.info.averageRgb.r;
        let diffG = this.imageData.data[i+1] - this.info.averageRgb.g;
        let diffB = this.imageData.data[i+2] - this.info.averageRgb.b;  
  
        this.imageData.data[i] +=diffR*factor;
        this.imageData.data[i+1] +=diffG*factor;
        this.imageData.data[i+2] +=diffB*factor;
     
      }
      this.ctx.putImageData(this.imageData, 0, 0); 
      
    });   
  }

  giveBloom(){
    this.runWithReinit(()=>{
      let i = -4;
      let len = this.imageData.data.length;
      let point;
      let center = {x: Math.round(this.width/2), y: Math.round(this.height/2) }  
      let data = JSON.parse(JSON.stringify(this.imageData.data));

      while ( (i += 4) < len ) { 
        
        point = {
          x: (i / 4) % this.width,
          y: Math.floor((i / 4) / this.width),
        };
  
        let dirRadians = Math.atan2(center.y - point.y, center.x - point.x);
  
        let newX = Math.round(point.x + (Math.cos(dirRadians)*this.bloom.factor));
        let newY = Math.round(point.y + (Math.sin(dirRadians)*this.bloom.factor));
        let newI = (((newY-1)*this.width)+newX)*4;

        this.imageData.data[i] = data[newI];
        this.imageData.data[i+1] = data[newI+1];
        this.imageData.data[i+2] = data[newI+2];
          
      }
      this.ctx.putImageData(this.imageData, 0, 0);     
    })
  } 

  giveOutlines(){
    this.runWithReinit(()=>{

      let i = -4;
      let len = this.imageData.data.length;
      let point;
      let color;
 
      let data = JSON.parse(JSON.stringify(this.imageData.data));
      let factor = 50-this.outlines.factor;
      let bg;
      if(this.outlines.hasBg){
        bg = this.rgbStrToObj(this.outlines.bgColor);
      }

      while ( (i += 4) < len ) { 
        
        point = {
          x: (i / 4) % this.width,
          y: Math.floor((i / 4) / this.width),
        };
  
        color = {
          r: this.imageData.data[i],
          g: this.imageData.data[i+1],
          b: this.imageData.data[i+2],
          a: this.imageData.data[i+3]
        };
  
        if(bg){
          this.imageData.data[i] = bg.r;
          this.imageData.data[i+1] = bg.g;
          this.imageData.data[i+2] = bg.b;
        }

        if( (Math.abs(color.r - data[i+4]) > factor) && (Math.abs(color.g - data[i+5]) > factor) &&
            (Math.abs(color.b - data[i+6]) > factor) ){
          this.imageData.data[i] = 0;
          this.imageData.data[i+1] = 0;
          this.imageData.data[i+2] = 0;
        }

        if( (Math.abs(color.r - data[i+(this.width*4)]) > factor) && (Math.abs(color.g - data[i+1+(this.width*4)]) > factor) &&
            (Math.abs(color.b - data[i+2+(this.width*4)]) > factor) ){
          this.imageData.data[i] = 0;
          this.imageData.data[i+1] = 0;
          this.imageData.data[i+2] = 0;
        }
     
      }
      this.ctx.putImageData(this.imageData, 0, 0);    
    
    });    
  }

  giveWater(){
    this.runWithReinit(()=>{

      let i = -4;
      let len = this.imageData.data.length;
      let data = JSON.parse(JSON.stringify(this.imageData.data));
      let counter = 0;
      let asc = false;
  
      let factor = 84 + this.water.factor;
  
      while ( (i += 4) < len ) { 
        
        if(counter > factor){ asc = false; }
        else if(counter < -factor){ asc = true; }
        if(asc){ counter+=1; }
        else{ counter-=1; }
        let num = Math.round(Math.atan(counter)) === 0 ? this.width*4 : (this.width*4*Math.round(Math.atan(counter)));
        this.imageData.data[i] = data[num + i]; 
        this.imageData.data[i+1] = data[num + i + 1];
        this.imageData.data[i+2]= data[num + i + 2];
        this.imageData.data[i+3]= data[num + i + 3];
                      
      }
      this.ctx.putImageData(this.imageData, 0, 0);    
  
    });
  }

  /** MULTI IMAGES EFFECTS **************************************/

  giveBlocks(){
    this.runWithReinit(()=>{
      let factor = 301 - this.blocks.factor;
      let ratio1 = factor*(this.width/this.height);
      let ratio2 = factor*(this.height/this.width);

      for( let y = 0; y < this.height; y+=ratio2 ){
        for( let x = 0; x < this.width; x+=ratio1 ){        
          this.ctx.drawImage(this.image, 0, 0, this.width, this.height, x, y, ratio1, ratio2);
        }      
      }
      this.getImageData();      
    });
  }

  giveFrames(){
    this.runWithReinit(()=>{
      let factor = 81 - this.frames.factor;
      let stop = this.frames.stop;
      for( let x = 0, y = 0; x < (this.width/2); x+=factor,y+=factor ){
        let dW = this.width-(x*2);
        let dH = this.height-(y*2)
        if( (dW > 0) &&  (dH > 0) && (dW > stop) && (dW > stop)){
          this.ctx.drawImage(this.image, 0, 0, this.width, this.height, x, y, this.width-(x*2), this.height-(y*2));
        }
      }
      this.getImageData();      
    });
  }

  giveRotatingFrames(){
    this.runWithReinit(()=>{
      let scalefactor = this.rotatingFrames.scaleFactor;
      let degreesStop = this.rotatingFrames.degreesStop;
      let degreesPlus = this.rotatingFrames.degreesPlus;
      for( let degrees = 0; degrees<degreesStop; degrees+=degreesPlus ){
          let factor = degrees*scalefactor;
          if( this.width-(2*factor) < 0 || this.height-(2*factor) < 0){
            break;
          }
          this.ctx.save();
          this.ctx.translate(this.width/2, this.height/2);
          this.ctx.rotate(degrees*Math.PI/180);
          this.ctx.drawImage(this.image, 
            0, 0, this.width, this.height, 
            -(this.width/2)+factor, -(this.height/2)+factor, this.width-(2*factor), this.height-(2*factor));
          this.ctx.restore();       
      }
      this.getImageData();      
    });
  }

  giveCartoonColors(){
    this.runWithReinit(()=>{
      let colsArr = this.cartoonColors.map((c:string)=>{
        return this.rgbStrToObj(c);
      });
      let colorsLen = this.cartoonColors.length;
      let i = -4;
      let len = this.imageData.data.length;
      let color;

      while ( (i += 4) < len ) { 
        color = {
          r: this.imageData.data[i],
          g: this.imageData.data[i+1],
          b: this.imageData.data[i+2],
          a: this.imageData.data[i+3]
        };
        let minDiffIndex = -1, minDiff = 765;
        for(let j = 0; j < colorsLen; j+= 1){
          let diff = Math.abs(color.r - colsArr[j].r) + Math.abs(color.g - colsArr[j].g) + Math.abs(color.b - colsArr[j].b);
          if(diff < minDiff){
            minDiffIndex = j;
            minDiff = diff;
            if(diff === 0){
              break;
            }
          }
        }

        this.imageData.data[i] = colsArr[minDiffIndex].r;
        this.imageData.data[i+1] = colsArr[minDiffIndex].g;
        this.imageData.data[i+2] = colsArr[minDiffIndex].b;
      }
      this.ctx.putImageData(this.imageData, 0, 0);
      // this.runWithReInit = false;
      // this.giveOutlines();

    });  
  }

  giveVinyl(){
    this.runWithReinit(()=>{
      let degreesStop = 360;
      let degreesPlus = 1;
      for( let degrees = 0; degrees < degreesStop; degrees+=degreesPlus ){

          this.ctx.save();
          this.ctx.translate(this.width/2, this.height/2);
          this.ctx.globalAlpha = this.vinyl.factor;
          this.ctx.rotate(degrees*Math.PI/180);
          this.ctx.drawImage(this.image, 
            0, 0, this.width, this.height, 
            -(this.width/2), -(this.height/2), this.width, this.height);
          this.ctx.restore();       
      }
      this.getImageData();  
    });  
  }

  giveHolyLight(){
    this.runWithReinit(()=>{
      let framesStop = 60;
      let factor = 0;
      let factorIncrease = this.holyLight.factor;
      this.ctx.save();
      this.ctx.globalCompositeOperation = "lighter";
      this.ctx.globalAlpha =  0.01;
      for( let frames = 0; frames<framesStop; frames+= 1 ){
          this.ctx.drawImage(this.image, 
            0, 0, this.width, this.height, 
            0-factor, 0-factor, this.width+(2*factor), this.height+(2*factor));
            factor+= factorIncrease;     
      }
      this.ctx.restore(); 
      this.getImageData();         
    });     
  }

  giveFluffy(){
    this.runWithReinit(()=>{
      let i = -4;
      let len = this.imageData.data.length;
      let point, color;
      while ( (i += 4) < len ) { 

        point = {
          x: (i / 4) % this.width,
          y: Math.floor((i / 4) / this.width),
        };

        color = {
          r: this.imageData.data[i],
          g: this.imageData.data[i+1],
          b: this.imageData.data[i+2],
          a: this.imageData.data[i+3]
        };

        let rand = -this.fluffy.factor + Math.ceil(Math.random()*2*this.fluffy.factor);
        let rand2 = -this.fluffy.factor + Math.ceil(Math.random()*2*this.fluffy.factor);     
        this.ctx.beginPath();
        this.ctx.strokeStyle = `rgba(${color.r},${color.g},${color.b},${color.a})`;
        this.ctx.moveTo(point.x, point.y);
        this.ctx.quadraticCurveTo(point.x - (rand/2), point.y - (rand2/2), point.x + rand2, point.y + rand);
        this.ctx.stroke();

      }
    }); 
    this.getImageData();
  }

  /** TESTING  */

  scissors(){

    let i = -4;
    let len = this.imageData.data.length;
    let center = {x: Math.round(this.width/2), y: Math.round(this.height/2) }
    let data = JSON.parse(JSON.stringify(this.imageData.data));
    let point, color, hypo, dirRadians;
    let direction = 0;
    let maxHypo = Math.round(Math.hypot(center.x - 0, center.y - 0));

    let factor = 10;
    while ( (i += 4) < len ) { 

      point = {
        x: (i / 4) % this.width,
        y: Math.floor((i / 4) / this.width),
      };

      color = {
        r: this.imageData.data[i],
        g: this.imageData.data[i+1],
        b: this.imageData.data[i+2],
        a: this.imageData.data[i+3]
      };

      hypo = Math.round(Math.hypot(center.x-point.x, center.y-point.y));
      dirRadians = Math.atan2(center.y - point.y, center.x - point.x)//Math.sqrt(hypo);
      let dirX = Math.cos(dirRadians)*10;
      let dirY = Math.sin(dirRadians)*10;
      let newX=0, newY=0;

      //if(dirRadians*(180/Math.PI)){}

      let dicrease = Math.sqrt(hypo/maxHypo);
      newX = Math.round(point.x - (dirX*dicrease));
      newY = Math.round(point.y - (dirY*dicrease));



      // if(i<len/2){
      //   newX = point.x + Math.round(dirX*dicrease);
      //   newY = point.y + Math.round(dirY*dicrease);
      // }
      // else{
      //   newX = point.x - Math.round(dirX*dicrease);
      //   newY = point.y - Math.round(dirY*dicrease);
      // }
      let newI = (((newY-1)*this.width)+newX)*4;     
      this.imageData.data[i] = data[newI];
      this.imageData.data[i+1] = data[newI+1];
      this.imageData.data[i+2] = data[newI+2];

      // if(point.x < this.width/2 && point.y < this.height/2){
      //   newX = point.x - Math.round(dirX*dicrease);
      //   newY = point.y - Math.round(dirY*dicrease);
      // }
      // else if(point.x >= this.width/2 && point.y <= this.height/2){
      //   newX = point.x + Math.round(dirX*dicrease);
      //   newY = point.y - Math.round(dirY*dicrease);
      // }
      // else if(point.x < this.width/2 && point.y > this.height/2){
      //   newX = point.x - Math.round(dirX*dicrease);
      //   newY = point.y + Math.round(dirY*dicrease);
      // }
      // else if(point.x >= this.width/2 && point.y >= this.height/2){
      //   newX = point.x + Math.round(dirX*dicrease);
      //   newY = point.y + Math.round(dirY*dicrease);
      // }



      if(i<1000){
        console.log(dirX, dirY)
      }

      //if( === 0){
        
        //direction +=1;
      //}
      // direction = (hypo*360)/maxHypo;
      // let dirX = Math.cos(direction*(Math.PI/180));
      // let dirY = Math.sin(direction*(Math.PI/180));
      // let newX, newY;
      // //if(i<(len/2)){

      //   newX = Math.round(point.x + (dirX*(hypo/10)));
      //   newY = Math.round(point.y + (dirY*(hypo/10)));
      // // }

      // else{
      //   newX = Math.round(point.x - (dirX*(hypo/10)));
      //   newY = Math.round(point.y - (dirY*(hypo/10)));        
      // }
      //let newI = (((newY-1)*this.width)+newX)*4;




      // this.imageData.data[i] = data[newI];
      // this.imageData.data[i+1] = data[newI+1];
      // this.imageData.data[i+2] = data[newI+2];



     

      //if(i < len/2){
        //let newX = Math.round(point.x + parseFloat((Math.cos(angle*Math.PI/180) * speed).toFixed(3)))
        //let newY = Math.round(point.y + parseFloat((Math.sin(angle*Math.PI/180) * speed).toFixed(3)))

        //let newX = Math.round(point.x + (Math.cos(10)));//point.x;//Math.round(point.x - (Math.cos(dirRadians)*Math.sqrt(hypo)));
        //let newY = Math.round(point.y + (Math.sin(10)));
        //let newI = (newX*newY*4)
        //let newI = (((newY-1)*this.width)+newX)*4;
      //}

      // if( Math.round(hypo%10) > 5){
      //     this.imageData.data[i] -= 55// - this.imageData.data[i];
      //     this.imageData.data[i+1] -= 55 //- this.imageData.data[i+1];
      //     this.imageData.data[i+2] -= 55 //- this.imageData.data[i+2];
      // }

      // let dirRadians = Math.atan2(center.y - point.y, center.x - point.x);
  
      // let newX = Math.round(point.x - (Math.cos(dirRadians)*(hypo)));
      // let newY = Math.round(point.y - (Math.sin(dirRadians)*(hypo)));

      // let newI = (((newY-1)*this.width)+newX)*4;

      // this.imageData.data[i] = data[newI];
      // this.imageData.data[i+1] = data[newI+1];
      // this.imageData.data[i+2] = data[newI+2];

    }
    //this.ctx.clearRect(0,0,1000,1000);
    this.ctx.putImageData(this.imageData, 0, 0);  
  }

  scissors5(){
    console.log(this.info)
    let i = -4;
    let len = this.imageData.data.length;
    let point;
    let mirror;
    let color;
    let avg = this.info.averageRgb.r + this.info.averageRgb.g +this.info.averageRgb.b;
    let center = {x: Math.round(this.width/2), y: Math.round(this.height/2) }
    let rowLen = this.width*4;
    let distance = 800;

    let data = JSON.parse(JSON.stringify(this.imageData.data));
    console.log(data)
    let counter = 0;
    let asc = false;

    let factor = 90;

    while ( (i += 4) < len ) { 
      
      point = {
        x: (i / 4) % this.width,
        y: Math.floor((i / 4) / this.width),
      };

      color = {
        r: this.imageData.data[i],
        g: this.imageData.data[i+1],
        b: this.imageData.data[i+2],
        a: this.imageData.data[i+3]
      };

      let colorTotal = color.r + color.g + color.b;
      let colorNextTotal = data[i+4] + data[i+5] + data[i+6];
      let diffR = this.imageData.data[i] - this.info.averageRgb.r;
      let diffG = this.imageData.data[i+1] - this.info.averageRgb.g;
      let diffB = this.imageData.data[i+2] - this.info.averageRgb.b;  

      if(counter > factor){
        asc = false;
      }
      else if(counter < -factor){
        asc = true;
      }
      if(asc){
        counter+=1;
      }
      else{
        counter-=1;
      }
      let num = counter === 0 ? this.width*4 : (this.width*4*Math.round(Math.atan(counter)));
      this.imageData.data[i] = data[num + i]; 
      this.imageData.data[i+1] = data[num + i + 1];
      this.imageData.data[i+2]= data[num + i + 2];
      this.imageData.data[i+3]= data[num + i + 3];
      // if(!(i%7)){
      //   this.imageData.data[i] = this.imageData.data[len-i]; 
      //   this.imageData.data[i+1] = this.imageData.data[len-i+1];
      //   this.imageData.data[i+2]= this.imageData.data[len-i+2];
      // }

      // let hypo = Math.round(Math.hypot(center.x-point.x, center.y-point.y));
      // let distFromCenter = Math.abs((this.width/2)-point.x);
      // let dirRadians = Math.atan2(center.y - point.y, center.x - point.x);

      // let newX = Math.round(point.x - (Math.cos(dirRadians)*40));
      // let newY = Math.round(point.y - (Math.sin(dirRadians)*40));
      // let newI = (((newY-1)*this.width)+newX)*4;
 
   



      if(i<this.width){
        console.log(counter)
      }

      // this.imageData.data[i] = data[i];
      // this.imageData.data[i+1] = data[i+1];
      // this.imageData.data[i+2] = data[i+2];




      //this.imageData.data[i+3] += Math.ceil(dirRadians);//  data[newI+3];      

      /*circles*/
      // if( mod > 60 + (distFromCenter/20) ){
      //   //this.imageData.data[i] = 255 //- this.imageData.data[i];
      //   //this.imageData.data[i+1] = 255 - this.imageData.data[i+1];
      //   //this.imageData.data[i+2] += 55 //- this.imageData.data[i+2];
      //   //this.imageData.data[i+3] =  255 - this.imageData.data[i+3];
      // }
      
      // if( (hypo > 200 && hypo < 300) &&  (hypo%20) > 15 ){

      //   this.imageData.data[i] = data[len-(i+4)];
      //   this.imageData.data[i+1] = data[len-(i+3)];
      //   this.imageData.data[i+2] = data[len-(i+2)];
      //   this.imageData.data[i+3] = data[len-(i+1)]; 

      // }    

      // if( (hypo < 200) &&  (hypo%20) > 18 ){

      //   this.imageData.data[i] = data[len-(i+4)];
      //   this.imageData.data[i+1] = data[len-(i+3)];
      //   this.imageData.data[i+2] = data[len-(i+2)];
      //   this.imageData.data[i+3] = data[len-(i+1)]; 

      // }  


      // if( i%8 === 0){
      //   this.imageData.data[i] = data[len-(i+4)];
      //   this.imageData.data[i+1] = data[len-(i+3)];
      //   this.imageData.data[i+2] = data[len-(i+2)];
      //   this.imageData.data[i+3] = data[len-(i+1)];
      // }
      
      // if(counter < 40000){
        
      //   this.imageData.data[i] = this.imageData.data[counter];
      //   this.imageData.data[i+1] = this.imageData.data[counter+1];
      //   this.imageData.data[i+2] = this.imageData.data[counter+2];
  
      // }

      // else{
      //   counter = 0;
      // }  




      //if(hypo < 250 && hypo > 180){
        

     // }


      //this.imageData.data[i] = 255;//this.imageData.data[i+(rowLen*2)];
      //this.imageData.data[i+1] = //this.imageData.data[1+i+(rowLen*3)];
      //this.imageData.data[i+2] = 255;//this.imageData.data[2+i+(rowLen*4)]; 
      //this.imageData.data[i+rowLen+3] = .5;
  

          
    }
    this.ctx.putImageData(this.imageData, 0, 0);    
  }

  giveRandom(){
   
  }


  /** UI *******************/

  runWithReinit( clbk: Function ){
    if(this.runWithReInit){
      this.initImageInfo().subscribe(()=>{
        setTimeout(clbk(), 1000)     
      });
    }
    else{
      clbk();
    }
  }

  makeUIMultiColor(){
    this.runWithReinit(()=>{
      let colorStopsClone = JSON.parse(JSON.stringify(this.colorStops));
      let mapped = colorStopsClone.map((colorStop:any)=>{
        let color = this.rgbStrToObj(colorStop.color);
        return Object.assign(color, {stop: colorStop.stop});
      });
      mapped[mapped.length-1].stop = 800;
      this.makeMultiColor(mapped);     
    });
  }

  replaceUIColor(e:string, index: number){
    //this.runWithReinit(()=>{
      let eventRGB = this.rgbStrToObj(e);
      this.replaceColor( this.rgbStrToObj(this.info.colorObj[index][0]), eventRGB )
      this.info.colorObj[index][0] = `${eventRGB.r}, ${eventRGB.g}, ${eventRGB.b}`;
    //});   
  }

  /*** */

  mergeDataToDummy(){
    let canvasImgData = this.ctx.getImageData(0, 0, this.width, this.height);
    let canvasData = canvasImgData.data;
    let fabricImgData = this.ctxFabric.getImageData(0, 0, this.width, this.height);
    let fabricData = fabricImgData.data;
    let dummyImgData = this.dummyCtx.getImageData(0, 0, this.width, this.height);
    let data = dummyImgData.data;
    let i = -4;
    let len = data.length;
    while ( (i +=  4) < len ) {
        if(fabricData[i+4]){
          data[i] = fabricData[i];
          data[i + 1] = fabricData[i+1];
          data[i + 2] = fabricData[i+2];
          data[i + 3] = fabricData[i+3];
        }
        else{
          data[i] = canvasData[i];
          data[i + 1] = canvasData[i+1];
          data[i + 2] = canvasData[i+2];
          data[i + 3] = canvasData[i+3];
        }
    }
    this.dummyCtx.putImageData(dummyImgData, 0, 0);
    //this.fabricCanvas.clear();
  }

  mergeDataWithFabric(){
    let imgData = this.ctxFabric.getImageData(0, 0, this.width, this.height); 
    let data = imgData.data;
    let i = -4;
    let len = data.length;
    while ( (i +=  4) < len ) {

          if( data[i+3] ) {
            //console.log(1-(data[i+3]/255))
            let gravity = (data[i+3]/255);
            let avg1 =  this.imageData.data[i]*  (1-gravity) + data[i]* (gravity)   
            let avg2 =  this.imageData.data[i+1]*(1-gravity) + data[i+1]*(gravity) 
            let avg3 =  this.imageData.data[i+2]*(1-gravity) + data[i+2]*(gravity) 
            //let avg4 = ( this.imageData.data[i+3]*(1-(data[i+3]/255)) + data[i+3]*((data[i+3]/255)) )/2

            this.imageData.data[i] = Math.round(avg1);
            this.imageData.data[i + 1] = Math.round(avg2);
            this.imageData.data[i + 2] = Math.round(avg3);
            this.imageData.data[i + 3] = 255//avg4;
          }

    }
    this.ctx.putImageData(this.imageData, 0, 0);
    this.fabricCanvas.clear();
    console.log(this.image)
    
    
    this.canvas.toBlob((blob:any)=>{
      this.coreService.toBase64(blob).subscribe((base64:any) => {

        const image = new Image();
        //image.crossOrigin = "Anonymous";
        image.onload = () => {
          this.width = image.width;
          this.height = image.height;
  
          setTimeout(()=>{
            //console.log(image)
            this.image = image;
          }, 0);
          
        };
        image.src = base64;
        image.crossOrigin = "Anonymous";


      } );
    })

   // this.image = this.canvas.toDataURL();
  }

  uploadImageToCat(closeDialog: boolean = false){
    this.mergeDataToDummy();
    const dataURL = this.dummyCanvas.toDataURL();
    let file = this.coreService.dataURLtoFile(dataURL, 'test.png');
    this.apiService.uploadAsset('/asset', file).subscribe({
      next: (res: any) => {
        this.apiService.selectedCategory.files ? 
        this.apiService.selectedCategory.files.push(res.data) : 
        this.apiService.selectedCategory.files = [res.data];
        this.onAddFile.emit({src: res.data});    
      },
      error: (err: any) => {
        console.log(err)
        this.coreService.giveSnackbar(err.message, {
          duration: 5000,
          verticalPosition: 'top'
        });        
      },
      complete: () => {
        this.coreService.giveSnackbar(`Asset added to ${this.apiService.selectedCategory.title}`);
        if(!closeDialog) return;
        this.coreService.closeDialogById('previewCanvasDialog');
      },
    }); 
  }

  uploadImage(){
    this.mergeDataToDummy();
    const dataURL = this.dummyCanvas.toDataURL();
    let file = this.coreService.dataURLtoFile(dataURL, 'test.png');
    this.apiService.uploadAsset('/asset', file).subscribe({
      next: (res: any) => {
        this.coreService.giveSnackbar(`Image Uplaoded`);
      },
      error: (err: any) => {
        console.log(err);
        this.coreService.giveSnackbar(err.message, {
          duration: 5000,
          verticalPosition: 'top'
        });        
      },
      complete: () => {
        //this.files.splice(i, 1);
      },
    });    
  }

  downloadImage(type: string){
    this.mergeDataToDummy();
    this.dummyCanvas.toBlob((blob:any)=>{
      saveAs(blob, `siteland-asset-bank.${type}`);
    })
  }

  
  
}
