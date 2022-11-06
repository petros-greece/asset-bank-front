import { Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import { Observable } from 'rxjs';
import { CoreService } from 'src/app/service/core.service';
import { saveAs } from 'file-saver';
import { ApiService } from 'src/app/service/api.service';

@Component({
  selector: 'app-canvas',
  templateUrl: './app-canvas.component.html',
  styleUrls: ['./app-canvas.component.scss']
})
export class AppCanvasComponent implements OnInit {
 

  @Input() category: any;
  @Input() selectedFileIndex: any;
  @Input() selectedFilePath: any;

  @Output() onDropFiles = new EventEmitter<any>();
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

  /** */

  runWithReInit: boolean = true;

  colorStops = [{color: 'rgb(0,255,0)', stop: 100}, {color: 'rgb(255,0,0)', stop: 500}];
  
  confusion = {
    colors: [1,0,0],
    start: 0,
    randomness: 20
  }

  pixelate = {
    factor: 3,
    outline: false,
    circleFactor: 5,
    circleOutline: false
  }
  bnw = {
    rgb: ['b', 'b', 'b']
  }

  negative = {
    brightness: 255
  }
  polychromeNegative = {
    middlePoint: 127,
    range: 100
  }
  exposure = {
    distance: 2
  }

  info = {
    averageRgb: {r:0,g:0,b:0},
    colorObj:<any> [],
    colorCount: 0
  }


  

  constructor(
    public coreService: CoreService, 
    public apiService: ApiService) { 

  }

  ngOnInit(): void {

    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.initImageInfo(true).subscribe((image)=>{
      this.doScaleCanvas(image.width);
    });

  }




  removeAsset(){
    this.category.files.splice(this.selectedFileIndex, 1);
    this.coreService.closeDialogById('previewCanvasDialog');
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
    return sortable;
  }

  /** */

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
    let i = -4;
    let len = this.imageData.data.length;
    while ( (i +=  4) < len ) {
      this.imageData.data[i] += 10// Math.floor(Math.round(Math.random()*256));
      this.imageData.data[i + 1] += 10//Math.floor(Math.round(Math.random()*256));
      this.imageData.data[i + 2] += 10// Math.floor(Math.round(Math.random()*256));
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
          this.imageData.data[i + 3] = 255;
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
            this.ctx.strokeRect(point.x, point.y, this.pixelate.factor, this.pixelate.factor);
          }
          else{
            this.ctx.fillStyle = `rgba(${color.r},${color.g},${color.b},${color.a})`;
            this.ctx.fillRect(point.x, point.y, this.pixelate.factor, this.pixelate.factor);
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
      //this.getImageData();
      //this.ctx.putImageData(this.imageData, 0, 0); 
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



  scissors(){
    console.log(this.info)
    let i = -4;
    let len = this.imageData.data.length;
    let point;
    let color;
    let avg = this.info.averageRgb.r + this.info.averageRgb.g +this.info.averageRgb.b;
    let center = {x: Math.round(this.width/2), y: Math.round(this.height/2) }

    while ( (i += 4) < len ) { 

      point = {
        x: (i / 4) % this.width,
        y: Math.floor((i / 4) / this.width),
      };

      let hypo = Math.hypot(center.x-point.x, center.y-point.y)

      if(hypo > 200 && !(i%8)){
        let a = 170;
        this.imageData.data[i] > 127 ? 
        this.imageData.data[i]-=a : this.imageData.data[i]+=a;
        this.imageData.data[i+1] > 127 ? 
        this.imageData.data[i+1]-=a : this.imageData.data[i+1]+=a;
        this.imageData.data[i+2] > 127 ?
        this.imageData.data[i+2]-=a : this.imageData.data[i+2]+=a;
      }
      else{
        let a = 170;
        this.imageData.data[i] < 127 ? 
        this.imageData.data[i]-=a : this.imageData.data[i]+=a;
        this.imageData.data[i+1] < 127 ? 
        this.imageData.data[i+1]-=a : this.imageData.data[i+1]+=a;
        this.imageData.data[i+2] < 127 ?
        this.imageData.data[i+2]-=a : this.imageData.data[i+2]+=a;       
      }


      if(hypo > 100){
        let a = 0;
        this.imageData.data[i] < 127 ? 
        this.imageData.data[i]-=a : this.imageData.data[i]+=a;
        this.imageData.data[i+1] < 127 ? 
        this.imageData.data[i+1]-=a : this.imageData.data[i+1]+=a;
        this.imageData.data[i+2] < 127 ?
        this.imageData.data[i+2]-=a : this.imageData.data[i+2]+=a;   
      }     


      // color = {
      //   r: this.imageData.data[i],
      //   g: this.imageData.data[i+1],
      //   b: this.imageData.data[i+2],
      //   a: this.imageData.data[i+3]
      // };




      //let avgColor = color.r + color.g + color.b;


     // if(!(i%40)){
        // this.imageData.data[i] = this.info.averageRgb.r;
        // this.imageData.data[i+1] = this.info.averageRgb.g;
        // this.imageData.data[i+2] = this.info.averageRgb.b;
        
        /** */
        //this.ctx.beginPath();
        //this.ctx.fillStyle = `rgba(${color.r},${color.g},${color.r},${color.a-.3})`;

        // var grd = this.ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, 22);
        // grd.addColorStop(0, `rgba(${color.r},${color.g},${color.b},${color.a})`);
        // grd.addColorStop(1, `rgba(${color.b},${color.g},${color.r},${color.a})`);
        
        // Fill with gradient
        // this.ctx.fillStyle = grd;
        // this.ctx.arc(point.x, point.y, 22, 0, 2 * Math.PI);
        // this.ctx.fill();

        // let round = Math.ceil(Math.random()*93);
        // this.ctx.moveTo(point.x, point.y);
        // this.ctx.lineTo(point.x+round, point.y+round);
        // this.ctx.lineTo(point.x-round, point.y+round);       
        // this.ctx.quadraticCurveTo(point.x+round, point.y-round, point.x-round, point.y+2*round);
        // this.ctx.stroke();


      //this.imageData.data[i+3] = 0;
     // } 
      // else{
        //let rand = -100 + Math.ceil(Math.random()*200); 
        //this.imageData.data[i] = this.imageData.data[i]+rand;
        //this.imageData.data[i+1] = this.imageData.data[i+1]+rand;
        //this.imageData.data[i+2] = this.imageData.data[i+2]+rand;       
      // }  

          
    }
    this.ctx.putImageData(this.imageData, 0, 0); console.log(this.info.colorObj)   
  }

  scissors2(){
    let i = -4;
    let len = this.imageData.data.length;
    while ( (i +=  4) < len ) {
          if(i%9){
            this.imageData.data[i] = 255;
            this.imageData.data[i + 1] = 0;
            this.imageData.data[i + 2] = 0;
            this.imageData.data[i + 3] = 255;
          }
    }
    this.ctx.putImageData(this.imageData, 0, 0);    
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
    this.runWithReinit(()=>{
      let eventRGB = this.rgbStrToObj(e);
      this.replaceColor( this.rgbStrToObj(this.info.colorObj[index][0]), eventRGB )
      this.info.colorObj[index][0] = `${eventRGB.r}, ${eventRGB.g}, ${eventRGB.b}`;
    });   
  }

  /*** */

  onEmitCTX(e:any){
    this.ctxFabric = e.ctx;
    this.fabricCanvas = e.canvas;
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
        if(data[i+4]){
          this.imageData.data[i] = data[i];
          this.imageData.data[i + 1] = data[i+1];
          this.imageData.data[i + 2] = data[i+2];
          this.imageData.data[i + 3] = data[i+3];
        }
    }
    this.ctx.putImageData(this.imageData, 0, 0);
    this.fabricCanvas.clear();
  }

  addEditedImageToCat(closeDialog: boolean = false){
    this.mergeDataToDummy();
    const dataURL = this.dummyCanvas.toDataURL();
    this.category.files ? this.category.files.push(dataURL) : this.category.files = [dataURL];
    this.coreService.giveSnackbar(`Asset added to ${this.category.title}`);
    if(!closeDialog) return;
    this.coreService.closeDialogById('previewCanvasDialog');
  }

  downloadImage(type: string){
    this.mergeDataToDummy();
    this.dummyCanvas.toBlob((blob:any)=>{
      saveAs(blob, `siteland-asset-bank.${type}`);
    })
  }
  
}
