import { Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import { Observable } from 'rxjs';
import { CoreService } from 'src/app/service/core.service';
import { fabric } from 'fabric';

@Component({
  selector: 'app-image-editor',
  templateUrl: './image-editor.component.html',
  styleUrls: ['./image-editor.component.scss']
})
export class ImageEditorComponent implements OnInit {
  
  @Input()   base64: any;
  @Input() category: any;
  @Output() onDropFiles = new EventEmitter<any>();
  canvas: any;
  ctx: any;
  width: number = 0;
  height: number = 0;
  imageData: any;


  colorStops = [{color: 'rgb(0,255,0)', stop: 100}, {color: 'rgb(255,0,0)', stop: 500}];
  info = {
    averageRgb: {r:0,g:0,b:0},
    colorObj:<any> [],
    colorCount: 0
  }

  /**  */

  canvasOpts = {
    isDrawingMode: false
  }
  brush = {
    color: 'red',
    strokeLineCap: 'butt',
    width: 30
  }
  textbox = {
    background: 'rgba(255, 255, 255, 1)',
    color: 'rgba(0,0,0,1)',
    fontSize: 30,
  }

  constructor() { }

  ngOnInit(): void {
    this.initWithImage().subscribe();
  }

  initWithImage():Observable<any>{
    return new Observable((observer) => {
      this.loadImage().subscribe((image)=>{
        this.initcanvas(image).subscribe(()=>{
          this.getImageData().subscribe((imageData)=>{
            this.imageData = imageData;
              this.getAverageRGB().subscribe((averageRgb)=>{
                this.info.averageRgb = averageRgb;
                setTimeout(()=>{ 
                  this.info.colorObj = this.getColorsObj(); 
                  observer.next('');
                }, 20);

              });   
          });       
        });
      });
    });
  }

  loadImage():Observable<any>{
    return new Observable((observer) => {
      const image = new Image();
      image.onload = () => {
        this.width = image.width;
        this.height = image.height;     
        observer.next(image);     
      };
      image.src = './assets/img/pinkfloyd.jpg';
    });
  }

  toBase64(e:any):Observable<any>{
    return new Observable((observer) => {
      setTimeout(()=>{
        const reader = new FileReader();
        reader.readAsDataURL(e);
        reader.onload = () => {
          this.base64 = reader.result;
          observer.next(reader.result);
        };
      }, 0);
    });
  }

  initcanvas(image: any):Observable<any>{
    return new Observable((observer) => {
      this.width = image.width;
      this.height = image.height;
      this.canvas = new fabric.Canvas('canvas', {
        //controlsAboveOverlay: true,
        backgroundColor: 'rgba(255,0,0,0)',
        selection: false,
        selectionColor: 'yellow',
        selectionBorderColor: 'black',
        selectionLineWidth: 5,
        isDrawingMode: this.canvasOpts.isDrawingMode,
        preserveObjectStacking: true,
        freeDrawingCursor: 'pointer',
        width: image.width,
        height: image.height,
      });
      this.ctx = this.canvas.getContext('2d');
      
      fabric.Image.fromURL(image.src, (img)=>{
        img.selectable = false;
        this.canvas.add(img);
        observer.next('next');
      });
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

  getImageData():Observable<any>{
    return new Observable((observer) => {
      setTimeout(()=>{
        let imageData = this.ctx.getImageData(0, 0, this.width, this.height); 
        observer.next(imageData);
      }, 20)
    });
  }

  getAverageRGB(blockSize = 5):Observable<any>{
    return new Observable((observer) => {
      setTimeout(()=>{
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
    
        observer.next(rgb);
      }, 20);
    });
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

  replaceUIColor(e:string, index: number){
    let eventRGB = this.rgbStrToObj(e);
    this.replaceColor( this.rgbStrToObj(this.info.colorObj[index][0]), eventRGB )
    this.info.colorObj[index][0] = `${eventRGB.r}, ${eventRGB.g}, ${eventRGB.b}`;
  }

  makeUIMultiColor(){
    this.initWithImage().subscribe(()=>{
      let mapped = this.colorStops.map((colorStop)=>{
        let color = this.rgbStrToObj(colorStop.color);
        return Object.assign(color, {stop: colorStop.stop});
      });
      mapped[mapped.length-1].stop = 800;
      this.makeMultiColor(mapped);
    });

  }

  /** */

  addBrush(){
    this.canvas.isDrawingMode = true;
    this.canvas.selection = false;
    let PencilBrush = new fabric.PencilBrush(this.canvas);
    PencilBrush.color =  this.brush.color;//'red';
    PencilBrush.width = this.brush.width;//30;
    PencilBrush.strokeLineCap =  this.brush.strokeLineCap;//'butt','round', 'square'
    //PencilBrush.strokeDashArray = [25, 50]
    this.canvas.freeDrawingBrush = PencilBrush;

  }

  addTextBox(){
    this.canvas.isDrawingMode = false;
    this.canvas.selection = true;
    let textbox = new fabric.Textbox('Add Text', {
      stroke: this.textbox.color,
      //textBackgroundColor: this.textbox.color,
      top: 30,
      left: 30,
      fontSize: this.textbox.fontSize,
      width: 200,
      textAlign: 'center',
      fontStyle: 'normal',
      borderColor: this.textbox.background,
      paintFirst: 'fill',
      selectionBackgroundColor: this.textbox.background,
      backgroundColor: this.textbox.background
      //fontFamily:
    });

  

    this.canvas.add(textbox);
  }

  removeSelection(){
    let test = this.canvas.getActiveObject();
    this.canvas.remove(test);
   // test.delete;
    console.log(this.canvas);
  }

  eraseBrush(){
    let EraseBrush = this.canvas.SprayBrush();
  }

  addRect(){

    var rect = new fabric.Rect({
      left: 100,
      top: 50,
      fill: '#D81B60',
      width: 50,
      height: 50,
      strokeWidth: 2,
      stroke: "#880E4F",
      rx: 10,
      ry: 10,
      angle: 45,
      scaleX: 3,
      scaleY: 3,
      hasControls: true,
    });
    
    this.canvas.add(rect);
  }

}
