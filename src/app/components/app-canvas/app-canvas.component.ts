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
  imageData: any;

  canvasScale: number = 1;

  colorStops = [{color: 'rgb(0,255,0)', stop: 100}, {color: 'rgb(255,0,0)', stop: 500}];
  confusion = {
    colors: [1,0,0],
    start: 0,
    randomness: 20
  }
  pixelate = {
    factor: 3,
    circleFactor: 5
  }
  bnw = {
    rgb: ['b', 'b', 'b']
  }

  negative = {
    brightness: 255
  }
  exposure = {
    xOry: 'x',
    distance: 0
  }

  info = {
    averageRgb: {r:0,g:0,b:0},
    colorObj:<any> [],
    colorCount: 0
  }


  

  constructor(private coreService: CoreService, public apiService: ApiService) { 

  }

  ngOnInit(): void {

    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.initImageInfo().subscribe((image)=>{
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

  initImageInfo():Observable<any>{
    return new Observable((observer) => {
      this.loadImage().subscribe((image)=>{
        
        //this.toBase64(image).subscribe((bas64)=>{
          //console.log(bas64);
        //let blob = this.canvas.toBlob();

          this.ctx.drawImage(
            image,
            0,
            0,
            image.width,
            image.height
          );

           setTimeout(()=>{ this.getImageData(); }, 1000); 
          setTimeout(()=>{ this.info.averageRgb = this.getAverageRGB(); }, 1000);
          setTimeout(()=>{ this.info.colorObj = this.getColorsObj(); }, 1000); 
           setTimeout(()=>{ observer.next(image) }, 1000); 
        })

  
      //});

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
          console.log(image)
          observer.next(image)
        }, 0);
        
      };
      console.log(this.selectedFilePath)
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

  replaceColor(color: any, replacer: any){
    let i = -4;
    let len = this.imageData.data.length;
    while ( (i +=  4) < len ) {
      if( (this.imageData.data[i] === color.r) && (this.imageData.data[i+1] === color.g) && (this.imageData.data[i+2] === color.b) ){
        this.imageData.data[i] = replacer.r;
        this.imageData.data[i+1] = replacer.g;
        this.imageData.data[i+2] = replacer.b;
      }
    }
    this.ctx.putImageData(this.imageData, 0, 0)
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
    this.initImageInfo().subscribe(()=>{
      let i = -4;
      let len = this.imageData.data.length;
      while ( (i +=  4) < len ) {
        if(this.confusion.colors[0]){this.imageData.data[i] = this.confusion.start + Math.floor(Math.round(Math.random()*this.confusion.randomness));}
        if(this.confusion.colors[1]){this.imageData.data[i+1] = this.confusion.start + Math.floor(Math.round(Math.random()*this.confusion.randomness));}
        if(this.confusion.colors[2]){this.imageData.data[i+2] = this.confusion.start + Math.floor(Math.round(Math.random()*this.confusion.randomness));}
      }
      this.ctx.putImageData(this.imageData, 0, 0); 
    });   
  }

  pixelateData(){
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
        this.ctx.fillStyle = `rgba(${color.r},${color.g},${color.b},${color.a})`;
        this.ctx.fillRect(point.x, point.y, this.pixelate.factor, this.pixelate.factor);
      }
      else{
         y = i;
      }
  
          
    }
    this.getImageData();     
  }

  pixelateCircleData(stroke: boolean = false){
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

        if(stroke){
          this.ctx.beginPath();
          this.ctx.strokeStyle = `rgba(${color.r},${color.g},${color.b},${color.a})`;
          this.ctx.arc(point.x-(factor/2), point.y-(factor/2), (factor/2)+Math.round(factor/7), 0, 2 * Math.PI);
          this.ctx.stroke();
        }
        else{
          this.ctx.beginPath();
          this.ctx.fillStyle = `rgba(${color.r},${color.g},${color.b},${color.a})`;
          this.ctx.arc(point.x-(factor/2), point.y-(factor/2), (factor/2)+Math.round(factor/7), 0, 2 * Math.PI);
          this.ctx.fill();
        }

      }
      else{
         y = i;
      }
  
          
    }
    this.getImageData();
    //this.ctx.putImageData(this.imageData, 0, 0);   
  }

  blackNWhite(){
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
      this.imageData.data[i+1] = color[this.bnw.rgb[1]];
      this.imageData.data[i+2] = color[this.bnw.rgb[2]];
      
    }
    this.ctx.putImageData(this.imageData, 0, 0);      
  }

  giveNegative(){
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
  }

  giveExposure(increase: boolean = true){
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

      if(increase){
        if( !this.exposure.distance || point[`${this.exposure.xOry}`]%this.exposure.distance){
          this.imageData.data[i] = color.r*2;
          this.imageData.data[i+1] = color.g*2;
          this.imageData.data[i+2] = color.b*2; 
        }
      } 
      else{
        if( !this.exposure.distance || point[`${this.exposure.xOry}`]%this.exposure.distance){
          this.imageData.data[i] = color.r/2;
          this.imageData.data[i+1] = color.g/2;
          this.imageData.data[i+2] = color.b/2; 
        }        
      }
          
    }
    this.ctx.putImageData(this.imageData, 0, 0);    
  }



  scissors(){
    console.log(this.info)
    let i = -4;
    let len = this.imageData.data.length;
    let point;
    let color;
    while ( (i += 4) < len ) { 

      let avg = this.info.averageRgb.r + this.info.averageRgb.g +this.info.averageRgb.b;

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
      let avgColor = color.r + color.g + color.b;


      if(avgColor > avg ){
      this.imageData.data[i] = 255;
      //this.imageData.data[i+1] = 0;
      //this.imageData.data[i+2] = 0;
      this.imageData.data[i+3] = 0;
      }   

          
    }
    this.ctx.putImageData(this.imageData, 0, 0);    
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

  /** */

  makeUIMultiColor(){
    //this.initImageInfo().subscribe(()=>{
      let mapped = this.colorStops.map((colorStop)=>{
        let color = this.rgbStrToObj(colorStop.color);
        return Object.assign(color, {stop: colorStop.stop});
      });
      mapped[mapped.length-1].stop = 800;
      this.makeMultiColor(mapped);
   // });

  }

  replaceUIColor(e:string, index: number){
    let eventRGB = this.rgbStrToObj(e);
    this.replaceColor( this.rgbStrToObj(this.info.colorObj[index][0]), eventRGB )
    this.info.colorObj[index][0] = `${eventRGB.r}, ${eventRGB.g}, ${eventRGB.b}`;
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
