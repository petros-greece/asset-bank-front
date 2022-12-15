import { PointI, ColorI, PolyT, CanvasInfoI, EffectT, SequenceT } from 'src/app/interface/canvas.interface';

export class Editor {

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
    pourPaint: { color: 'red', range: 10, density: 10 },
    comic: { reverse: 80, sumFactor: 382 },
    whirlpool:{ degreesStop: 360, degreesPlus: .5 },
  }

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

  info:CanvasInfoI = {
    averageRgb: {r:0,g:0,b:0},
    colors: [],
    colorCount: 0
  }

  UI = {
    patterns : {
      expanded : false
    },
    sequence: {

    },
    editorSettings:{
      expanded: true
    }
  }

  effects:EffectT[] = [];
  effectsSequence:EffectT[] = [];

  editor = {
    sequence:<SequenceT[]> [],
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


  /** */

  attachConstants(){
    this.center = {
      x: Math.round(this.width/2),
      y: Math.round(this.height/2),        
    }
    this.config.ellipse = {
      rx: Math.round(this.width/2),
      ry: Math.round(this.height/2),   
    } 
    this.maxHypo = Math.round(Math.hypot(this.center.x - 0, this.center.y - 0)) + 1;
  }

  giveIndexFromPoint(point: PointI){
    return (((point.y)*this.width)+point.x)*4 | 0;
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

  

}