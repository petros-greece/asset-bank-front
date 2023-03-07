import { Injectable, Inject } from '@angular/core';
import { DOCUMENT,  } from '@angular/common';
import { Observable } from 'rxjs';
import { CanvasHelpersService } from './canvas-helpers.service';
import { CanvasInfoI, ColorI, PointI, PolyT } from '../interface/canvas.interface';
import { CoreService } from './core.service';
import { CanvasGeometryService } from './canvas-geometry.service';
import { CanvasPalleteService } from './canvas-pallete.service';

@Injectable({
  providedIn: 'root'
})
export class CanvasService {

  canvas:HTMLCanvasElement = this.document.createElement("canvas");;
  ctx:CanvasRenderingContext2D = this.canvas.getContext("2d") as CanvasRenderingContext2D;

  width: number = 0;
  height: number = 0;
  center: PointI = {x:0, y:0}
  maxHypo: number = 0;

  imageData:ImageData = new ImageData(1, 1);
  imageSrc: string = '';
  image:any;
  imageProto:any;

  info:CanvasInfoI = {
    averageRgb: {r:0,g:0,b:0},
    colors: [],
    colorCount: 0
  }

  applyEffectWithReInit:boolean = true;

  config:any = {
    colorStops: [ {color: 'rgb(0,255,0)', stop: 100}, {color: 'rgb(255,0,0)', stop: 500}, {color: 'rgb(0,0,0)', stop: 800}, ],
    confusion: { colors: [1,0,0], start: 0, randomness: 20 },
    pixelate: { factor: 3, outline: false, circleFactor: 5, circleOutline: false },
    bnw: { rgb: ['b', 'b', 'b'] },
    negative: { brightness: 255 },
    polychromeNegative: { middlePoint: 127, range: 100 },
    exposure: { distance: 1 },
    whiteNoise: { factor: 30 },
    paradise: {factor: .1},
    intensity: { factor: .1},
    bloom: { factor: 20 },
    outlines: { factor: 10, bgColor: 'rgba(255,255,255,1)', hasBg: false },
    water: { factor: 200 },
    blocks: { factor: 50 },
    frames: { factor: 10, stop: 50 },
    rotatingFrames: { scaleFactor: .2, degreesStop: 360, degreesPlus: 1 },
    cartoonColors:<string[]> [],
    vinyl: {factor: 0.1},
    holyLight: {factor: 1},
    fluffy: {factor: 5},
    suck: {factor: 10},
    spotlight: { controlX: 100, controlY: 200, rangeX: 100, rangeY: 200 },
    blinds: { depth: 1, freq: 100 },
    tremolo: { period: .1, pitch: 10 },
    ellipse: { rx: 0, ry: 0, },
    brokenWall: { size: 50, dist: 100 },
    klimt: {size: 5, randomness: 90},
    colendar: { factor: 10 },
    letters: { size: 10, density: 1.3, phrase: '' },
    pourPaint: { color: 'rgba(255,255,255,1)', range: 10, density: 10 },
    comic: { reverse: 80, sumFactor: 382 },
    whirlpool:{ degreesStop: 360, degreesPlus: .5 },
    background: {color: 'rgba(100, 100, 100, .8)'},
    shadesOf: { color: 'red' },
    dream: { factor: 20 },
    acrylicScratch: { range: 3 }
  }

  history: any = [];
  historyCurrent: number = 0;

  pattern = {
    isRunning: false
  }

  constructor(
    public helpers: CanvasHelpersService,
    public geo: CanvasGeometryService,
    public pallete: CanvasPalleteService,
    public coreService: CoreService,
    @Inject(DOCUMENT) private document: Document
    ) {
  }

  createCanvas(elemId:string, width:number, height:number){  
    this.canvas = this.document.createElement('canvas');
    this.canvas.width = this.width = width;
    this.canvas.height = this.height = height;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;
    this.document.getElementById(elemId)?.appendChild(this.canvas);
  }

  clearCanvas(){
    this.ctx.clearRect(0,0,this.width,this.height)
  }

  giveConstants(){
    this.config.cartoonColors = this.pallete.cartoonColors;
    this.center = { x: Math.round(this.width/2), y: Math.round(this.height/2), }
    this.config.ellipse = { rx: Math.round(this.width/2), ry: Math.round(this.height/2), } 
    this.maxHypo = Math.round(Math.hypot(this.center.x - 0, this.center.y - 0)) + 1;
    //this.info.averageRgb
    //this.info.colorCount
    //this.info.colors
  
  }

  tempCanvasDataUrl(data:any, width:number, height: number) : string{
    let canv:any = this.document.createElement('canvas');
    canv.width = width;
    canv.height = height;
    canv.getContext('2d').putImageData(data, 0, 0, 0, 0, width, height);
    setTimeout(() => {canv.remove()}, 5000);
    return canv.toDataURL();    
  }

  loadImage(src:string) : Observable<HTMLImageElement>{ 
    this.imageSrc = src; 
    return new Observable((observer) => {
      let image = new Image();
      image.onload = () => {
        //@todo apply max width or device width
        // this.image = image;
        // this.imageProto = image;
        setTimeout(()=>{
          observer.next(image)
        }, 0);
        
      };
      image.src = this.imageSrc;
      image.crossOrigin = "Anonymous";
    });
  }

  initCanvasWithImage(elemId:string, src:string, resizeW?:number): Observable<{img: string, width: number, height: number}>{
    return new Observable((observer:any)=>{
      this.loadImage(src).subscribe((image)=>{
        let w = image.width, h = image.height, resizedW = image.width, resizedH = image.height;
        if(resizeW && (resizeW < w)){
          let s = resizeW/w;
          resizedW = w*s, resizedH = h*s;
        }
        this.width = resizedW;
        this.height = resizedH;

        this.createCanvas(elemId, resizedW, resizedH);
        this.ctx.drawImage(image, 0, 0, w, h, 0, 0, resizedW, resizedH);
        this.center = {x: Math.round(this.width/2), y: Math.round(this.height/2) };
        this.getImageData();
        this.giveConstants();
        this.info = this.helpers.getColorsInfo(this.imageData);
        const imageDataUrl = this.canvas.toDataURL();
   
        // this.image = this.canvas.toDataURL();
        // this.imageProto = this.canvas.toDataURL();

        const img = new Image();
        img.onload = () => {
          this.image = img;
          this.imageProto = img;
        };
        img.src = imageDataUrl;
        img.crossOrigin = "Anonymous";

        


        observer.next({img: imageDataUrl, width: resizedW, height: resizedH});
        
      })
    })
  }

  reInitImage(getInfo:boolean = false){
    return new Observable((observer:any)=>{
      //this.loadImage(this.imageSrc).subscribe((image)=>{
        this.image = this.imageProto;
        this.ctx.drawImage(this.image, 0, 0, this.image.width, this.image.height, 0, 0, this.width, this.height);
        this.getImageData();
        //this.clearCanvas()
        if(getInfo){
          this.info = this.helpers.getColorsInfo(this.imageData);
        }
        observer.next(this.info);
      //})
    })
  }

  getImageData(){
    this.imageData = this.ctx.getImageData(0, 0, this.width, this.height);  
  }

  getDataUrlForArea(startPoint: PointI, endPoint: PointI, remove:boolean) : string{
    let startX = (startPoint.x < endPoint.x) ? startPoint.x : endPoint.x;
    let startY = (startPoint.y < endPoint.y) ? startPoint.y : endPoint.y;
    let width = Math.abs(startPoint.x - endPoint.x);
    let height = Math.abs(startPoint.y - endPoint.y);
    let data = this.ctx.getImageData(startX, startY, width, height);

    if(remove){
      let endX = (startX + width);
      let endY = startY+height-1;
      this.doSomethingInLoopBetweenPoints((i:number, point:PointI)=>{
          this.imageData.data[i+3] = 0;      
        }, 
        true,
        {x: startX, y: startY}, 
        {x: endX, y: endY}
      );
    }    
    let dataUrl = this.tempCanvasDataUrl(data, width, height);
    return dataUrl;
  } 

  refresh(){
    //this.historyCurrent = this.history.length;
    // this.loadImage(this.imageSrc).subscribe((image)=>{
      this.image = this.imageProto;
      this.clearCanvas();
      this.ctx.drawImage( this.image, 0, 0, this.image.width, this.image.height );
      setTimeout(()=>{ this.getImageData(); }, 10); 
    // })
  }

  /** IN LOOP METHODS *****************************************/

  doSomethingInLoop(loopFN:Function, putData:boolean = true, startP?: PointI, endP?:PointI, poly?:PolyT){
    if(poly){
      this.doSomethingInLoopInPolygogPoints(loopFN, putData, poly, startP, endP);
      return;
    }
    
    if(startP && endP){
      this.doSomethingInLoopBetweenPoints(loopFN, putData, startP, endP);
      return;
    }
    let i = -4;
    let len = this.imageData.data.length;
    let point, color;

    while ( (i +=  4) < len ) {
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
      loopFN(i, point, color);
    }
    if(putData){
      this.ctx.putImageData(this.imageData, 0, 0); 
    }   
  }

  doSomethingInLoopBetween(loopFN:Function, startI: number, endI:number){
    let i = startI - 4;
    let point:PointI, color;

    while ( (i +=  4) <= endI ) {
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
      loopFN(i, point, color);
    }
    this.ctx.putImageData(this.imageData, 0, 0);    
  }

  doSomethingInLoopBetweenPoints(loopFN:Function, putData:boolean = true, startP?: PointI|any, endP?:PointI|any){
    let start = startP ? this.helpers.givePixelIndexFromPoint(startP, this.width) : 0;
    let end  = endP ? this.helpers.givePixelIndexFromPoint(endP, this.width) : 
                      this.helpers.givePixelIndexFromPoint({x:this.width, y:this.height}, this.width);

    let i = start - 4;
    let point:PointI, color;

    while ( (i +=  4) <= end ) {
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
      if(point.x >= startP.x && point.x <= endP.x && point.y >= startP.y && point.y <= endP.y){
        loopFN(i, point, color);
      }
    }
    if(putData){
      this.ctx.putImageData(this.imageData, 0, 0); 
    }    
  }

  doSomethingInLoopInPolygogPoints(loopFN:Function, putData:boolean = true, poly:PolyT, startP?: PointI|any, endP?:PointI|any){
    let start = startP ? this.geo.givePixelIndexFromPoint(startP, this.width) : 0;
    let end  = endP ? this.geo.givePixelIndexFromPoint(endP, this.width) : 
                      this.geo.givePixelIndexFromPoint({x:this.width, y:this.height}, this.width);

    let i = start - 4;
    let point:PointI, color;

    while ( (i +=  4) <= end ) {
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
      if(point.x >= startP.x && point.x <= endP.x && point.y >= startP.y && point.y <= endP.y){
        if(this.geo.inPolygon(point, poly)){
          loopFN(i, point, color);
        }
      }
    }
    if(putData){
      this.ctx.putImageData(this.imageData, 0, 0); 
    }    
  }

  /** IN BETWEEN EFFECTS ****************************************************************************/

  runWithReinit( clbk: Function ){
   
    if(this.applyEffectWithReInit){
      this.image = this.imageProto;
      this.reInitImage().subscribe(()=>{
        setTimeout(clbk(), 1000)     
      });
    }
    else{
      clbk()
      setTimeout( ()=>{this.assignCanvasToThisImage()}, 0) 
    }
    if(!this.pattern.isRunning){ 
      this.addToHistory(); 
    }

  }

  assignCanvasToThisImage(alsoToProto:boolean = false){
    this.canvas.toBlob((blob:any)=>{
      this.coreService.toBase64(blob).subscribe((base64:any) => {
        const image = new Image();
        image.onload = () => {
          setTimeout(()=>{
            this.image = image;
            if(alsoToProto){
              this.imageProto = image;
            }
          }, 0);   
        };
        image.src = base64;
        image.crossOrigin = "Anonymous";
      } );
    })
  }
  
  /** PIXEL ****************************************************/

  pixelEquals(i: number, r:number, g:number, b:number){
    this.imageData.data[i] = r;
    this.imageData.data[i+1] = g;
    this.imageData.data[i+2] = b;
  }

  pixelAddEach(i: number, r:number, g:number, b:number){
    this.imageData.data[i] += r;
    this.imageData.data[i+1] += g;
    this.imageData.data[i+2] += b;
  }

  pixelNegative(i: number, color: ColorI, brightness:number = 255){
    this.imageData.data[i] = brightness - color.r;
    this.imageData.data[i+1] = brightness - color.g;
    this.imageData.data[i+2] = brightness - color.b;
  }
  
  pixelWithAplhaEquals(i: number, r:number, g:number, b:number, a:number){
    this.imageData.data[i] = r;
    this.imageData.data[i+1] = g;
    this.imageData.data[i+2] = b;
    this.imageData.data[i+3] = a;   
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

  giveConfusion(startP?: PointI, endP?: PointI, poly?:PolyT){
    this.runWithReinit(()=>{
      let start = this.config.confusion.start;
      let randomness = this.config.confusion.randomness;
      this.doSomethingInLoop((i:number)=>{
        if(this.config.confusion.colors[0]){
          this.imageData.data[i] = start + Math.floor(Math.round(Math.random()*randomness));
        }
        if(this.config.confusion.colors[1]){
          this.imageData.data[i+1] = start + Math.floor(Math.round(Math.random()*randomness));
        }
        if(this.config.confusion.colors[2]){
          this.imageData.data[i+2] = start + Math.floor(Math.round(Math.random()*randomness));
        }
      }, true, startP, endP, poly);
      //this.assignCanvasToImage();   
    });
   
  }

  giveMultiColor(startP?: PointI, endP?: PointI, poly?:PolyT){
    
    this.runWithReinit(()=>{
      let colorStopsClone = JSON.parse(JSON.stringify(this.config.colorStops));
      let colors = colorStopsClone.map((colorStop:any)=>{
        let color = this.helpers.rgbStrToObj(colorStop.color);
        return Object.assign(color, {stop: colorStop.stop});
      });
      colors[colors.length-1].stop = 800; 

      this.doSomethingInLoop((i:number)=>{
        let sumColor = this.imageData.data[i] + this.imageData.data[i+1] + this.imageData.data[i+1];
        let color = (colors.filter((col:any)=> col.stop > sumColor))[0];
          this.imageData.data[i] = color.r;
          this.imageData.data[i + 1] = color.g;
          this.imageData.data[i + 2] = color.b;
          //this.imageData.data[i + 3] = 255;
      }, true, startP, endP, poly);      
    });
    

  } 

  givePixelate(startP?: PointI, endP?: PointI, poly?:PolyT){
    this.runWithReinit(()=>{
      let y = 0;
      let factor = this.config.pixelate.factor;
      let halfFactor = Math.round(factor/2)
      this.doSomethingInLoop((i:number, point:any, color:any)=>{
        if( (!(point.x%factor*3)) && (!(point.y%factor*3))){  
          if(this.config.pixelate.outline){
            this.ctx.beginPath();
            this.ctx.strokeStyle = `rgba(${color.r},${color.g},${color.b},${color.a})`;
            this.ctx.strokeRect(point.x - halfFactor, point.y - halfFactor, factor, factor);
            this.ctx.stroke();
          }
          else{
            this.ctx.beginPath();
            this.ctx.fillStyle = `rgba(${color.r},${color.g},${color.b},${color.a})`;
            this.ctx.fillRect(point.x - halfFactor, point.y - halfFactor, factor, factor);
            this.ctx.stroke();
          }
        }
        else{
          y = i;
        }          
      }, false, startP, endP, poly);
      this.getImageData();

    });   
  }

  givePixelate2(startP?: PointI, endP?: PointI, poly?:PolyT){
    this.runWithReinit(()=>{
      let factor = this.config.pixelate.circleFactor;
      let y = 0;
      this.doSomethingInLoop((i:number, point:any, color:any)=>{
        if( (!(point.x%factor)) && (!(point.y%factor))){  
          if(this.config.pixelate.circleOutline){
            this.ctx.beginPath();
            this.ctx.strokeStyle = this.helpers.objToRgbString(color);
            this.ctx.arc(point.x, point.y, (factor/2)+Math.round(factor/7), 0, 2 * Math.PI);
            this.ctx.stroke();
          }
          else{
            this.ctx.beginPath();
            this.ctx.fillStyle = this.helpers.objToRgbString(color);
            this.ctx.arc(point.x, point.y, (factor/2)+Math.round(factor/7), 0, 2 * Math.PI);
            this.ctx.fill();
          }
        }
        else{          
          y = i;
        }        
      }, false, startP, endP, poly);
      this.getImageData()
    });  
  }

  giveBNW(startP?: PointI, endP?: PointI, poly?:PolyT){
    this.runWithReinit(()=>{
      this.doSomethingInLoop((i:number, point:any, color:any)=>{
        this.pixelEquals(i, color[this.config.bnw.rgb[0]], color[this.config.bnw.rgb[0]], color[this.config.bnw.rgb[0]]);
      }, 
      true, startP, endP, poly);
    });      
  }

  giveNegative(startP?: PointI, endP?: PointI, poly?:PolyT){
    this.runWithReinit(()=>{    
      this.doSomethingInLoop((i:number, point:any, color:any)=>{
        this.pallete.pixelNegative(this.imageData, i, color, this.config.negative.brightness);
      }, true, startP, endP, poly);        
    }); 
  }

  giveExposure(startP?: PointI, endP?: PointI, poly?:PolyT){
    this.runWithReinit(()=>{  
      let distance =  this.config.exposure.distance;   
      this.doSomethingInLoop((i:number, point:any, color:any)=>{  
        this.pixelEquals(i, Math.round(color.r*distance), Math.round(color.g*distance), Math.round(color.b*distance));        
      }, true, startP, endP, poly);        
    }); 
  }

  givePolychromeNegative(startP?: PointI, endP?: PointI, poly?:PolyT){
    this.runWithReinit(()=>{ 
      let reverse = this.config.polychromeNegative.range;
      let middlePoint = this.config.polychromeNegative.middlePoint;   
      this.doSomethingInLoop((i:number, point:any, color:any)=>{
        this.imageData.data[i] > middlePoint ? 
        this.imageData.data[i]-=reverse : this.imageData.data[i]+=reverse;
        this.imageData.data[i+1] > middlePoint ? 
        this.imageData.data[i+1]-=reverse : this.imageData.data[i+1]+=reverse;
        this.imageData.data[i+2] > middlePoint ?
        this.imageData.data[i+2]-=reverse : this.imageData.data[i+2]+=reverse; 
      }, true, startP, endP, poly);        
    }); 

  }

  giveWhiteNoise(startP?: PointI, endP?: PointI, poly?:PolyT){
    this.runWithReinit(()=>{ 
      let add;   
      this.doSomethingInLoop((i:number, point:any, color:any)=>{
        add = -this.config.whiteNoise.factor + Math.ceil(Math.random()*(2*this.config.whiteNoise.factor));
        this.pixelAddEach(i, add, add, add);  
      }, true, startP, endP, poly);        
    }); 
  }

  giveParadise(startP?: PointI, endP?: PointI, poly?:PolyT){
    this.runWithReinit(()=>{ 
      let factor = this.config.paradise.factor;
      let add, hypo;
      this.doSomethingInLoop((i:number, point:any, color:any)=>{
        hypo = Math.hypot(this.center.x-point.x, this.center.y-point.y);
        add = factor*hypo;
        this.pixelAddEach(i, add, add, add);       
      }, true, startP, endP, poly);        
    }); 
  }

  giveIntensity(startP?: PointI, endP?: PointI, poly?:PolyT){
    this.runWithReinit(()=>{ 
      let factor = this.config.intensity.factor;
      let diffR, diffG, diffB
      this.doSomethingInLoop((i:number, point:any, color:any)=>{
        diffR = this.imageData.data[i] - this.info.averageRgb.r;
        diffG = this.imageData.data[i+1] - this.info.averageRgb.g;
        diffB = this.imageData.data[i+2] - this.info.averageRgb.b;  
        this.pixelAddEach(i, diffR*factor, diffG*factor, diffB*factor);  
      }, true, startP, endP, poly);        
    }); 
  }

  giveBloom(startP?: PointI, endP?: PointI, poly?:PolyT){
    this.runWithReinit(()=>{ 
      let data = JSON.parse(JSON.stringify(this.imageData.data));
      this.doSomethingInLoop((i:number, point:any, color:any)=>{
        let dirRadians = Math.atan2(this.center.y - point.y, this.center.x - point.x);
        let newX = Math.round(point.x + (Math.cos(dirRadians)*this.config.bloom.factor));
        let newY = Math.round(point.y + (Math.sin(dirRadians)*this.config.bloom.factor));
        let newI = (((newY-1)*this.width)+newX)*4;
        this.pixelEquals(i, data[newI], data[newI+1], data[newI+2]);  
      }, true, startP, endP, poly);        
    }); 
  } 

  giveOutlines(startP?: PointI, endP?: PointI, poly?:PolyT){

    this.runWithReinit(()=>{ 
      let data = JSON.parse(JSON.stringify(this.imageData.data));
      let factor = 50-this.config.outlines.factor;
      let bg:any;
      if(this.config.outlines.hasBg){ bg = this.helpers.rgbStrToObj(this.config.outlines.bgColor); }  
      let wPixels = this.width*4;
      this.doSomethingInLoop((i:number, point:any, color:any)=>{
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

        if( (Math.abs(color.r - data[i+(wPixels)]) > factor) && (Math.abs(color.g - data[i+1+(wPixels)]) > factor) &&
            (Math.abs(color.b - data[i+2+(wPixels)]) > factor) ){
          this.imageData.data[i] = 0;
          this.imageData.data[i+1] = 0;
          this.imageData.data[i+2] = 0;
        }           
      }, true, startP, endP, poly);        
    }); 
   
  }

  giveWater(startP?: PointI, endP?: PointI, poly?:PolyT){
    this.runWithReinit(()=>{ 
      let data = JSON.parse(JSON.stringify(this.imageData.data));
      let counter = 0;
      let asc = false;
      let factor = 84 + this.config.water.factor;
      this.doSomethingInLoop((i:number, point:any, color:any)=>{
        if(counter > factor){ asc = false; }
        else if(counter < -factor){ asc = true; }
        if(asc){ counter+=1; }
        else{ counter-=1; }
        let num = Math.round(Math.atan(counter)) === 0 ? this.width*4 : (this.width*4*Math.round(Math.atan(counter)));
        this.imageData.data[i] = data[num + i]; 
        this.imageData.data[i+1] = data[num + i + 1];
        this.imageData.data[i+2] = data[num + i + 2];
        this.imageData.data[i+3] = data[num + i + 3];
      }, true, startP, endP, poly);        
    });
  }

  giveFluffy(startP?: PointI, endP?: PointI, poly?:PolyT){
    this.runWithReinit(()=>{ 
      this.doSomethingInLoop((i:number, point:any, color:any)=>{
        let rand = -this.config.fluffy.factor + Math.ceil(Math.random()*2*this.config.fluffy.factor);
        let rand2 = -this.config.fluffy.factor + Math.ceil(Math.random()*2*this.config.fluffy.factor);     
        this.ctx.beginPath();
        this.ctx.strokeStyle = `rgba(${color.r},${color.g},${color.b},${color.a})`;
        this.ctx.moveTo(point.x, point.y);
        this.ctx.quadraticCurveTo(point.x - (rand/2), point.y - (rand2/2), point.x + rand2, point.y + rand);
        this.ctx.stroke(); 
      }, false, startP, endP, poly) 
      this.getImageData();
    })
    
  }

  giveSuck(startP?: PointI, endP?: PointI, poly?:PolyT){
    this.runWithReinit(()=>{ 
      let data = JSON.parse(JSON.stringify(this.imageData.data));
      let hypo, dirRadians, dirX, dirY, newX, newY, newI;
      this.doSomethingInLoop((i:number, point:any, color:any)=>{
        hypo = Math.round(Math.hypot( this.center.x-point.x, this.center.y - point.y));
        dirRadians = Math.atan2( this.center.y - point.y, this.center.x - point.x)//Math.sqrt(hypo);
        dirX = Math.cos(dirRadians)*this.config.suck.factor;
        dirY = Math.sin(dirRadians)*this.config.suck.factor;
        newX = Math.round(point.x - (dirX));
        newY = Math.round(point.y - (dirY));
        newI = this.geo.givePixelIndexFromPoint({x:newX, y:newY}, this.width);   
        this.pixelEquals(i, data[newI], data[newI+1], data[newI+2]);
        if(point.x < this.config.suck.factor || this.width - point.x < this.config.suck.factor){
          this.imageData.data[i+3] = 0;
        }

      }, true, startP, endP, poly);        
    }); 
  } 

  giveSpotlight(startP?: PointI, endP?: PointI, poly?:PolyT){
    this.runWithReinit(()=>{ 
      let polygon:PolyT = [
        [this.config.spotlight.controlX-this.config.spotlight.rangeX,0], 
        [this.config.spotlight.controlX+this.config.spotlight.rangeX,0], 
        [this.config.spotlight.controlY+this.config.spotlight.rangeY, this.height], 
        [this.config.spotlight.controlY-this.config.spotlight.rangeY, this.height]
      ]
      this.doSomethingInLoop((i:number, point:any, color:any)=>{
        if(this.helpers.inPolygon(point, polygon)){
          this.pixelAddEach(i, 30, 30, 30);      
        }
        else{
          this.pixelAddEach(i, -60, -60, -60);         
        }
      }, true, startP, endP, poly);        
    }); 
      
  }

  giveCartoonColors(startP?: PointI, endP?: PointI, poly?:PolyT){
    this.runWithReinit(()=>{
      let colsArr = this.config.cartoonColors.map((c:string)=>{ return this.helpers.rgbStrToObj(c); });
      let colorsLen = this.config.cartoonColors.length;
      let minDiffIndex, minDiff, diff, j;
      this.doSomethingInLoop((i:number, point:any, color:any)=>{
        minDiffIndex = -1, minDiff = 765;
        for(j = 0; j < colorsLen; j+= 1){
          diff = this.helpers.colorsDiff(color, colsArr[j]); 
          if(diff < minDiff){
            minDiffIndex = j;
            minDiff = diff;
            if(diff === 0){
              break;
            }
          }
        }
        this.pixelEquals(i, colsArr[minDiffIndex].r, colsArr[minDiffIndex].g, colsArr[minDiffIndex].b);
      }, true, startP, endP, poly);
    });
  }

  giveColendar(startP?: PointI, endP?: PointI, poly?:PolyT){
    this.runWithReinit(()=>{
      this.clearCanvas()
      let factor = this.config.colendar.factor;
      this.doSomethingInLoop((i:number, point:any, color:any)=>{
        if(!(point.x%factor) && !(point.y%factor) || (point.x+factor > this.width) || (point.y+factor > this.height)){
          let hypo = Math.hypot(this.center.x - point.x, this.center.y - point.y);
          let zeroToOne = (1-Math.abs(hypo/this.maxHypo))*(factor/2);
          this.ctx.clearRect(point.x-(factor/2), point.y-(factor/2), factor, factor);
          this.ctx.beginPath();
          this.ctx.fillStyle = this.helpers.objToRgbString(color);
          this.ctx.arc(point.x, point.y, zeroToOne, 0, 2*Math.PI);
          this.ctx.fill(); 
        }
      }, false, startP, endP, poly);
      this.getImageData();
    });
  }

  giveLetters(startP?: PointI, endP?: PointI, poly?:PolyT){
    this.runWithReinit(()=>{
      let factor =  this.config.letters.size;
      let density =  this.config.letters.density
      let fontSize = factor*density;
      let alphabet = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
      if(this.config.letters.phrase){
        alphabet = this.config.letters.phrase.split('');
      }

      this.doSomethingInLoop((i:number, point:any, color:any)=>{
        if(!(point.x%factor) && !(point.y%factor)){
          let rand = Math.floor(Math.random()*alphabet.length)
          this.ctx.clearRect(point.x, point.y, factor, factor);
          this.ctx.font = `900 ${fontSize}px Georgia`;
          this.ctx.beginPath();
          this.ctx.fillStyle = this.helpers.objToRgbString(color); 
          this.ctx.fillText(alphabet[rand], point.x, point.y+factor);
        }
      }, false, startP, endP, poly);
      this.getImageData();
    });
  }

  giveComic(startP?: PointI, endP?: PointI, poly?:PolyT){
    this.runWithReinit(()=>{
      let factor = this.config.comic.reverse;
      let sumFactor = this.config.comic.sumFactor;
      this.doSomethingInLoop((i:number, point:any, color:any)=>{      
          let sum = color.r + color.g + color.b;
          if(sum < sumFactor){
            this.pixelEquals(i, color.r-factor, color.g-factor,color.b-factor)   
          }
          else{
            this.pixelEquals(i, color.r+factor, color.g+factor,color.b+factor)
          } 
      }, true, startP, endP, poly);
    });
  }

  giveBackground(startP?: PointI, endP?: PointI, poly?:PolyT){
    let bg = this.helpers.rgbStrToObj(this.config.background.color)
    this.runWithReinit(()=>{
      this.doSomethingInLoop((i:number, point:any, color:any)=>{
        if(color.a === 0){
          this.pixelWithAplhaEquals(i, bg.r, bg.g, bg.b, 255);
        }
      }, 
      true, startP, endP, poly);
    });      
  }

  giveShadesOf(startP?: PointI, endP?: PointI, poly?:PolyT){
    let color = this.config.shadesOf.color;
    let shades = this.pallete.giveRgbShades(color).map((c:string)=>{ return this.helpers.rgbStrToObj(c); });
    let colorsLen = shades.length;
    let minDiffIndex, minDiff, diff, j;
    this.runWithReinit(()=>{
      this.doSomethingInLoop((i:number, point:any, color:any)=>{
        minDiffIndex = -1, minDiff = 765;
        for(j = 0; j < colorsLen; j+= 1){
          diff = this.helpers.colorsDiff(color, shades[j]); 
          if(diff < minDiff){
            minDiffIndex = j;
            minDiff = diff;
            if(diff === 0){
              break;
            }
          }
        }
        this.pixelEquals(i, shades[minDiffIndex].r, shades[minDiffIndex].g, shades[minDiffIndex].b);        
      }, 
      true, startP, endP, poly);
    });      
  }



  /** MULTI IMAGES EFFECTS **************************************/

  giveBlocks(){
    this.runWithReinit(()=>{
      //this.clearCanvas();
      let factor = 301 - this.config.blocks.factor;
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
      let factor = 81 - this.config.frames.factor;
      let stop = this.config.frames.stop;
      for( let x = 0, y = 0; x < this.center.x; x+=factor,y+=factor ){
        let dW = this.center.x - x;
        let dH = this.center.y - y;
        if( (dW > stop) && (dH > stop) ){
          this.ctx.drawImage(this.image, 0, 0, this.width, this.height, x, y, this.width-(x*2), this.height-(y*2));
        }
      }
      this.getImageData();      
    });
  }

  giveRotatingFrames(){
    this.runWithReinit(()=>{
      let scalefactor = this.config.rotatingFrames.scaleFactor;
      let degreesStop = this.config.rotatingFrames.degreesStop;
      let degreesPlus = this.config.rotatingFrames.degreesPlus;
      
      let incX = 0;
      let incY = 0;

      let analog1 = (this.width/this.height);
      let analog2 = (this.height/this.width);

      let inc11 = this.height/degreesStop;
      let inc22 = this.width/degreesStop;  

      
      for( let degrees = 0; degrees<degreesStop; degrees+=degreesPlus ){

          this.ctx.save();
          this.ctx.translate(this.center.x, this.center.y);
          this.ctx.rotate(degrees*(Math.PI/180));
          //this.ctx.clearRect(0, 0, );
          this.ctx.translate(-this.center.x, -this.center.y);

          this.ctx.drawImage(this.image, 
            0,0,this.width,this.height,
            (incX/2),(incY/2), this.width - incX, this.height - incY,
          ); 

          
          this.ctx.restore();
          incX += inc11*analog1*scalefactor;
          incY += inc22*analog2*scalefactor;   
          //console.log(incX, incY)   
      }
      this.getImageData();      
    });
  }

  giveVinyl(){
    this.runWithReinit(()=>{
      let degreesStart = 180; //Not 0 so its faster
      let degreesStop = 360;
      let degreesPlus = 1;//@todo parameterize
      this.ctx.save();
      this.ctx.globalAlpha = this.config.vinyl.factor;
      for( let degrees = degreesStart; degrees < degreesStop; degrees+=degreesPlus ){
          this.ctx.save();
          this.ctx.translate(this.center.x, this.center.y);        
          this.ctx.rotate(degrees*(Math.PI/180));
          this.ctx.drawImage(this.image, 
            0, 0, this.width, this.height, 
            -this.center.x, -this.center.y, this.width, this.height);      
            this.ctx.restore();
      }
      this.ctx.restore();
      this.getImageData(); 
    });
 
  }

  giveHolyLight(){
    this.runWithReinit(()=>{
      let framesStop = 60;
      let factor = 0;
      let factorIncrease = this.config.holyLight.factor;
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

  giveBlinds(){
    this.runWithReinit(()=>{
      let i=0;

      while(i < this.height){
        this.ctx.clearRect(0,i+1,this.width, this.height);
        let factor = (i%this.config.blinds.freq)*this.config.blinds.depth;
  
        this.ctx.drawImage(this.image,
          0, i, this.width, this.height,
          Math.round(factor/2), i, this.width-(factor), this.height);
  
        i+=1;
       }
      this.getImageData();         
    });     
  }

  giveTremolo(){  
    this.runWithReinit(()=>{
      let i=0;     
      while(i < this.height){
       //this.ctx.clearRect(0,i+1,this.width, this.height);
        let factor = Math.round(Math.cos(i*this.config.tremolo.period)*this.config.tremolo.pitch);        
        this.ctx.drawImage(this.image,
          0, i, this.width, this.height,
          Math.round(factor/2), i, this.width, this.height);
        i+=1;
       }
     
      this.getImageData(); 
      
    });     
  }

  giveEllipse(){ 
    
    this.runWithReinit(()=>{
      
      this.ctx.clearRect(0,0,this.width, this.height);
      for (var i = (3/2)*Math.PI; i < (5/2)* Math.PI; i += 0.01 ) {
          let xPos = this.center.x - (this.config.ellipse.rx * Math.cos(i));
          let yPos = this.center.y + (this.config.ellipse.ry * Math.sin(i));
      
          this.ctx.clearRect(0,yPos,this.width, this.height);
          this.ctx.drawImage(this.image,
            0, yPos, this.width, this.height,  
            xPos, 
            yPos, 
            (this.center.x-xPos)*2, 
            this.height);
      }

      this.getImageData(); 
      
    });     
  }

  giveBrokenWall(){ 
    this.runWithReinit(()=>{
   
      let size = 100 - this.config.brokenWall.size;
      let dist = this.config.brokenWall.dist;
      let ii = Math.round(this.width/size);
      let jj = Math.round(this.height/size);
      let modII = Math.round((this.width%size)/2);
      let modJJ = Math.round((this.height%size)/2);

      this.clearCanvas();

      for(let i = modII; i < this.width; i+=ii){
        for(let j = modJJ; j < this.height; j+=jj){

          let hypo = Math.round(Math.hypot(this.center.x-i, this.center.y-j));

          let dirRadians = Math.atan2(this.center.y - j, this.center.x - i)
          let dirX = Math.cos(dirRadians)*Math.sqrt(hypo/(this.maxHypo+dist))*dist;
          let dirY = Math.sin(dirRadians)*Math.sqrt(hypo/(this.maxHypo+dist))*dist;
 
          this.ctx.drawImage(this.image, i, j, ii, jj, i-dirX, j-dirY, ii, jj);   
        }
      }   
      this.getImageData(); 
      
    });    
  }

  giveKlimt(){  
    this.runWithReinit(()=>{
   
      let size = 51 - this.config.klimt.size;
      let randomness = this.config.klimt.randomness;
      let ii = Math.round(this.width/size);
      let jj = Math.round(this.height/size);

      this.clearCanvas();
      this.ctx.drawImage(this.image,0,0,this.width,this.height); 

      for(let i = 0; i < this.width; i+=ii){
        for(let j = 0; j < this.height; j+=jj){
            let ran = Math.ceil(Math.random()*(randomness));
            this.ctx.save();
            this.ctx.translate(i, j);
            this.ctx.rotate(ran * (Math.PI / 180));
            this.ctx.translate(-(i), -(j));
            this.ctx.drawImage(this.image,
              i, j, ii, jj,
              i, j, ii, jj); 

            this.ctx.restore();             
        }
      }   
      this.getImageData(); 
      
    });   
  }

  givePourPaint(){ 
    
    this.runWithReinit(()=>{
      
      let i=0; 
      let randomRadius, randomX, randomY;

      let factor = Math.round((this.width*this.height)/10000);
      this.ctx.save();
      this.ctx.fillStyle = this.config.pourPaint.color;
      let max = this.config.pourPaint.density * factor;
      while(i < max){ 
        randomRadius = Math.ceil(Math.random()*this.config.pourPaint.range);
        randomX = Math.floor(Math.random()*this.width);
        randomY = Math.floor(Math.random()*this.height);
        this.ctx.beginPath();
        this.ctx.arc(randomX, randomY, randomRadius, 0, 2 * Math.PI);
        this.ctx.fill();
        i+=1;
      }      
      this.ctx.restore();
      this.getImageData()
      
    });     
  }

  giveWhirlpool(){
      //this.getImageData()
      this.runWithReinit(()=>{
        this.clearCanvas()
        let degreesStop = this.config.whirlpool.degreesStop;
        let degreesPlus = this.config.whirlpool.degreesPlus;
  
        let distX = 0;
        let distY = 0;
  
        let ratioX = (this.width/this.height);
        let ratioY = (this.height/this.width);
  
        let incrX = (this.center.x/degreesStop)*ratioX;
        let incrY = (this.center.y/degreesStop)*ratioY; 
  
        this.ctx.save();
        this.ctx.globalCompositeOperation = "destination-over";

        for( let degrees = 0; degrees < degreesStop; degrees+=degreesPlus ){
          
            this.ctx.save();
            this.ctx.translate(this.center.x, this.center.y);
            this.ctx.rotate(degrees*(Math.PI/180));  
            this.ctx.translate(-this.center.x, -this.center.y);
            // this.ctx.rect(this.center.x - distX, this.center.y - distY, distX*2, distY*2)
            // this.ctx.clip();
            this.ctx.drawImage(this.image, 
             this.center.x - distX, this.center.y - distY, distX*2, distY*2,
             this.center.x - distX, this.center.y - distY, distX*2, distY*2,
            );
            this.ctx.restore();
            
            distX += incrX;
            distY += incrY;
            console.log(this.center.x - distX, this.center.y - distY, distX*2, distY*2);
        }
        this.ctx.restore();
        this.getImageData(); 
      });      
  }

  giveDream(){

    this.runWithReinit(()=>{
      this.clearCanvas()
      let points = [];
      for(let i=0;i<this.config.dream.factor;i+=1){ points.push({x:i, y:i}); }
      points = this.coreService.shuffle(points);
      this.ctx.save();
      this.ctx.globalAlpha = 0.1;
      points.forEach((p)=>{ 
        this.ctx.drawImage(this.image, 
          0,0, this.width, this.height, 
          p.x, p.y, this.width-(2*p.x), this.height-(2*p.y));        
      });
      this.ctx.restore();
      this.getImageData(); 
    });

  }

  giveAcrylicScratch(){

    this.runWithReinit(()=>{
      this.clearCanvas();
      let points = [];
      for(let i=-this.config.acrylicScratch.range;i<this.config.acrylicScratch.range;i+=1){
        points.push([i,i]);
      }
      points = this.coreService.shuffle(points);

      this.ctx.save();
      this.ctx.globalCompositeOperation = 'difference'
      points.forEach((p)=>{
        this.ctx.drawImage(this.image, 
          0,0, this.width, this.height, 
          p[0], p[1], this.width-(2*p[0]), this.height-(2*p[1]));      
      });
      this.ctx.restore();
      this.getImageData(); 
    });

  }

  /** TESTING ********************************************/


  scissorsTest = {
    var1: 1,
    var2: 1
  }



  scissors(startP?: PointI, endP?: PointI, poly?:PolyT){
    let min = this.info.colorRange?.min || {r: 0, g: 0, b: 0};
    let max = this.info.colorRange?.max || {r: 255, g: 255, b: 255};
 
    this.runWithReinit(()=>{
      //this.clearCanvas()

      let points = [];

      for(let i=-this.config.acrylicScratch.range;i<this.config.acrylicScratch.range;i+=1){
        points.push([i,i]);
      }

      points = this.coreService.shuffle(points);

      this.ctx.save();
      //this.ctx.globalAlpha = .1;
      this.ctx.globalCompositeOperation = 'difference'
      points.forEach((p)=>{
        console.log(p)
        this.ctx.drawImage(this.image, 
          0,0, this.width, this.height, 
          p[0], p[1], this.width-(2*p[0]), this.height-(2*p[1]));      
//this.ctx.clip();

      });




      this.ctx.restore();
      this.getImageData(); 

     // this.giveOutlines()

      // this.doSomethingInLoop((i:number, point:any, color:any)=>{      
        

      // }, true, startP, endP, poly);
      //this.getImageData();
    });

  }




  /** */

  private giveRandomStops(){
    let ran = Math.ceil(Math.random()*5);
    let stop = 50;
    let colorStops = [];
    for( let i = 0; i < ran; i+=1 ){
      let color = this.helpers.giveRandomColorStr();
      let colorStop = {color: color, stop: stop};
      colorStops.push(colorStop);
      stop+= Math.floor(Math.random()*(765/ran));
    }
    return colorStops;
  }

  giveRandomConfig(){
    let rgbArrs = [ [1,0,0],[0,1,0],[0,0,1],[1,1,0],[1,0,1],[0,1,1] ];
    this.config.colorStops = this.giveRandomStops();
    let ran = this.helpers.randNum(2, 16);
    this.config.cartoonColors = this.helpers.giveRandomColors(ran);
    this.config.confusion = { 
      colors: rgbArrs[Math.floor(Math.random()*5)], 
      start: Math.floor(Math.random()*50), 
      randomness: Math.floor(Math.random()*200) 
    };
    this.config.pixelate = { 
      factor: 2 + Math.floor(Math.random()*13), 
      outline: Math.random() > .5 ? false : true, 
      circleFactor: 2 + Math.floor(Math.random()*13), 
      circleOutline: Math.random() > .5 ? false : true 
    };
    this.config.bnw = { rgb: ['b', 'b', 'b'] };
    this.config.negative = { 
      brightness: Math.floor(Math.random()*255) 
    }
    this.config.polychromeNegative = { 
      middlePoint: 40 + Math.floor(Math.random()*185), 
      range: 40 + Math.floor(Math.random()*185) 
    };
    this.config.exposure = { 
      distance: .1 + (Math.random()*1.9)
    };
    this.config.whiteNoise = { 
      factor: 10 + Math.floor(Math.random()*240)
    };
    this.config.paradise = {
      factor: Math.random()
    };
    this.config.intensity = { 
      factor: Math.random()
    };
    this.config.bloom = { factor: Math.ceil(Math.random()*200), };
    this.config.outlines = { 
      factor: Math.ceil(Math.random()*49), 
      bgColor: 'rgba(255,255,255,1)', 
      hasBg: Math.random() > .5 ? false : true
    };
    this.config.water = { 
      factor: Math.ceil(Math.random()*5) 
    }
    this.config.blocks = { 
      factor: 20 + Math.floor(Math.random()*260)
    };
    this.config.frames = { 
      factor: Math.ceil(Math.random()*79), 
      stop: Math.floor(Math.random()*(this.width*.7)) 
    }
    this.config.rotatingFrames = { 
      scaleFactor: Math.random(), 
      degreesStop: Math.floor(Math.random()*360), 
      degreesPlus: Math.ceil(Math.random()*14) 
    }
    this.config.vinyl = {
      factor: 0.1 + Math.floor(Math.random()*0.2)
    }
    this.config.holyLight = {
      factor: 1 + Math.floor(Math.random()*9)
    }
    this.config.fluffy = {
      factor: 5 + Math.floor(Math.random()*45)
    }
    this.config.suck = {
      factor: 10 + Math.floor(Math.random()*90)
    }
    this.config.spotlight = { 
      controlX: Math.floor(Math.random()*(this.width)), 
      controlY: Math.floor(Math.random()*(this.width)), 
      rangeX: Math.floor(Math.random()*(this.width/2)), 
      rangeY: Math.floor(Math.random()*(this.width)) 
    }
    this.config.blinds = { 
      depth: .1+Math.random()*1.4, 
      freq: Math.floor(Math.random()*(this.width/3)) 
    }
    this.config.tremolo = { 
      period: Math.random()*.2, 
      pitch: Math.floor(Math.random()*100) 
    }
    this.config.ellipse = { 
      rx: Math.floor(this.width/4) + Math.floor(Math.random()*(this.width/3)), 
      ry: Math.floor(this.height/4) + Math.floor(Math.random()*(this.height/3)), 
    }
    this.config.brokenWall = { 
      size: Math.floor(Math.random()*100), 
      dist: Math.floor(Math.random()*200) 
    }
    this.config.klimt = {
      size: this.helpers.randNum(0, 40), 
      randomness: this.helpers.randNum(0, 200)
    }  
    this.config.pourPaint = {
      color: this.helpers.giveRandomColorStr(), 
      range: this.helpers.randNum(1, 20), 
      density: this.helpers.randNum(1, 60),
    }
    this.config.colendar = {
      factor: this.helpers.randNum(3, 20)
    }
    this.config.letters = {
      size: this.helpers.randNum(6, 20), 
      density: 1, 
      phrase: ''
    }

    
  }

  assignCanvasToImage(alsoToProto:boolean = false){
    this.canvas.toBlob((blob:any)=>{
      this.coreService.toBase64(blob).subscribe((base64:any) => {
        const image = new Image();
        image.onload = () => {
          this.width = image.width;
          this.height = image.height;
  
          setTimeout(()=>{
            this.image = image;
            if(alsoToProto){
              this.imageProto = image;
            }
          }, 0);   
        };
        image.src = base64;
        image.crossOrigin = "Anonymous";
      } );
    })
  }

  /** */


  addToHistory(){
    let dataUrl = this.tempCanvasDataUrl(this.imageData, this.width, this.height);
    this.history.unshift(dataUrl);
    if(this.history.length > 20){
      this.history.pop()
    }
    this.historyCurrent = this.history.length;
  }

  goToHistory(index:number){
    let src = this.history[index];
    const image = new Image();
    image.onload = () => {
      this.clearCanvas()
      this.ctx.drawImage(
        image,
        0,
        0,
        image.width,
        image.height
      );
      this.getImageData();
    };
    image.src = src;
    image.crossOrigin = "Anonymous";
  }

  /** */




  

}
