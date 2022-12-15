import { Component, OnInit, Input, Output, EventEmitter, ViewChild, TemplateRef} from '@angular/core';
import { Observable } from 'rxjs';
import { CoreService } from 'src/app/service/core.service';
import { saveAs } from 'file-saver';
import { ApiService } from 'src/app/service/api.service';
import { FabricService } from 'src/app/service/fabric.service';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatChipInputEvent} from '@angular/material/chips'
import { PointI, ColorI, PolyT, CanvasInfoI, PatternT, PatternSeriesT, SeriesT } from 'src/app/interface/canvas.interface';
import { CanvasHelpersService } from 'src/app/service/canvas-helpers.service';
import { EffectT, SequenceT, MethodNameT } from 'src/app/interface/canvas.interface';

@Component({
  selector: 'app-canvas',
  templateUrl: './app-canvas.component.html',
  styleUrls: ['./app-canvas.component.scss']
})

export class AppCanvasComponent implements OnInit {
 
  @Input() selectedFile: any;
  @Output() onRemoveFile = new EventEmitter<any>();
  @Output() onAddFile = new EventEmitter<any>();

  @ViewChild('imageEditorDialog', {static: true}) imageEditorDialog: TemplateRef<any> | any; 

  @ViewChild('confusionTmpl', {static: true}) confusionTmpl: TemplateRef<any> | any; 
  @ViewChild('whiteNoiseTmpl', {static: true}) whiteNoiseTmpl: TemplateRef<any> | any; 
  @ViewChild('colorStopsTmpl', {static: true}) colorStopsTmpl: TemplateRef<any> | any; 
  @ViewChild('negativeTmpl', {static: true}) negativeTmpl: TemplateRef<any> | any; 
  @ViewChild('pixelateTmpl', {static: true}) pixelateTmpl: TemplateRef<any> | any; 
  @ViewChild('pixelateCircleTmpl', {static: true}) pixelateCircleTmpl: TemplateRef<any> | any; 
  @ViewChild('bnwTmpl', {static: true}) bnwTmpl: TemplateRef<any> | any; 
  @ViewChild('polychromeNegativeTmpl', {static: true}) polychromeNegativeTmpl: TemplateRef<any> | any; 
  @ViewChild('paradiseTmpl', {static: true}) paradiseTmpl: TemplateRef<any> | any; 
  @ViewChild('exposureTmpl', {static: true}) exposureTmpl: TemplateRef<any> | any; 
  @ViewChild('intensityTmpl', {static: true}) intensityTmpl: TemplateRef<any> | any; 
  @ViewChild('bloomTmpl', {static: true}) bloomTmpl: TemplateRef<any> | any; 
  @ViewChild('outlinesTmpl', {static: true}) outlinesTmpl: TemplateRef<any> | any; 
  @ViewChild('waterTmpl', {static: true}) waterTmpl: TemplateRef<any> | any; 
  @ViewChild('blocksTmpl', {static: true}) blocksTmpl: TemplateRef<any> | any; 
  @ViewChild('framesTmpl', {static: true}) framesTmpl: TemplateRef<any> | any; 
  @ViewChild('rotatingFramesTmpl', {static: true}) rotatingFramesTmpl: TemplateRef<any> | any; 
  @ViewChild('cartoonColorsTmpl', {static: true}) cartoonColorsTmpl: TemplateRef<any> | any; 
  @ViewChild('vinylTmpl', {static: true}) vinylTmpl: TemplateRef<any> | any; 
  @ViewChild('holyLightTmpl', {static: true}) holyLightTmpl: TemplateRef<any> | any; 
  @ViewChild('fluffyTmpl', {static: true}) fluffyTmpl: TemplateRef<any> | any; 
  @ViewChild('spotlightTmpl', {static: true}) spotlightTmpl: TemplateRef<any> | any; 
  @ViewChild('blindsTmpl', {static: true}) blindsTmpl: TemplateRef<any> | any; 
  @ViewChild('ellipseTmpl', {static: true}) ellipseTmpl: TemplateRef<any> | any; 
  @ViewChild('tremoloTmpl', {static: true}) tremoloTmpl: TemplateRef<any> | any; 
  @ViewChild('brokenWallTmpl', {static: true}) brokenWallTmpl: TemplateRef<any> | any; 
  @ViewChild('suckTmpl', {static: true}) suckTmpl: TemplateRef<any> | any; 
  @ViewChild('klimtTmpl', {static: true}) klimtTmpl: TemplateRef<any> | any; 
  @ViewChild('pourPaintTmpl', {static: true}) pourPaintTmpl: TemplateRef<any> | any; 
  @ViewChild('colendarTmpl', {static: true}) colendarTmpl: TemplateRef<any> | any; 
  @ViewChild('lettersTmpl', {static: true}) lettersTmpl: TemplateRef<any> | any; 
  @ViewChild('comicTmpl', {static: true}) comicTmpl: TemplateRef<any> | any; 
  @ViewChild('whirlpoolTmpl', {static: true}) whirlpoolTmpl: TemplateRef<any> | any;
  @ViewChild('backgroundTmpl', {static: true}) backgroundTmpl: TemplateRef<any> | any;

  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  showTags: boolean = false;

  history: any = [];
  historyCurrent: number = 0;
  historySelected: any = [];
  historyShow: boolean = false;

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

  applyEffectWithReInit: boolean = true;
  state: any = {};

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
    frames: { factor: 10, stop: 300 },
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
  }

  info:CanvasInfoI = {
    averageRgb: {r:0,g:0,b:0},
    colors: [],
    colorCount: 0
  }

  UI = {
    effects: {
      height: 200
    },
    patterns : {
      expanded : true
    },
    sequence: {
      expanded : false
    },
    editorSettings:{
      expanded: false
    }
  }

  effects        :EffectT[] = [];
  effectsSequence:EffectT[] = [];

  editor = {
    sequence:<SequenceT[]> [],
    patterns :<SeriesT[]> []
  }

  sequence = {
    isRunning: false,
    effectsNum: 3,
    randomness: {
      config: false,
      rect: false,
      poly: false
    },
    name: 'test',
    fromStorage: false
  }

  constructor(
    public fabricService: FabricService,
    public coreService: CoreService, 
    public apiService: ApiService,
    public helpers: CanvasHelpersService
  ) { 

  }

  ngOnInit(): void {
    this.getUIFromStorage();
    this.initEffects();
    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });

    this.initImageInfo(true).subscribe((image)=>{
      this.fabricService.giveFabricCanvas('fabricCanvas', {width: image.width, height: image.height }).subscribe((canvas)=>{
        this.fabricCanvas = canvas;
        this.fabricCanvas.appStatus = 'appStatus';
        this.fabricCanvas.preserveObjectStacking = false;
        this.ctxFabric = this.fabricCanvas.getContext('2d');
        this.doScaleCanvas(image.width);
        if(!this.hasEvents){
          this.getConstants();
          this.attachFabricEvents();
          this.getEditorSettings();
          this.hasEvents = true;
          if(!this.selectedFile.tags){
            this.apiService.getData(`/assetRow/${this.apiService.user.id}/${this.selectedFile.src}`).subscribe({
              next: (data)=>{
                this.selectedFile.tags = data.tags ? JSON.parse(data.tags) : [];
              }
            });
          }
          else{
            this.selectedFile.tags = JSON.parse(this.selectedFile.tags);
          }
          this.showTags = true;
        }
      });
    });
    //console.log(this)
    // console.log(this.apiService.selectedCategory);
  }

  onListen(methodHead:string){
    console.log(methodHead);
    let filtered = this.effects.filter((e)=>{return e.head.toLowerCase() === methodHead});
    if(filtered[0]){
      this[filtered[0].method]();
    }
  }

  initEffects(){

    this.effects= [
      {head: 'Confusion',   method: 'giveConfusion',   tmpl: this.confusionTmpl }, 
      {head: 'White Noise', method: 'giveWhiteNoise', tmpl: this.whiteNoiseTmpl},
      {head: 'Color Stops', method: 'giveMultiColor', tmpl: this.colorStopsTmpl},
      {head: 'Negatives',   method: 'giveNegative',   tmpl: this.negativeTmpl}, 
      {head: 'Pixelate',    method: 'givePixelate',   tmpl: this.pixelateTmpl},              
      {head: 'Mosaic',      method: 'givePixelate2', tmpl: this.pixelateCircleTmpl}, 
      {head: 'BNW',         method: 'giveBNW',    tmpl: this.bnwTmpl},
      {head: 'Polychrome Negative', method: 'givePolychromeNegative', tmpl: this.polychromeNegativeTmpl},
      {head: 'Paradise',    method: 'giveParadise',   tmpl: this.paradiseTmpl},
      {head: 'Exposure',    method: 'giveExposure',   tmpl: this.exposureTmpl},
      {head: 'Intensity',   method: 'giveIntensity',  tmpl: this.intensityTmpl},
      {head: 'Bloom',       method: 'giveBloom',      tmpl: this.bloomTmpl},
      {head: 'Outlines',    method: 'giveOutlines',   tmpl: this.outlinesTmpl},
      {head: 'Water',       method: 'giveWater',      tmpl: this.waterTmpl}, 
      {head: 'Blocks',      method: 'giveBlocks',     noParamsMethod: true, tmpl: this.blocksTmpl}, 
      {head: 'Frames',      method: 'giveFrames',     noParamsMethod: true, tmpl: this.framesTmpl}, 
      {head: 'Rotating Frames', method: 'giveRotatingFrames', noParamsMethod: true, tmpl: this.rotatingFramesTmpl}, 
      {head: 'Cartoonize',  method: 'giveCartoonColors', tmpl: this.cartoonColorsTmpl}, 
      {head: 'Vinyl',       method: 'giveVinyl',      noParamsMethod: true, tmpl: this.vinylTmpl}, 
      {head: 'Holy Light',  method: 'giveHolyLight',  noParamsMethod: true, tmpl: this.holyLightTmpl}, 
      {head: 'Fluffy',      method: 'giveFluffy',     tmpl: this.fluffyTmpl}, 
      {head: 'Spotlight',   method: 'giveSpotlight',  tmpl: this.spotlightTmpl}, 
      {head: 'Blinds',      method: 'giveBlinds',     noParamsMethod: true, tmpl: this.blindsTmpl}, 
      {head: 'Ellipse',     method: 'giveEllipse',    noParamsMethod: true, tmpl: this.ellipseTmpl},   
      {head: 'Tremolo',     method: 'giveTremolo',    noParamsMethod: true, tmpl: this.tremoloTmpl},   
      {head: 'Broken Wall', method: 'giveBrokenWall', noParamsMethod: true, tmpl: this.brokenWallTmpl},     
      {head: 'Suck',        method: 'giveSuck',       noParamsMethod: true, tmpl: this.suckTmpl}, 
      {head: 'Klimt',       method: 'giveKlimt',      noParamsMethod: true, tmpl: this.klimtTmpl}, 
      {head: 'Pour Paint',  method: 'givePourPaint',  noParamsMethod: true, tmpl: this.pourPaintTmpl},  
      {head: 'Colendar',    method: 'giveColendar',   tmpl: this.colendarTmpl}, 
      {head: 'Letters',     method: 'giveLetters',    tmpl: this.lettersTmpl}, 
      {head: 'Comic',       method: 'giveComic',      tmpl: this.comicTmpl}, 
      {head: 'Whirlpool',   method: 'giveWhirlpool',  noParamsMethod: true,  tmpl: this.whirlpoolTmpl},
      {head: 'Background',   method: 'giveBackground',  tmpl: this.backgroundTmpl},                       
    ];
    this.effects.sort((a:any,b:any)=>{return a['head'].localeCompare(b['head'])}); 
  }

  getConstants(){
    this.center = { x: Math.round(this.width/2), y: Math.round(this.height/2), }
    this.config.ellipse = { rx: Math.round(this.width/2), ry: Math.round(this.height/2), } 
    this.maxHypo = Math.round(Math.hypot(this.center.x - 0, this.center.y - 0)) + 1;
    this.config.blocks.factor = Math.round(this.width/4);
    this.config.cartoonColors = this.helpers.giveDefaultCartoonColors();
    //this.info.averageRgb
    //this.info.colorCount
    //this.info.colors
  
  }

  giveIndexFromPoint(point: PointI) : number{
    return (((point.y)*this.width)+point.x)*4 | 0;
  }

  endpointToSrc(){
    let arr = this.selectedFile.path.split('/');
    return arr[arr.length-2]+'.'+arr[arr.length-1];
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
    canv.getContext('2d').putImageData(data, 0, 0, 0, 0, width, height);
    setTimeout(() => {canv.remove()}, 5000);
    return canv.toDataURL();    
  }

  runWithReinit( clbk: Function ){
   
    if(this.applyEffectWithReInit){
      this.image = this.imageProto;
      this.initImageInfo().subscribe(()=>{
        setTimeout(clbk(), 1000)     
      });
    }
    else{
      clbk()
      setTimeout( ()=>{this.assignCanvasToImage()}, 0) 
    }
    if(!this.pattern.isRunning){ this.addToHistory(); }
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
            setTimeout(()=>{ this.info = this.helpers.getColorsInfo(this.imageData); }, 10);
          }
          setTimeout(()=>{ observer.next(this.image) }, 30); 
          
      });
    }

    return new Observable((observer) => {
      this.loadImage().subscribe((image)=>{
        this.ctx.drawImage( image, 0, 0, image.width, image.height );
        setTimeout(()=>{ this.getImageData(); }, 10); 
        if(getFullInfo){
          setTimeout(()=>{ this.info = this.helpers.getColorsInfo(this.imageData); console.log(this.info)}, 10);
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
      image.src = this.selectedFile.path;
      image.crossOrigin = "Anonymous";
    });
  }

  refresh(){
    this.historyCurrent = this.history.length;
    this.loadImage().subscribe((image)=>{
      this.clearCanvas();
      this.ctx.drawImage( image, 0, 0, image.width, image.height );
      setTimeout(()=>{ this.getImageData(); }, 10); 
    })
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

  doSomethingInLoopInPolygogPoints(loopFN:Function, putData:boolean = true, poly:PolyT, startP?: PointI|any, endP?:PointI|any){
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
        if(this.helpers.inPolygon(point, poly)){
          loopFN(i, point, color, center);
        }
      }
    }
    if(putData){
      this.ctx.putImageData(this.imageData, 0, 0); 
    }    
  }

  /** FABRIC LASSO AND CROP *****************************/

  attachFabricEvents(){

    let startPoint = {x:0, y: 0};
    let endPoint = {x:0, y: 0};

    this.fabricCanvas.on('mouse:down', (opt:any) => {
      

      //this.fabricService.addControl(this.fabricCanvas)

      startPoint.x = Math.round(opt.pointer.x); 
      startPoint.y = Math.round(opt.pointer.y);
      
      //console.log('mouse:down', opt.pointer);

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
    }, true, poly, minPoint, maxPoint);   
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
  
  pixelWithAplhaEquals(i: number, r:number, g:number, b:number, a?:number){
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
      this.doSomethingInLoop((i:number, point:any, color:any, center:any)=>{
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
      this.doSomethingInLoop((i:number, point:any, color:any, center:any)=>{
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
        this.pixelNegative(i, color, this.config.negative.brightness);
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
      this.doSomethingInLoop((i:number, point:any, color:any, center:any)=>{
        hypo = Math.hypot(center.x-point.x, center.y-point.y);
        add = factor*hypo;
        this.pixelAddEach(i, add, add, add);       
      }, true, startP, endP, poly);        
    }); 
  }

  giveIntensity(startP?: PointI, endP?: PointI, poly?:PolyT){
    this.runWithReinit(()=>{ 
      let factor = this.config.intensity.factor;
      let diffR, diffG, diffB
      this.doSomethingInLoop((i:number, point:any, color:any, center:any)=>{
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

  giveWater(startP?: PointI, endP?: PointI, poly?:PolyT){
    this.runWithReinit(()=>{ 
      let data = JSON.parse(JSON.stringify(this.imageData.data));
      let counter = 0;
      let asc = false;
      let factor = 84 + this.config.water.factor;
      this.doSomethingInLoop((i:number, point:any, color:any, center:any)=>{
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
      this.doSomethingInLoop((i:number, point:any, color:any, center:any)=>{
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
      this.doSomethingInLoop((i:number, point:any, color:any, center:any)=>{
        hypo = Math.round(Math.hypot(center.x-point.x, center.y-point.y));
        dirRadians = Math.atan2(center.y - point.y, center.x - point.x)//Math.sqrt(hypo);
        dirX = Math.cos(dirRadians)*this.config.suck.factor;
        dirY = Math.sin(dirRadians)*this.config.suck.factor;
        newX = Math.round(point.x - (dirX));
        newY = Math.round(point.y - (dirY));
        newI = this.giveIndexFromPoint({x:newX, y:newY});   
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
      this.doSomethingInLoop((i:number, point:any, color:any, center:any)=>{
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
        this.pixelEquals(i, colsArr[minDiffIndex].r, colsArr[minDiffIndex].g, colsArr[minDiffIndex].b);
      }, true, startP, endP, poly);

    });
  }

  giveColendar(startP?: PointI, endP?: PointI, poly?:PolyT){
    this.runWithReinit(()=>{
      //this.clearCanvas()
      let factor = this.config.colendar.factor;
      this.doSomethingInLoop((i:number, point:any, color:any, center:any)=>{
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

      this.doSomethingInLoop((i:number, point:any, color:any, center:any)=>{
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
      this.doSomethingInLoop((i:number, point:any, color:any, center:any)=>{      
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

  background = {color: 'rgba(100, 100, 100, .8)'}

  giveBackground(startP?: PointI, endP?: PointI, poly?:PolyT){
    let bg = this.helpers.rgbStrToObj(this.background.color)
    this.runWithReinit(()=>{
      this.doSomethingInLoop((i:number, point:any, color:any)=>{
        if(color.a === 0){
          this.pixelWithAplhaEquals(i, bg.r, bg.g, bg.b, 255);
        }
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
      let degreesStop = 360;
      let degreesPlus = 1;//@todo parameterize
      for( let degrees = 0; degrees < degreesStop; degrees+=degreesPlus ){
          this.ctx.save();
          this.ctx.translate(this.center.x, this.center.y);
          this.ctx.globalAlpha = this.config.vinyl.factor;
          this.ctx.rotate(degrees*(Math.PI/180));
          this.ctx.drawImage(this.image, 
            0, 0, this.width, this.height, 
            -this.center.x, -this.center.y, this.width, this.height);      
            this.ctx.restore();
      }
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
            this.ctx.rotate(degrees*(Math.PI/180)*this.scissorsTest.sumFactor);  
            this.ctx.translate(-this.center.x, -this.center.y);
            this.ctx.drawImage(this.image, 
             this.center.x - distX, this.center.y - distY, distX*2, distY*2,
             this.center.x - distX, this.center.y - distY, distX*2, distY*2,
            );
            this.ctx.restore();
            
            distX += incrX;
            distY += incrY;
        }
        this.ctx.restore();
        this.getImageData(); 
      });      
  }

  /** TESTING  ************************************************************************************************************/

  scissorhh(){  
    this.runWithReinit(()=>{
   
      let size = 100 - this.config.brokenWall.size;
      let dist = this.config.brokenWall.dist;
      let ii = Math.round(this.width/size);
      let jj = Math.round(this.height/size);
      let modII = Math.round((this.width%size)/2);
      let modJJ = Math.round((this.height%size)/2);

      this.ctx.clearRect(0,0,this.width,this.height)


      let rotate = 0;

      for(let i = 0; i < this.width; i+=ii){
        for(let j = 0; j < this.height; j+=jj){

          this.ctx.save();
          let dirRadians = Math.atan2(this.center.y - j, this.center.x - i);

          if(i<this.center.x){
                    this.ctx.translate(this.center.x, this.center.y );
                    this.ctx.rotate( dirRadians );
                    this.ctx.translate(-(this.center.x), -(this.center.y) );
                    this.ctx.drawImage(this.image,
                      i, j, ii, jj,
                      i, j, ii, jj); 
            
          }
          // else{
          //   this.ctx.translate(this.center.x, this.center.y );
          //   this.ctx.rotate( dirRadians + (90*Math.PI/2) );
          //   this.ctx.translate(-(this.center.x), -(this.center.y) );
          //   this.ctx.drawImage(this.image,
          //     i, j, ii, jj,
          //     i, j, ii, jj); 

          // }


          this.ctx.restore();




          rotate+=1;
          
        }
      }   
      this.getImageData(); 
      
    });  
  }

  scissorsTest = {
    reverse: 360,
    sumFactor: .5
  }

  scissors(startP?: PointI, endP?: PointI, poly?:PolyT){


    this.runWithReinit(()=>{
      this.clearCanvas()
      let degreesStop = this.scissorsTest.reverse;
      let degreesPlus = 1;

      let distX = 0;
      let distY = 0;

      let ratioX = (this.width/this.height);
      let ratioY = (this.height/this.width);

      let incrX = (this.center.x/degreesStop)*ratioX*2;
      let incrY = (this.center.y/degreesStop)*ratioY*2; 


      this.ctx.globalCompositeOperation = "destination-over";

      for( let degrees = 0; degrees < degreesStop; degrees+=degreesPlus ){
          this.ctx.save();
          this.ctx.translate(this.center.x, this.center.y);
          this.ctx.rotate(degrees*(Math.PI/180)*this.scissorsTest.sumFactor);  
          this.ctx.translate(-this.center.x, -this.center.y);

          this.ctx.drawImage(this.image, 
           this.center.x - distX, this.center.y - distY, distX*2, distY*2,
           this.center.x - distX, this.center.y - distY, distX*2, distY*2,
          ); 
         

          this.ctx.restore();
          distX += incrX;
          distY += incrY;
   
      }
      this.getImageData(); 
    });



return;

    this.runWithReinit(()=>{
      //this.clearCanvas()
      let factor = this.scissorsTest.reverse;
      let sumFactor = this.scissorsTest.sumFactor;
      let sumThird = Math.round(this.scissorsTest.sumFactor/3);
      let r,g,b;
      this.doSomethingInLoop((i:number, point:any, color:any, center:any)=>{      
          //let hypo = Math.hypot(this.center.x - point.x, this.center.y - point.y);
          //let zeroToOne = 1-Math.abs(hypo/this.maxHypo);
          let sum = color.r + color.g + color.b;
          if(sum < sumFactor){
            this.pixelEquals(i, color.r-factor, color.g-factor,color.b-factor)   
          }
          else{
            this.pixelEquals(i, color.r+factor, color.g+factor,color.b+factor)
          } 
          
      
      }, true, startP, endP, poly);
      //this.getImageData();
    });
  }

  scissorsOmokentroiKykloi(startP?: PointI, endP?: PointI, poly?:PolyT){
    this.runWithReinit(()=>{
      //this.clearCanvas()
      let factor = 100;
      this.doSomethingInLoop((i:number, point:any, color:any, center:any)=>{      
          let hypo = Math.hypot(this.center.x - point.x, this.center.y - point.y);
          let zeroToOne = 1-Math.abs(hypo/this.maxHypo);
          if(hypo%50 > 25*(zeroToOne)){
            
            this.pixelEquals(i, color.r-factor, color.g-factor,color.b-factor)
          }
          else{
            this.pixelEquals(i, color.r+factor, color.g+factor,color.b+factor)
            //this.pixelNegative(i, color, 155);
          } 
      
      }, true, startP, endP, poly);
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

  /** RANDOM ******************************************************************************************/

  randNum(min:number, max:number, floor:boolean = true) : number{
    return floor ? min + Math.floor(Math.random()*(max-min)) : min + Math.ceil(Math.random()*(max-min)) ;
  }

  private giveRandomStops(){
    let ran = Math.ceil(Math.random()*5);
    let stop = 50;
    let colorStops = [];
    for( let i = 0; i < ran; i+=1 ){
      let r = Math.floor(Math.random()*255);
      let g = Math.floor(Math.random()*255);
      let b = Math.floor(Math.random()*255);
      let colorStop = {color: `rgb(${r},${g},${b})`, stop: stop};
      colorStops.push(colorStop);
      stop+= Math.floor(Math.random()*(765/ran));
    }
    return colorStops;
  }

  private giveRandomCartoonColors() :string[]{
    let ran = 2 + Math.floor(Math.random()*10);
    let cartoonColors = [];
    for( let i = 0; i < ran; i+=1 ){
      let r = Math.floor(Math.random()*255);
      let g = Math.floor(Math.random()*255);
      let b = Math.floor(Math.random()*255);
      cartoonColors.push(`rgb(${r},${g},${b})`);  
    }
    return cartoonColors;
  }

  private giveRandomConfig(){
    let rgbArrs = [ [1,0,0],[0,1,0],[0,0,1],[1,1,0],[1,0,1],[0,1,1] ];
    this.config.colorStops = this.giveRandomStops();
    this.config.cartoonColors = this.giveRandomCartoonColors();
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
      size: this.randNum(0, 40), 
      randomness: this.randNum(0, 200)
    }  
    this.config.pourPaint = {
      color: this.helpers.giveRandomColorStr(), 
      range: this.randNum(1, 20), 
      density: this.randNum(1, 60),
    }
    this.config.colendar = {
      factor: this.randNum(3, 20)
    }
    this.config.letters = {
      size: this.randNum(6, 20), 
      density: 1, 
      phrase: ''
    }

    
  }

  // backToState(){
  //   for(let prop in this.state){
  //     this[prop] = this.state[prop];
  //   }
  // }

  /** SEQUENCE *************************************************************************************/

  giveRecursiveRandomnness() : {startP: PointI | undefined, endP: PointI | undefined, poly:PolyT | undefined}{
    let obj:any = {startP: undefined, endP: undefined, poly: undefined};
    if(!this.config.cartoonColors.length){
      this.config.cartoonColors = this.giveRandomCartoonColors();
    }
    if(this.sequence.randomness.config){
      this.giveRandomConfig();
      this.config.cartoonColors = this.giveRandomCartoonColors();
    }
    if(this.sequence.randomness.rect){
      let points = this.helpers.giveRandomRectPoints(this.width, this.height);
      obj.startP = points[0];
      obj.endP = points[1];
    }  
    else if(this.sequence.randomness.poly){
      let polyInfo = this.helpers.giveRandomPoly(45, this.width, this.height);
      obj.poly = polyInfo.poly;
      obj.startP = polyInfo.startP;
      obj.endP = polyInfo.endP;
    }   
    return obj;
  }

  recursiveEffects(index: number = 0){    
    this.sequence.isRunning = true;
    let time = 0;
    let effect = this.effectsSequence[index];
    if(!effect){
      this.sequence.isRunning = false;
      this.applyEffectWithReInit = this.state.applyEffectWithReInit;
      //change the current effect config with the stored one
      if(this.sequence.fromStorage){      
        this.config = this.coreService.clone(this.state.config);
      }
      return;
    }
    //change the current effect config with the stored one
    if(this.sequence.fromStorage){
      this.config[effect.configProp] = effect.config;
    }
    let random = this.giveRecursiveRandomnness(); 
    setTimeout(()=> {
      let time1 = new Date().getTime()
      if(effect.noParamsMethod){
        this[effect.method]()
      }
      else{
        this[effect.method](random.startP, random.endP, random.poly)
      }
      let time2 = new Date().getTime()
      time = time2-time1;
      this.coreService.giveSnackbar(`${effect.head} - ${time}ms`)
      index+=1;
      this.recursiveEffects(index);    
    }, 1000);
  }

  giveEffectsSequence(){
    this.state.applyEffectWithReInit = this.applyEffectWithReInit;
    this.state.config = this.coreService.clone(this.config);
    this.sequence.name = (this.effectsSequence.map(e=>e.head)).join('-');
    this.applyEffectWithReInit = false;
    if(!this.state.applyEffectWithReInit){
      this.recursiveEffects(); 
      return;      
    }
    this.loadImage().subscribe((image)=>{
      this.ctx.drawImage( image, 0, 0, image.width, image.height );
      this.getImageData(); 
      this.recursiveEffects(); 
    }) 
  }

  giveEffectsFromSettings(sequence: any){
    this.sequence.fromStorage = true;
    this.effectsSequence = sequence.effects;
    this.giveEffectsSequence();
  }

  saveSequence(){
    let sequence:EffectT[] = [];
    this.effectsSequence.forEach((e:EffectT)=>{
      let configProp = e.method.slice(4).replace(/([^a-zA-Z])/g, '').toLowerCase();
      sequence.push({
        head: e.head,
        method: e.method,
        noParamsMethod: e.noParamsMethod,
        hidden: e.hidden,
        config: this.config[configProp],
        configProp: configProp
      });
    })
    let name = this.sequence.name;
    if(!this.editor.sequence){
      this.editor.sequence = [];
    }
    this.editor.sequence.push({name: name, effects:sequence});
    this.saveEditorSettings('sequence', this.editor.sequence);

  }

  giveRandomSequence(){
    this.effectsSequence = [];
    let len = this.effects.length;
    for(let i = 0; i < this.sequence.effectsNum; i+=1){
      let rand = Math.floor(Math.random()*len);
      let randEffect = this.effects[rand];
      this.effectsSequence.push(randEffect);
    }
    this.giveEffectsSequence();
  }

  /** PATTERNS */

  pattern:PatternT = {
    method:<MethodNameT>'giveNegative',
    xIncr: 200,
    yIncr: 200,
    applyMethod: false,
    color: 'red',
    isRunning: false,
    append: false,
    series:<any> [],
    seriesName: ''
  }

  addPatternSeries(fabricObj: {path:PolyT, color:string}){
    this.pattern.series.push({
      method: this.pattern.method,
      xIncr: this.pattern.xIncr,
      yIncr: this.pattern.yIncr,
      applyMethod: this.pattern.applyMethod,
      color: fabricObj.color,
      path:  fabricObj.path       
    }); 
  }

  onEmitPathPattern(series: PatternSeriesT[]){
    if(this.pattern.append){
      series.forEach((obj) => {
        this.addPatternSeries(obj);
      });
      return;
    }
    else{
      series.forEach((obj:any) => {
        obj.method = this.pattern.method;
        obj.xIncr = this.pattern.xIncr;
        obj.yIncr = this.pattern.yIncr;
        obj.applyMethod = this.pattern.applyMethod;
      });      
    }
 
    if(!this.applyEffectWithReInit){
      this.renderPatternSeries(series)
      return;      
    }
    this.loadImage().subscribe((image)=>{
      this.ctx.drawImage( image, 0, 0, image.width, image.height );
      this.getImageData(); 
      this.renderPatternSeries(series)
    }) 
 
  }

  renderPattern(obj: {path:PolyT, color:string}, pattern:PatternSeriesT){
    pattern.color = obj.color;
    let incrX = pattern.xIncr;
    let incrY = pattern.yIncr;
    //Apply image manipulation method or draw the pattern
    if(pattern.applyMethod){
      let method:MethodNameT = pattern.method;
      this[method]({x:0, y: 0}, {x:incrX, y:incrY}, obj.path);    
      let nextPoints = this.helpers.getNextPointsSequence(obj.path, this.width, this.height, incrX, incrY);
      this[method](nextPoints.minPoint, nextPoints.maxPoint, nextPoints.poly);
      while(nextPoints.poly.length){
        nextPoints = this.helpers.getNextPointsSequence(nextPoints.poly, this.width, this.height, incrX, incrY);
        this[method](nextPoints.minPoint, nextPoints.maxPoint, nextPoints.poly)
      }
    }
    else{
      this.helpers.drawFromPath(this.ctx, obj.path, pattern.color); 
      let nextPoints = this.helpers.getNextPointsSequence(obj.path, this.width, this.height, incrX, incrY);
      this.helpers.drawFromPath(this.ctx, nextPoints.poly, pattern.color);
      while(nextPoints.poly.length){
        nextPoints = this.helpers.getNextPointsSequence(nextPoints.poly, this.width, this.height, incrX, incrY);
        this.helpers.drawFromPath(this.ctx, nextPoints.poly, pattern.color);
      } 
    }
  }

  renderPatternSeries(series?:PatternSeriesT[]){ 
    //this.pattern.isRunning = true;
    let patternSeries = series ? series : this.pattern.series;
    console.log(patternSeries);
    let time1 = new Date().getTime();
    patternSeries.forEach((pattern:any) => {
      this.renderPattern({color:pattern.color, path: pattern.path}, pattern);
    });
    this.getImageData();
    this.addToHistory(); 
    this.assignCanvasToImage();

    let time2 = new Date().getTime();
    this.coreService.giveSnackbar(`Patterns ${time2-time1}ms`)
  }

  savePattern(){
    let name = this.pattern.seriesName;
    let series = this.pattern.series;
    let patternObj = {name: name, series: series};
    if(!this.editor.patterns){
      this.editor.patterns = [];
    }
    this.editor.patterns.push(patternObj);
    this.saveEditorSettings('patterns', this.editor.patterns);
    this.pattern.seriesName = '';
  }

  /** HISTORY */

  addBlocksFromHistory(){
    let len = this.historySelected.length;
    let coords = {x: 0, y: 0};
    let scale = 1/(Math.sqrt(len));
    let plusX = Math.floor(this.width*scale);
    let dataUrl, imgRight;

    for(let i = 0; i < len; i+=1){
      imgRight = coords.x + plusX;
      dataUrl = this.history[this.historySelected[i]];

      if( coords.x && (imgRight > this.width) ){
        coords.x = 0;
        coords.y+= (this.height*scale);
      }

      this.fabricService.giveImgObj(dataUrl, this.fabricCanvas, { x: coords.x, y: coords.y }, scale);      
      coords.x+= plusX;    
    }
    this.clearCanvas();
    this.historySelected = [];    
  }

  selectAllFromHistory(){
    this.historySelected = [ ...Array(this.history.length).keys() ].map( i => i);
  }

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
      this.ctx.clearRect(0,0,this.width, this.height);
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

  /** UI *******************/

  replaceUIColor(e:string, index: number){
    //this.runWithReinit(()=>{
      let eventRGB = this.helpers.rgbStrToObj(e);
      this.replaceColor( this.helpers.rgbStrToObj(this.info.colors[index][0]), eventRGB )
      this.info.colors[index][0] = `${eventRGB.r}, ${eventRGB.g}, ${eventRGB.b}`;
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
    let src = this.endpointToSrc();
    let index = this.apiService.selectedCategory.files.indexOf(src);
    this.apiService.selectedCategory.files.splice(index, 1);
    this.coreService.closeDialogById('imageEditorDialog');
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
        this.coreService.closeDialogById('imageEditorDialog');
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

  /** TAGS *****************************/

  addTag(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) { this.selectedFile.tags.push(value); }
    event.chipInput!.clear();
  }

  removeTag(tag:string): void {
    const index = this.selectedFile.tags.indexOf(tag);
    if (index >= 0) { this.selectedFile.tags.splice(index, 1); }
  }

  saveTags(){

    this.apiService.postAuthData('/assetTags', {
        accountId: this.apiService.user.id, 
        tags: this.selectedFile.tags, src: this.selectedFile.src}).subscribe({
        error: (e)=>{ this.coreService.giveSnackbar(e.message) }
    })

  }

  saveEditorSettings(type:string, settings:any){
    this.apiService.postData('/editorSettings', {
      accountId: 1, 
      editorSettings: settings,
      type: type
    }).subscribe({
      next: (res: any) => {
        this.editor = res.data;
        this.coreService.giveSnackbar(`${type} setting saved!`);
      },
      error: (err: any) => {
        console.log(err)
        this.coreService.giveSnackbar(err?.message, {
          duration: 5000,
          verticalPosition: 'top'
        });        
      },
      complete: () => {
        //this.coreService.closeAllDialogs();
        //location.reload();
      },
    })
  }

  getEditorSettings(){
    // let editor = this.coreService.getStorageObjDeep('asset-bank', ['editor']);
    // if(editor){
    //   this.editor = editor;
    //   console.log('from storage editor');
    //   return;
    // }
    this.apiService.getData(`/accountSettings/${this.apiService.user.id}`).subscribe({
      next: (res: any) => {
        if(res){
          this.editor = JSON.parse(res.editorSettings);
        }
      },
      error: (err: any) => {
        console.log(err)
        this.coreService.giveSnackbar(err?.message, {
          duration: 5000,
          verticalPosition: 'top'
        });        
      },
      complete: () => {
        this.coreService.updateStorageObjDeep('asset-bank', ['editor'], this.editor)
      },
    })
  }

  saveUIToStorage(){
    this.coreService.updateStorageObj('editorUI', this.UI);
  }

  getUIFromStorage(){
    let UI = this.coreService.getStorageObj('editorUI');
    UI ? this.UI = UI : null;
  } 
  
}
