import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CanvasService } from '../service/canvas.service';
import { EffectT, SequenceT, MethodNameT, PointI, SeriesT, PolyT, PatternT, PatternSeriesT } from 'src/app/interface/canvas.interface';
import { FabricService } from '../service/fabric.service';
import { ApiService } from '../service/api.service';
import { CoreService } from '../service/core.service';
import { CanvasGeometryService } from '../service/canvas-geometry.service';
import { CanvasHelpersService } from '../service/canvas-helpers.service';
import { CanvasPalleteService } from '../service/canvas-pallete.service';

@Component({
  selector: 'app-image-effects-canvas',
  templateUrl: './image-effects-canvas.component.html',
  styleUrls: ['./image-effects-canvas.component.scss']
})
export class ImageEffectsCanvasComponent implements OnInit {

  fabricCanvas: any;
  ctxFabric: any;

  dummyCanvas: any;
  dummyCtx:any;

  canvasScale:number = 1;
  selectedFile:any = {
    path: 'http://localhost/asset-bank-api/public/api/asset/1/U-1669365209/jpg'
  }

  UI = {
    effects: {
      height: 400
    },
    patterns : {
      expanded : true
    },
    sequence: {
      expanded : false
    },
    editorSettings:{
      expanded: false
    },
    history: {
      show: true
    }
  }

  effects        :EffectT[] = [];
  effectsSequence:EffectT[] = [];

  editor = {
    sequence :<SequenceT[]> [],
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

  state: any = {};

  historySelected: any = [];

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
  @ViewChild('shadesOfTmpl', {static: true}) shadesOfTmpl: TemplateRef<any> | any;

  constructor(
    public canvasService: CanvasService,
    public fabricService: FabricService,
    public apiService: ApiService,
    public coreService: CoreService,
    public geoHelpers: CanvasGeometryService,
    public helpers: CanvasHelpersService,
    public pallete: CanvasPalleteService
    ) { }

  ngOnInit(): void {
    this.initCanvas();
  }

  initCanvas(){

    this.canvasService.initCanvasWithImage('canvas-container', this.selectedFile.path).subscribe((image)=>{
    //setTimeout(()=>{    
      let box:any = document.getElementById('canvas-container');
      let width = box.offsetWidth;
      let scale = Number((width/image.width).toFixed(2));
      this.canvasScale = scale > 1 ? 1 : scale;
      this.initEffects();
      this.initFabricCanvas(image.width, image.height);
      this.dummyCanvas = document.getElementById('dummy-canvas');
      this.dummyCanvas.width = image.width;
      this.dummyCanvas.height = image.height;      
      this.dummyCtx = this.dummyCanvas.getContext('2d');
    //}, 2000);

    })

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
      {head: 'Shades Of',   method: 'giveShadesOf',  tmpl: this.shadesOfTmpl},               
    ];
    this.effects.sort((a:any,b:any)=>{return a['head'].localeCompare(b['head'])}); 
  }

  initFabricCanvas(width: number, height: number){
    this.fabricService.giveFabricCanvas('fabricCanvas', {width: width, height: height, backgroundColor: 'green' }).subscribe((canvas)=>{
      this.fabricCanvas = canvas;
      this.fabricCanvas.appStatus = 'appStatus';
      this.fabricCanvas.preserveObjectStacking = false;
      this.ctxFabric = this.fabricCanvas.getContext('2d');
      this.attachFabricEvents();
      this.getEditorSettings();
      //if(!this.hasEvents){
        // this.getEditorSettings();
        // this.hasEvents = true;
        // if(!this.selectedFile.tags){
        //   this.selectedFile.tags = [];
        //   this.apiService.getData(`/assetRow/${this.apiService.user.id}/${this.selectedFile.src}`).subscribe({
        //     next: (data)=>{
        //       if(data && data.tags){
        //         this.selectedFile.tags = data.tags;
        //         this.showTags = true;
        //       }
        //     }
        //   });
        // }
        // else{
        //   this.selectedFile.tags = JSON.parse(this.selectedFile.tags);
        //   this.showTags = true;
        // }
        
     // }
    });
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
    
      console.log(this.fabricCanvas.appStatus)

      if(this.fabricCanvas.appStatus === 'selectPart' || this.fabricCanvas.appStatus === 'selectAndRemovePart'){
        let remove = this.fabricCanvas.appStatus === 'selectAndRemovePart' ? true : false;
        let dataUrl = this.canvasService.getDataUrlForArea(startPoint, endPoint, remove);
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
      this.canvasService[methodName](minPoint, maxPoint, poly);
      this.fabricCanvas.remove(obj);  
    } 
    else{
      this.canvasService[methodName](startPoint, endPoint);
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
    let imgData = this.dummyCtx.getImageData(0,0,this.canvasService.width, this.canvasService.height);
    this.canvasService.doSomethingInLoopInPolygogPoints((i:number, point:PointI, color: any)=>{    
        imgData.data[i] = this.canvasService.imageData.data[i];
        imgData.data[i+1] = this.canvasService.imageData.data[i+1];
        imgData.data[i+2] = this.canvasService.imageData.data[i+2];
        imgData.data[i+3] = this.canvasService.imageData.data[i+3];
        if(excludeCropped){ this.canvasService.imageData.data[i+3] = 0; }  
    }, true, poly, minPoint, maxPoint);   
    this.dummyCtx.putImageData(imgData,0,0);
    let dummyData = this.dummyCtx.getImageData(minPoint.x, minPoint.y, w, h);
    this.dummyCtx.clearRect(0,0,this.canvasService.width,this.canvasService.height);

    //temp data to canvas
    let dataUrl = this.canvasService.tempCanvasDataUrl(dummyData, w, h);
    this.fabricCanvas.isDrawingMode = false;
    this.fabricCanvas.selection = true;
    this.fabricService.giveImgObj(dataUrl, this.fabricCanvas, {x:minPoint.x, y:minPoint.y});
    this.fabricCanvas.remove(obj);

  }

  /** EDITOR SETTINGS **************************************************************************/

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

  /** SEQUENCE *************************************************************************************/

  giveRecursiveRandomnness() : {startP: PointI | undefined, endP: PointI | undefined, poly:PolyT | undefined}{
    let obj:any = {startP: undefined, endP: undefined, poly: undefined};
    if(!this.canvasService.config.cartoonColors.length){
      let ran = this.helpers.randNum(2, 12);
      this.canvasService.config.cartoonColors = this.helpers.giveRandomColors(ran);
    }
    if(this.sequence.randomness.config){
      this.canvasService.giveRandomConfig();
      let ran = this.helpers.randNum(2, 12);
      this.canvasService.config.cartoonColors = this.helpers.giveRandomColors(ran);
    }
    if(this.sequence.randomness.rect){
      let points = this.geoHelpers.giveRandomRectPoints(this.canvasService.width, this.canvasService.height);
      obj.startP = points[0];
      obj.endP = points[1];
    }  
    else if(this.sequence.randomness.poly){
      let polyInfo = this.geoHelpers.giveRandomPoly(45, this.canvasService.width, this.canvasService.height);
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
      this.canvasService.applyEffectWithReInit = this.state.applyEffectWithReInit;
      //change the current effect config with the stored one
      if(this.sequence.fromStorage){      
        this.canvasService.config = this.coreService.clone(this.state.config);
      }
      this.canvasService.addToHistory(); 
      return;
    }
    //change the current effect config with the stored one
    if(this.sequence.fromStorage){
      this.canvasService.config[effect.configProp] = effect.config;
    }
    let random = this.giveRecursiveRandomnness(); 
    setTimeout(()=> {
      let time1 = new Date().getTime()
      if(effect.noParamsMethod){
        this.canvasService[effect.method]()
      }
      else{
        this.canvasService[effect.method](random.startP, random.endP, random.poly)
      }
      let time2 = new Date().getTime()
      time = time2-time1;
      this.coreService.giveSnackbar(`${effect.head} - ${time}ms`)
      index+=1;
      this.recursiveEffects(index);    
    }, 1000);
  }

  giveEffectsSequence(){
    this.state.applyEffectWithReInit = this.canvasService.applyEffectWithReInit;
    this.state.config = this.coreService.clone(this.canvasService.config);
    this.sequence.name = (this.effectsSequence.map(e=>e.head)).join('-');
    this.canvasService.applyEffectWithReInit = false;
    if(!this.state.applyEffectWithReInit){
      this.recursiveEffects(); 
      return;      
    }
    this.canvasService.reInitImage().subscribe(()=>{
      this.recursiveEffects(); 
    })
    // this.loadImage().subscribe((image)=>{
    //   this.ctx.drawImage( image, 0, 0, image.width, image.height );
    //   this.getImageData(); 
    //   this.recursiveEffects(); 
    // }) 
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
        config: this.canvasService.config[configProp],
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
    //if(!this.pattern.isRunning){ 
      
    //}
  }

  /** PATTERNS *************************************************************************************/

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
  
    if(!this.canvasService.applyEffectWithReInit){
      this.renderPatternSeries(series)
      return;      
    }
    this.canvasService.reInitImage().subscribe((image)=>{
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
      this.state.applyEffectWithReInit = this.canvasService.applyEffectWithReInit;
      this.canvasService.applyEffectWithReInit = false;
      this.canvasService[method]({x:0, y: 0}, {x:incrX, y:incrY}, obj.path);    
      let nextPoints = this.helpers.getNextPointsSequence(obj.path, this.canvasService.width, this.canvasService.height, incrX, incrY);
      this.canvasService[method](nextPoints.minPoint, nextPoints.maxPoint, nextPoints.poly);
      while(nextPoints.poly.length){
        nextPoints = this.helpers.getNextPointsSequence(nextPoints.poly, this.canvasService.width, this.canvasService.height, incrX, incrY);
        this.canvasService[method](nextPoints.minPoint, nextPoints.maxPoint, nextPoints.poly)
      }
      this.canvasService.applyEffectWithReInit = this.state.applyEffectWithReInit; 
    }
    else{
      this.helpers.drawFromPath(this.canvasService.ctx, obj.path, pattern.color); 
      let nextPoints = this.helpers.getNextPointsSequence(obj.path, this.canvasService.width, this.canvasService.height, incrX, incrY);
      this.helpers.drawFromPath(this.canvasService.ctx, nextPoints.poly, pattern.color);
      while(nextPoints.poly.length){
        nextPoints = this.helpers.getNextPointsSequence(nextPoints.poly, this.canvasService.width, this.canvasService.height, incrX, incrY);
        this.helpers.drawFromPath(this.canvasService.ctx, nextPoints.poly, pattern.color);
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
    this.canvasService.getImageData();
    this.canvasService.addToHistory(); 
    this.canvasService.assignCanvasToImage();

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

  /** HISTORY ************************************************************************************************/

  addBlocksFromHistory(){
    let len = this.historySelected.length;
    let coords = {x: 0, y: 0};
    let scale = 1/(Math.sqrt(len));
    let plusX = Math.floor(this.canvasService.width*scale);
    let dataUrl, imgRight;

    for(let i = 0; i < len; i+=1){
      imgRight = coords.x + plusX;
      dataUrl = this.canvasService.history[this.historySelected[i]];

      if( coords.x && (imgRight > this.canvasService.width) ){
        coords.x = 0;
        coords.y+= (this.canvasService.height*scale);
      }

      this.fabricService.giveImgObj(dataUrl, this.fabricCanvas, { x: coords.x, y: coords.y }, scale);      
      coords.x+= plusX;    
    }
    this.canvasService.clearCanvas();
    this.historySelected = [];    
  }

  selectAllFromHistory(){
    this.historySelected = [ ...Array(this.canvasService.history.length).keys() ].map( i => i);
  }



  goToHistory(index:number){
    let src = this.canvasService.history[index];
    const image = new Image();
    image.onload = () => {
      this.canvasService.clearCanvas()
      this.canvasService.ctx.drawImage(
        image,
        0,
        0,
        image.width,
        image.height
      );
      this.canvasService.getImageData();
    };
    image.src = src;
    image.crossOrigin = "Anonymous";
  }



}
