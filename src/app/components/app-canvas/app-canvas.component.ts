import { Component, OnInit, Input, Output, EventEmitter, ViewChild, TemplateRef} from '@angular/core';
import { Observable } from 'rxjs';
import { CoreService } from 'src/app/service/core.service';
import { saveAs } from 'file-saver';
import { ApiService } from 'src/app/service/api.service';
import { FabricService } from 'src/app/service/fabric.service';
import { CanvasService } from 'src/app/service/canvas.service';

export interface PointI {
  x: number;
  y: number;
};

export interface ColorI{
  r: number;
  g: number;
  b: number;
  a?: number;
}

type MethodNameT = 'addConfusion' | 'makeMultiColor' | 'pixelateData' | 'pixelateCircleData' | 'blackNWhite' | 'giveNegative' | 'giveExposure' | 'givePolychromeNegative' | 'giveWhiteNoise' | 'giveParadise' | 'giveIntensity' | 'giveBloom' | 'giveOutlines' | 'giveWater' | 'giveFluffy' | 'giveSuck' | 'giveSpotlight' | 'giveCartoonColors' 

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

  history: any = [];
  historyCurrent: number = 0;

  canvas: any;
  ctx: any;
  hasEvents: boolean = false;

  fabricCanvas: any;
  ctxFabric: any;

  dummyCanvas: any;
  dummyCtx:any;

  width: number = 0;
  height: number = 0;
  center: PointI = {x:0, y:0}
  maxHypo: number = 0;

  image:any;
  imageProto: any;
  imageData: any;

  canvasScale: number = 1;

  runWithReInit: boolean = true;

  colorStops = [ {color: 'rgb(0,255,0)', stop: 100}, {color: 'rgb(255,0,0)', stop: 500}, {color: 'rgb(0,0,0)', stop: 800}, ];
  confusion = { colors: [1,0,0], start: 0, randomness: 20 };
  pixelate = { factor: 3, outline: false, circleFactor: 5, circleOutline: false };
  bnw = { rgb: ['b', 'b', 'b'] };
  negative = { brightness: 255 };
  polychromeNegative = { middlePoint: 127, range: 100 };
  exposure = { distance: 1 };
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
  suck = {factor: 10}
  spotlight = { controlX: 100, controlY: 200, rangeX: 100, rangeY: 200 }
  blinds = { depth: 1, freq: 100 }
  tremolo = { period: .1, pitch: 10 }
  ellipse = { rx: 0, ry: 0, }
  brokenWall = { size: 50, dist: 100 }
  klimt = {size: 5, randomness: 90}

  info = {
    averageRgb: {r:0,g:0,b:0},
    colorObj:<any> [],
    colorCount: 0
  }

  
  constructor(
    public fabricService: FabricService,
    public coreService: CoreService, 
    public apiService: ApiService,
    public canvasService: CanvasService
  ) { 

  }

  ngOnInit(): void {
    
    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');
    
    this.initImageInfo(true).subscribe((image)=>{
      this.fabricService.giveFabricCanvas('fabricCanvas', {width: image.width, height: image.height }).subscribe((canvas)=>{
        this.fabricCanvas = canvas;
        this.fabricCanvas.appStatus = 'appStatus';
        this.fabricCanvas.preserveObjectStacking = false;
        this.ctxFabric = this.fabricCanvas.getContext('2d');
        this.doScaleCanvas(image.width);
        if(!this.hasEvents){
          this.attachConstants();
          this.attachFabricEvents();
          this.hasEvents = true;
          //this.fabricService.addControl(this.fabricCanvas)
          //this.canvasService.init(this.canvas, this.ctx);
          //this.canvasService.clearCanvas()
        }
      });
    });
    console.log(this)
    console.log(this.apiService.selectedCategory);
  }

  attachConstants(){
    this.center = {
      x: Math.round(this.width/2),
      y: Math.round(this.height/2),        
    }
    this.ellipse = {
      rx: Math.round(this.width/2),
      ry: Math.round(this.height/2),   
    } 
    this.maxHypo = Math.round(Math.hypot(this.center.x - 0, this.center.y - 0));
  }

  addToHistory(){
    let dataUrl = this.tempCanvasDataUrl(this.imageData, this.width, this.height);
    this.history.push(dataUrl);
    this.historyCurrent = this.history.length;
  }

  goToHistory(){
    if(this.historyCurrent < 0){
      this.historyCurrent = 0;
      return;
    }
    let src = this.history[this.historyCurrent];
    const image = new Image();
    image.onload = () => {
      this.ctx.clearRect(0,0,this.width, this.height);
      this.ctx.drawImage(
        image,
        0,
        0,
        image.width,
        image.height
      );
    
    };
    image.src = src;
    image.crossOrigin = "Anonymous";

  }

  inPolygon(point:PointI, vs:any) {

    var x = point.x, y = point.y;
    
    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][0], yi = vs[i][1];
        var xj = vs[j][0], yj = vs[j][1];
        
        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    
    return inside;
  }

  giveIndexFromPoint(point: PointI){
    return (((point.y)*this.width)+point.x)*4 | 0;
  }

  endpointToSrc(endpoint: string){
    let arr = this.selectedFilePath.split('/');
    return arr[arr.length-2]+'.'+arr[arr.length-1];
  }

  rgbStrToObj(rgbStr: string) : ColorI{
    let arr = (rgbStr.replace(/[a-z\(\)]/g, '')).split(',');
    return {
      r: Number(arr[0]),
      g: Number(arr[1]),
      b: Number(arr[2])
    }
  }

  objToRgbString(color: ColorI) : string{
    color.a === undefined ? 1 : color.a;
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
  }

  getImageData(){
    this.imageData = this.ctx.getImageData(0, 0, this.width, this.height);  
  }

  clearCanvas(){
    this.ctx.clearRect(0,0,this.width,this.height)
  }

  tempCanvasDataUrl(data:any, width:number, height: number){
    let canv:any = document.createElement('canvas');
    canv.width = width;
    canv.height = height;
    canv.getContext('2d').putImageData(data, 0, 0);
    setTimeout(() => {canv.remove()}, 5000);
    return canv.toDataURL();    
  }

  runWithReinit( clbk: Function ){
    this.addToHistory();
    if(this.runWithReInit){
      this.image = this.imageProto;
      this.initImageInfo().subscribe(()=>{
        setTimeout(clbk(), 1000)     
      });
    }
    else{
      clbk()
      setTimeout( ()=>{this.assignCanvasToImage()}, 1000) 
    }

  }

  /** */

  doSomethingInLoop(loopFN:Function, putData:boolean = true, startP?: PointI, endP?:PointI, poly?:any){
    if(poly){
      this.doSomethingInLoopInPolygogPoints(loopFN, putData, startP, endP, poly);
      return;
    }
    
    if(startP && endP){
      this.doSomethingInLoopBetweenPoints(loopFN, putData, startP, endP);
      return;
    }
    let i = -4;
    let len = this.imageData.data.length;
    let point, color;
    let center = {x: Math.round(this.width/2), y: Math.round(this.height/2) }
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
      loopFN(i, point, color, center);
    }
    if(putData){
      this.ctx.putImageData(this.imageData, 0, 0); 
    }   
  }

  doSomethingInLoopBetween(loopFN:Function, startI: number, endI:number){
    let i = startI - 4;
    let point:PointI, color;
    let center = {x: Math.round(this.width/2), y: Math.round(this.height/2) }
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
      loopFN(i, point, color, center);
    }
    this.ctx.putImageData(this.imageData, 0, 0);    
  }

  doSomethingInLoopBetweenPoints(loopFN:Function, putData:boolean = true, startP?: PointI|any, endP?:PointI|any){
    let start = startP ? this.giveIndexFromPoint(startP) : 0;
    let end  = endP ? this.giveIndexFromPoint(endP) : this.giveIndexFromPoint({x:this.width, y:this.height});

    let i = start - 4;
    let point:PointI, color;
    let center = {x: Math.round(this.width/2), y: Math.round(this.height/2) }
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
        loopFN(i, point, color, center);
      }
    }
    if(putData){
      this.ctx.putImageData(this.imageData, 0, 0); 
    }    
  }

  doSomethingInLoopInPolygogPoints(loopFN:Function, putData:boolean = true, startP?: PointI|any, endP?:PointI|any, poly?:any){
    let start = startP ? this.giveIndexFromPoint(startP) : 0;
    let end  = endP ? this.giveIndexFromPoint(endP) : this.giveIndexFromPoint({x:this.width, y:this.height});

    let i = start - 4;
    let point:PointI, color;
    let center = {x: Math.round(this.width/2), y: Math.round(this.height/2) }
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
        if(this.inPolygon(point, poly)){
          loopFN(i, point, color, center);
        }
      }
    }
    if(putData){
      this.ctx.putImageData(this.imageData, 0, 0); 
    }    
  }


  /** */

  attachFabricEvents(){

    let startPoint = {x:0, y: 0};
    let endPoint = {x:0, y: 0};

    this.fabricCanvas.on('mouse:down', (opt:any) => {
      

      //this.fabricService.addControl(this.fabricCanvas)

      startPoint.x = Math.round(opt.pointer.x); 
      startPoint.y = Math.round(opt.pointer.y);
      
      console.log('mouse:down', opt.pointer);

      if(this.fabricCanvas.appStatus === 'colorpicker'){
        let x = Math.round(opt.pointer.x); 
        let y = Math.round(opt.pointer.y);
        let i = (((y-1)*this.width)+x)*4;
        let pixel = this.ctxFabric.getImageData(x,y,1,1);
        let color;
        if(pixel && pixel.data[3]){
          color = pixel.data;
        }
        else{
          pixel = this.ctx.getImageData(x,y,1,1);
          color = pixel.data;
        }
      }
    });

    this.fabricCanvas.on('mouse:up', (opt:any) => {
      endPoint.x = Math.round(opt.pointer.x); 
      endPoint.y = Math.round(opt.pointer.y);
    
      if(this.fabricCanvas.appStatus === 'selectPart' || this.fabricCanvas.appStatus === 'selectAndRemovePart'){
        let remove = this.fabricCanvas.appStatus === 'selectAndRemovePart' ? true : false;
        let dataUrl = this.getDataUrlForArea(startPoint, endPoint, remove);
        this.fabricService.giveImgObj(dataUrl, this.fabricCanvas, startPoint)
        this.fabricCanvas.appStatus = '';    
      }
      else if(this.fabricCanvas.appStatus === 'lassoRectangeEffect'){
        let startP = {
          x: startPoint.x < endPoint.x ? startPoint.x : endPoint.x,
          y: startPoint.y < endPoint.y ? startPoint.y : endPoint.y,
        }
        let endP = {
          x: startPoint.x > endPoint.x ? startPoint.x : endPoint.x,
          y: startPoint.y > endPoint.y ? startPoint.y : endPoint.y,
        }
        this.giveLassoEffect(this.fabricCanvas.effectMethod, startP, endP);
      } 

    });

    this.fabricCanvas.on('path:created', (opt:any) => {
      if(this.fabricCanvas.appStatus === 'crop' || this.fabricCanvas.appStatus === 'excludeCrop'){
        let excludeCrop = this.fabricCanvas.appStatus === 'excludeCrop' ? true : false;
        this.fabricCanvas.appStatus = ''; 
        //this.mpla();
        this.lassoCrop(excludeCrop);
      }
      else if(this.fabricCanvas.appStatus === 'lassoMethodEffect'){
        this.giveLassoEffect(this.fabricCanvas.effectMethod);
      }      
    });
 
    this.fabricCanvas.on('before:selection:cleared', (opt:any) => {
      console.log('before:selection:cleared', opt);
    });
    
    this.fabricCanvas.on('selection:created', (opt:any) => {
      console.log('selection:created', opt);
    });   

  }

  giveLassoEffect(methodName: MethodNameT, startPoint?:PointI, endPoint?:PointI){
    if(!startPoint){
      let len = this.fabricCanvas._objects.length;
      let obj = this.fabricCanvas._objects[len-1];
      let polyInfo = this.fabricService.getPolyInfoFromObj(obj);
      let minPoint = polyInfo.minPoint;  
      let maxPoint = polyInfo.maxPoint;
      let poly = polyInfo.poly;
      this[methodName](minPoint, maxPoint, poly);
      this.fabricCanvas.remove(obj);  
    } 
    else{
      this[methodName](startPoint, endPoint);
    }
  }

  lassoCrop(excludeCropped:boolean=true){
    let len = this.fabricCanvas._objects.length;
    let obj = this.fabricCanvas._objects[len-1];
    let polyInfo = this.fabricService.getPolyInfoFromObj(obj);
    let minPoint = polyInfo.minPoint;  
    let maxPoint = polyInfo.maxPoint;
    let w = maxPoint.x-minPoint.x;
    let h = maxPoint.y-minPoint.y;
    let poly = polyInfo.poly;

    //copy the polygon data to the dummy canvas
    let imgData = this.dummyCtx.getImageData(0,0,this.width, this.height);
    this.doSomethingInLoopInPolygogPoints((i:number, point:PointI, color: any)=>{    
        imgData.data[i] = this.imageData.data[i];
        imgData.data[i+1] = this.imageData.data[i+1];
        imgData.data[i+2] = this.imageData.data[i+2];
        imgData.data[i+3] = this.imageData.data[i+3];
        if(excludeCropped){ this.imageData.data[i+3] = 0; }  
    }, true, minPoint, maxPoint, poly);   
    this.dummyCtx.putImageData(imgData,0,0);
    let dummyData = this.dummyCtx.getImageData(minPoint.x, minPoint.y, w, h);
    this.dummyCtx.clearRect(0,0,this.width,this.height);

    //temp data to canvas
    let dataUrl = this.tempCanvasDataUrl(dummyData, w, h);
    this.fabricCanvas.isDrawingMode = false;
    this.fabricCanvas.selection = true;
    this.fabricService.giveImgObj(dataUrl, this.fabricCanvas, {x:minPoint.x, y:minPoint.y});
    this.fabricCanvas.remove(obj);

  }

  getDataUrlForArea(startPoint: PointI, endPoint: PointI, remove:boolean){
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

  /** */

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

  initImageInfo(getFullInfo:boolean = false):Observable<any>{
    this.ctx.clearRect(0,0,this.width, this.height);
    if(this.image){
      return new Observable((observer) => {
          this.ctx.drawImage( this.image, 0, 0, this.image.width, this.image.height );
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
        this.ctx.drawImage( image, 0, 0, image.width, image.height );
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
    
    return new Observable((observer) => {
      const image = new Image();
      image.onload = () => {
        this.width = image.width;
        this.height = image.height;

        setTimeout(()=>{
          //console.log(image)
          this.image = image;
          this.imageProto = image;
          observer.next(image)
        }, 0);
        
      };
      image.src = this.selectedFilePath;
      image.crossOrigin = "Anonymous";
    });
  }

  refresh(){
    this.historyCurrent = this.history.length;
    this.loadImage().subscribe((image)=>{
      this.ctx.drawImage( image, 0, 0, image.width, image.height );
      setTimeout(()=>{ this.getImageData(); }, 10); 
    })
  }

  pixelEquals(i: number, r:number, g:number, b:number){
    this.imageData.data[i] = r;
    this.imageData.data[i+1] = g;
    this.imageData.data[i+2] = b;
  }

  /** STATISTICS ****************************************************/

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

  addConfusion(startP?: PointI, endP?: PointI, poly?:any){
    this.runWithReinit(()=>{
      let start = this.confusion.start;
      let randomness = this.confusion.randomness;
      this.doSomethingInLoop((i:number)=>{
        if(this.confusion.colors[0]){
          this.imageData.data[i] = start + Math.floor(Math.round(Math.random()*randomness));
        }
        if(this.confusion.colors[1]){
          this.imageData.data[i+1] = start + Math.floor(Math.round(Math.random()*randomness));
        }
        if(this.confusion.colors[2]){
          this.imageData.data[i+2] = start + Math.floor(Math.round(Math.random()*randomness));
        }
      }, true, startP, endP, poly);
      //this.assignCanvasToImage();   
    });
   
  }

  makeMultiColor(startP?: PointI, endP?: PointI, poly?:any){
    
    this.runWithReinit(()=>{
      let colorStopsClone = JSON.parse(JSON.stringify(this.colorStops));
      let colors = colorStopsClone.map((colorStop:any)=>{
        let color = this.rgbStrToObj(colorStop.color);
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

  pixelateData(startP?: PointI, endP?: PointI, poly?:any){
    this.runWithReinit(()=>{
      let y = 0;
      let factor = this.pixelate.factor;
      let halfFactor = Math.round(factor/2)
      this.doSomethingInLoop((i:number, point:any, color:any, center:any)=>{
        if( (!(point.x%factor*3)) && (!(point.y%factor*3))){  
          if(this.pixelate.outline){
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

  pixelateCircleData(startP?: PointI, endP?: PointI, poly?:any){
    this.runWithReinit(()=>{
      let factor = this.pixelate.circleFactor;
      let y = 0;
      this.doSomethingInLoop((i:number, point:any, color:any, center:any)=>{
        if( (!(point.x%factor)) && (!(point.y%factor))){  
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
      }, false, startP, endP, poly);
      this.getImageData()
    });  
  }

  blackNWhite(startP?: PointI, endP?: PointI, poly?:any){
    this.runWithReinit(()=>{
      this.doSomethingInLoop((i:number, point:any, color:any)=>{
        this.imageData.data[i] = color[this.bnw.rgb[0]];
        this.imageData.data[i+1] = color[this.bnw.rgb[0]];
        this.imageData.data[i+2] = color[this.bnw.rgb[0]];
      }, 
      true, startP, endP, poly);
    });      
  }

  giveNegative(startP?: PointI, endP?: PointI, poly?:any){
    this.runWithReinit(()=>{    
      this.doSomethingInLoop((i:number, point:any, color:any)=>{
        this.imageData.data[i] = this.negative.brightness - color.r;
        this.imageData.data[i+1] =  this.negative.brightness - color.g;
        this.imageData.data[i+2] = this.negative.brightness - color.b;  
      }, true, startP, endP, poly);        
    });     
  }

  giveExposure(startP?: PointI, endP?: PointI, poly?:any){
    this.runWithReinit(()=>{      
      this.doSomethingInLoop((i:number, point:any, color:any)=>{     
        this.imageData.data[i] = Math.round(color.r*this.exposure.distance);
        this.imageData.data[i+1] = Math.round(color.g*this.exposure.distance);
        this.imageData.data[i+2] = Math.round(color.b*this.exposure.distance);       
      }, true, startP, endP, poly);        
    }); 
  }

  givePolychromeNegative(startP?: PointI, endP?: PointI, poly?:any){
    this.runWithReinit(()=>{ 
      let reverse = this.polychromeNegative.range;
      let middlePoint = this.polychromeNegative.middlePoint;   
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

  giveWhiteNoise(startP?: PointI, endP?: PointI, poly?:any){
    this.runWithReinit(()=>{    
      this.doSomethingInLoop((i:number, point:any, color:any)=>{
        let rand = -this.whiteNoise.factor + Math.ceil(Math.random()*(2*this.whiteNoise.factor));
        this.imageData.data[i]+=rand;
        this.imageData.data[i+1]+=rand;
        this.imageData.data[i+2]+=rand;   
      }, true, startP, endP, poly);        
    }); 
  }

  giveParadise(startP?: PointI, endP?: PointI, poly?:any){
    this.runWithReinit(()=>{ 
      let factor = this.paradise.factor;
      this.doSomethingInLoop((i:number, point:any, color:any, center:any)=>{
        let hypo = Math.hypot(center.x-point.x, center.y-point.y);    
        this.imageData.data[i]+=factor*hypo;
        this.imageData.data[i+1]+=factor*hypo;
        this.imageData.data[i+2]+=factor*hypo;    
      }, true, startP, endP, poly);        
    }); 
  }

  giveIntensity(startP?: PointI, endP?: PointI, poly?:any){
    this.runWithReinit(()=>{ 
      let factor = this.intensity.factor;
      this.doSomethingInLoop((i:number, point:any, color:any, center:any)=>{
        let diffR = this.imageData.data[i] - this.info.averageRgb.r;
        let diffG = this.imageData.data[i+1] - this.info.averageRgb.g;
        let diffB = this.imageData.data[i+2] - this.info.averageRgb.b;  
  
        this.imageData.data[i] +=diffR*factor;
        this.imageData.data[i+1] +=diffG*factor;
        this.imageData.data[i+2] +=diffB*factor;   
      }, true, startP, endP, poly);        
    }); 
  }

  giveBloom(startP?: PointI, endP?: PointI, poly?:any){
    this.runWithReinit(()=>{ 
      let data = JSON.parse(JSON.stringify(this.imageData.data));
      this.doSomethingInLoop((i:number, point:any, color:any)=>{
        let dirRadians = Math.atan2(this.center.y - point.y, this.center.x - point.x);
  
        let newX = Math.round(point.x + (Math.cos(dirRadians)*this.bloom.factor));
        let newY = Math.round(point.y + (Math.sin(dirRadians)*this.bloom.factor));
        let newI = (((newY-1)*this.width)+newX)*4;

        this.imageData.data[i] = data[newI];
        this.imageData.data[i+1] = data[newI+1];
        this.imageData.data[i+2] = data[newI+2];   
      }, true, startP, endP, poly);        
    }); 
  } 

  giveOutlines(startP?: PointI, endP?: PointI, poly?:any){

    this.runWithReinit(()=>{ 
      let data = JSON.parse(JSON.stringify(this.imageData.data));
      let factor = 50-this.outlines.factor;
      let bg:any;
      if(this.outlines.hasBg){ bg = this.rgbStrToObj(this.outlines.bgColor); }  
      let wPixels = this.width*4;
      this.doSomethingInLoop((i:number, point:any, color:any, center:any)=>{
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

  giveWater(startP?: PointI, endP?: PointI, poly?:any){
    this.runWithReinit(()=>{ 
      let data = JSON.parse(JSON.stringify(this.imageData.data));
      let counter = 0;
      let asc = false;
      let factor = 84 + this.water.factor;
      this.doSomethingInLoop((i:number, point:any, color:any, center:any)=>{
        if(counter > factor){ asc = false; }
        else if(counter < -factor){ asc = true; }
        if(asc){ counter+=1; }
        else{ counter-=1; }
        let num = Math.round(Math.atan(counter)) === 0 ? this.width*4 : (this.width*4*Math.round(Math.atan(counter)));
        this.imageData.data[i] = data[num + i]; 
        this.imageData.data[i+1] = data[num + i + 1];
        this.imageData.data[i+2]= data[num + i + 2];
        this.imageData.data[i+3]= data[num + i + 3];
      }, true, startP, endP, poly);        
    });
  }

  giveFluffy(startP?: PointI, endP?: PointI, poly?:any){
    this.runWithReinit(()=>{ 
      this.doSomethingInLoop((i:number, point:any, color:any, center:any)=>{
        let rand = -this.fluffy.factor + Math.ceil(Math.random()*2*this.fluffy.factor);
        let rand2 = -this.fluffy.factor + Math.ceil(Math.random()*2*this.fluffy.factor);     
        this.ctx.beginPath();
        this.ctx.strokeStyle = `rgba(${color.r},${color.g},${color.b},${color.a})`;
        this.ctx.moveTo(point.x, point.y);
        this.ctx.quadraticCurveTo(point.x - (rand/2), point.y - (rand2/2), point.x + rand2, point.y + rand);
        this.ctx.stroke(); 
      }, false, startP, endP, poly) 
      this.getImageData();
    })
    
  }

  giveSuck(startP?: PointI, endP?: PointI, poly?:any){
    this.runWithReinit(()=>{ 
      let data = JSON.parse(JSON.stringify(this.imageData.data));
      let hypo, dirRadians;
      this.doSomethingInLoop((i:number, point:any, color:any, center:any)=>{
        hypo = Math.round(Math.hypot(center.x-point.x, center.y-point.y));
        dirRadians = Math.atan2(center.y - point.y, center.x - point.x)//Math.sqrt(hypo);
        let dirX = Math.cos(dirRadians)*this.suck.factor;
        let dirY = Math.sin(dirRadians)*this.suck.factor;
        let newX=0, newY=0;
        newX = Math.round(point.x - (dirX));
        newY = Math.round(point.y - (dirY));

        let newI = this.giveIndexFromPoint({x:newX, y:newY});   
        
        this.imageData.data[i] = data[newI];
        this.imageData.data[i+1] = data[newI+1];
        this.imageData.data[i+2] = data[newI+2]; 

        if(point.x < this.suck.factor || this.width - point.x < this.suck.factor){
          this.imageData.data[i+3] = 0;
        }

      }, true, startP, endP, poly);        
    }); 
  } 

  giveSpotlight(startP?: PointI, endP?: PointI, poly?:any){
    this.runWithReinit(()=>{ 
      let polygon = [
        [this.spotlight.controlX-this.spotlight.rangeX,0], 
        [this.spotlight.controlX+this.spotlight.rangeX,0], 
        [this.spotlight.controlY+this.spotlight.rangeY, this.height], 
        [this.spotlight.controlY-this.spotlight.rangeY, this.height]
      ]

      this.doSomethingInLoop((i:number, point:any, color:any, center:any)=>{
        if(this.inPolygon(point, polygon)){
          this.imageData.data[i] += 30;
          this.imageData.data[i+1] += 30;
          this.imageData.data[i+2] += 30;       
        }
        else{
          this.imageData.data[i] -= 60;
          this.imageData.data[i+1] -= 60;
          this.imageData.data[i+2] -= 60;         
        }
      }, true, startP, endP, poly);        
    }); 
      
  }

  giveCartoonColors(startP?: PointI, endP?: PointI, poly?:any){
    this.runWithReinit(()=>{
      let colsArr = this.cartoonColors.map((c:string)=>{ return this.rgbStrToObj(c); });
      let colorsLen = this.cartoonColors.length;

      this.doSomethingInLoop((i:number, point:any, color:any, center:any)=>{
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
      }, true, startP, endP, poly);

    });
  }

  /** MULTI IMAGES EFFECTS **************************************/

  giveBlocks(){
    this.runWithReinit(()=>{
      this.clearCanvas();
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
          this.ctx.rotate(degrees*(Math.PI/180));
          this.ctx.drawImage(this.image, 
            0, 0, this.width, this.height, 
            -(this.width/2)+factor, -(this.height/2)+factor, this.width-(2*factor), this.height-(2*factor));
          this.ctx.restore();       
      }
      this.getImageData();      
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
          this.ctx.rotate(degrees*(Math.PI/180));
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

  giveBlinds(){
    this.runWithReinit(()=>{
      let i=0;

      while(i < this.height){
        this.ctx.clearRect(0,i+1,this.width, this.height);
        let factor = (i%this.blinds.freq)*this.blinds.depth;
  
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
        let factor = Math.round(Math.cos(i*this.tremolo.period)*this.tremolo.pitch);        
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
          let xPos = this.center.x - (this.ellipse.rx * Math.cos(i));
          let yPos = this.center.y + (this.ellipse.ry * Math.sin(i));
      
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
   
      let size = 100 - this.brokenWall.size;
      let dist = this.brokenWall.dist;
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
 
          this.ctx.drawImage(this.image,
            i, j, ii, jj,
            i-dirX, j-dirY, ii, jj); 
       

          
        }
      }   
      this.getImageData(); 
      
    });    
  }

  giveKlimt(){  
    this.runWithReinit(()=>{
   
      let size = 51 - this.klimt.size;
      let randomness = this.klimt.randomness;
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

  /** TESTING  */

  scissors(){  
    this.runWithReinit(()=>{
   
      let size = 60;
      let dist = this.brokenWall.dist;
      let ii = Math.round(this.width/size);
      let jj = Math.round(this.height/size);
      let modII = Math.round((this.width%size)/2);
      let modJJ = Math.round((this.height%size)/2);

      this.ctx.clearRect(0,0,this.width,this.height)


      let rotate = 0;

      for(let i = 0; i < this.width; i+=ii){
        for(let j = 0; j < this.height; j+=jj){

  
          let ind = this.giveIndexFromPoint({x: i, y: j});
          console.log(ind )
          let color = {
            r: this.imageData.data[ind],
            g: this.imageData.data[ind+1],
            b: this.imageData.data[ind+2],
            a: this.imageData.data[ind+3]
          }
          let rgbStr = this.objToRgbString(color);
          console.log(rgbStr)
          this.ctx.beginPath()
          this.ctx.fillStyle = rgbStr;
          this.ctx.arc(i,j, jj, 0, 2 * Math.PI);
          this.ctx.fill() 

        }
      }
       
      this.getImageData(); 
      
    });  
  }

  scissorsrtrtr(){  
    this.runWithReinit(()=>{
   
      let size = 100 - this.brokenWall.size;
      let dist = this.brokenWall.dist;
      let ii = Math.round(this.width/size);
      let jj = Math.round(this.height/size);
      let modII = Math.round((this.width%size)/2);
      let modJJ = Math.round((this.height%size)/2);

      this.ctx.clearRect(0,0,this.width,this.height)


      let rotate = 0;

      for(let i = 0; i < this.width; i+=ii){
        for(let j = 0; j < this.height; j+=jj){

          this.ctx.save();
          let hypo = Math.round(Math.hypot(this.center.x - i, this.center.y-j));
          let mpla = Math.sqrt(hypo);
          let ana = this.maxHypo/hypo
          let dirRadians = Math.atan2(this.center.y - j, this.center.x - i);
          let dirX = Math.cos(dirRadians)*400;
          let dirY = Math.sin(dirRadians)*40;
          
          let ran = Math.floor(Math.random()*360)

          if(i<this.center.x){
                    this.ctx.translate(this.center.x, this.center.y );
                    this.ctx.rotate( dirRadians );
                    this.ctx.translate(-(this.center.x), -(this.center.y) );
                    this.ctx.drawImage(this.image,
                      i, j, ii, jj,
                      i, j, ii, jj); 
            
          }
          else{
            this.ctx.translate(this.center.x, this.center.y );
            this.ctx.rotate( dirRadians + (90*Math.PI/2) );
            this.ctx.translate(-(this.center.x), -(this.center.y) );
            this.ctx.drawImage(this.image,
              i, j, ii, jj,
              i, j, ii, jj); 

          }


          this.ctx.restore();




          rotate+=1;
          
        }
      }   
      this.getImageData(); 
      
    });  
  }

  scissorshjh(){  
    this.runWithReinit(()=>{

      let i=0; 
      let randomRadius, randomX, randomY;

      while(i < 1000){ 
        randomRadius = Math.ceil(Math.random()*10);
        randomX = Math.floor(Math.random()*this.width);
        randomY = Math.floor(Math.random()*this.height);
        this.dummyCtx.beginPath();
        this.dummyCtx.arc(randomX, randomY, randomRadius, 0, 2 * Math.PI);
        this.dummyCtx.fill();
        i+=1;
      }      
      
      let dummyData = this.dummyCtx.getImageData(0,0,this.width, this.height);
      let arr:any = [];

      this.doSomethingInLoop((i:number, point:any, color:any, center:any)=>{
        if(dummyData.data[i+3]){
          arr.push(i);
        }
        //let hypo = Math.hypot(center.x-point.x, center.y-point.y);    
        // dummyData.data[i]+=factor*hypo;
        // dummyData.data[i+1]+=factor*hypo;
        // dummyData.data[i+2]+=factor*hypo;    
      }); 
      console.log(arr)
      this.dummyCtx.clearRect(0,0,this.width, this.height)
      this.doSomethingInLoop((i:number, point:any, color:any, center:any)=>{
        if(arr.includes(i)){

          this.imageData.data[i+3]=0;
        }
        //this.imageData.data[i+1]+=factor*hypo;
        //this.imageData.data[i+2]+=factor*hypo;       
      }); 

    
      //this.getImageData(); 
      
    });     
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

  replaceUIColor(e:string, index: number){
    //this.runWithReinit(()=>{
      let eventRGB = this.rgbStrToObj(e);
      this.replaceColor( this.rgbStrToObj(this.info.colorObj[index][0]), eventRGB )
      this.info.colorObj[index][0] = `${eventRGB.r}, ${eventRGB.g}, ${eventRGB.b}`;
    //});   
  }

  /*** */

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

  removeAsset(){
    let src = this.endpointToSrc(this.selectedFilePath);
    let index = this.apiService.selectedCategory.files.indexOf(src);
    this.apiService.selectedCategory.files.splice(index, 1);
    this.coreService.closeDialogById('previewCanvasDialog');
    this.onRemoveFile.emit(index);
  }

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
    this.getImageData(); 
    this.assignCanvasToImage(true);
//this.canvas.toDataURL();
    
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
