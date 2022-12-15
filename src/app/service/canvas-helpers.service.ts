import { Injectable,  Inject } from '@angular/core';
import { PointI, ColorI, CanvasInfoI, PolyT } from '../interface/canvas.interface';

@Injectable({
  providedIn: 'root'
})
export class CanvasHelpersService {


  cartoonColors:any = [ 'rgb(244,67,54)', 'rgb(233,30,99)', 'rgb(156,39,176)', 'rgb(103,58,183)', 'rgb(63,81,181)', 'rgb(33,150,243)', 'rgb(3,169,244)', 'rgb(0,188,212)', 'rgb(0,150,136)', 'rgb(76,175,80)', 'rgb(139,195,74)', 'rgb(205,220,57)', 'rgb(255,235,59)', 'rgb(255,193,7)', 'rgb(255,152,0)', 'rgb(255,87,34)', 'rgb(121,85,72)', 'rgb(158,158,158)', 'rgb(96,125,139)', ];

  constructor() {

  }

  /** COLORS ************************************/

  giveDefaultCartoonColors(){
    return JSON.parse(JSON.stringify(this.cartoonColors));
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

  getAverageRGB(imageData:any, blockSize = 5) : ColorI{
    let rgb = {r:0,g:0,b:0};
    let count = 0;
    let i = -4;
    let len = imageData.data.length;
    while ( (i += blockSize * 4) < len ) {
        ++count;
        rgb.r += imageData.data[i];
        rgb.g += imageData.data[i+1];
        rgb.b += imageData.data[i+2];
    }

    // ~~ used to floor values
    rgb.r = ~~(rgb.r/count);
    rgb.g = ~~(rgb.g/count);
    rgb.b = ~~(rgb.b/count);

    return rgb;
  }

  getColorsObj(imageData:any, blockSize = 5, howMany = 20) : {colors: [string, number][], colorCount: number}{
    let colorsObj:any = {};
    let i = -4;
    let len = imageData.data.length;
    while ( (i += blockSize * 4) < len ) {
        let str = `${imageData.data[i]},${imageData.data[i+1]},${imageData.data[i+2]}`;
        if(!colorsObj[str]){
          colorsObj[str] = 1;
        }
        else{
          colorsObj[str]+=1;
        }
    }

      let sortable: [string, number][] = [];
      for (var prop in colorsObj) {
          sortable.push([prop, colorsObj[prop]]);
      }
      
      sortable.sort(function(a, b) {
          return b[1] - a[1];
      });
    let colorCount = sortable.length;
    sortable.length = howMany;
    return {
      colors: sortable.filter((elem:[string, number])=>{return elem;}),
      colorCount: colorCount
    } 
  }

  findRGBRange(rgbArray:number[], blockSize = 5 ) : {min: ColorI, max: ColorI}{
    console.log(rgbArray)
    const min = [255,255,255,255];
    const max = [0,0,0,-1];
    const len = rgbArray.length/4;
    let inc = blockSize*4;
    let rgbEl, r, g,b,a;
    for(let j = 0; j < len; j+=inc){
      r = rgbArray[j];
      g = rgbArray[j+1];
      b = rgbArray[j+2];
      a = rgbArray[j+3];

      if(r < min[0]){ min[0] = r; }
      if(g < min[1]){ min[1] = g; }
      if(b < min[2]){ min[2] = b; }
      if(b < min[3]){ min[3] = a; }

      if(r > max[0]){ max[0] = r; }
      if(g > max[1]){ max[1] = g; }
      if(b > max[2]){ max[2] = b; }
      if(b > max[3]){ max[3] = a; }

    }
    return {
      min: {r: min[0], g: min[1], b: min[2], a: min[3] },
      max: {r: max[0], g: max[1], b: max[2], a: max[3] }
    };



  }

  giveRandomColorStr(alpha:boolean = true) : string{
    let r = Math.floor(Math.random()*255);
    let g = Math.floor(Math.random()*255);
    let b = Math.floor(Math.random()*255);
    let a = Math.random();
    return alpha ? `rgba(${r},${g},${b}, ${a})` : `rgb(${r},${g},${b})`;
  }

  getColorsInfo(imageData:any, blockSize = 5, howMany = 20) : CanvasInfoI{
    let averageRgb:ColorI = this.getAverageRGB(imageData, blockSize);
    let colorsObj = this.getColorsObj(imageData, blockSize, howMany);
    let colorRange = this.findRGBRange(imageData.data, blockSize);
    return Object.assign(colorsObj, {averageRgb: averageRgb, colorRange: colorRange});
  }



  /** GEOMETRY ************************************/

  givePolygonPoints(radius:number, numberOfPoints:number) : PointI[] {

    /* step used to place each point at equal distances */
    const angleStep = (Math.PI * 2) / numberOfPoints
  
    const points = []
  
    for (let i = 1; i <= numberOfPoints; i++) {
      /* x & y coordinates of the current point */
      const x = (Math.cos(i * angleStep) * radius)
      const y = (Math.sin(i * angleStep) * radius)
  
      /* push the point to the points array */
      points.push({ x:x, y:y })
    }
    
    return points;
  }

  inPolygon(point:PointI, vs:[number, number][]) {

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

  getNextPointsSequence(points: PolyT, width: number, height: number, xIncr: number, yIncr: number) :
  {poly: PolyT, minPoint: PointI, maxPoint: PointI}{
    let xx = points.map((point:[number, number])=>{ return Math.round(point[0]) + xIncr });
    let yy = points.map((point:[number, number])=>{ return Math.round(point[1]) });
    
    let minPoint = { x: Math.min(...xx), y: Math.min(...yy) };  
    let maxPoint = { x: Math.max(...xx), y: Math.max(...yy) };

    if(maxPoint.x > (width + xIncr) && maxPoint.y > height){ return { poly: [], minPoint: minPoint, maxPoint:maxPoint }; }
    if( maxPoint.x > (width + xIncr) ){ 
      xx = points.map((point:[number, number])=>{ return Math.round(point[0]) - width });
      yy = points.map((point:[number, number])=>{ return Math.round(point[1]) + yIncr });
      minPoint = { x: Math.min(...xx), y: Math.min(...yy) };  
      maxPoint = { x: Math.max(...xx), y: Math.max(...yy) };
    }


    let len = xx.length;
    let nextPath:PolyT = [];
    for(let i = 0; i < len; i+=1){
      nextPath.push( [ xx[i], yy[i] ] );
    }
    //console.log(nextPath)
    return { poly: nextPath, minPoint: minPoint, maxPoint:maxPoint };

  }

  drawFromPath( ctx:any, path: PolyT, color:string){
    if(!path[0]){ return }
   // ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(path[0][0], path[0][1]);
    path.forEach((point:[number,number])=>{
      ctx.lineTo(point[0], point[1]);
    });
    ctx.fill();
    //ctx.restore();
  }

  giveRandomPoly(points:number, width: number, height: number) : {startP:PointI, endP: PointI, poly: PolyT}{
    let poly: PolyT = [];
    let x, y;
    let xx:any = [], yy:any = [];

    for(let i =0; i < points; i+=1){
      x = Math.floor(Math.random()*width);
      y = Math.floor(Math.random()*height);
      xx.push(x);
      yy.push(y);
      poly.push([x,y]);
    }

    return {
      poly:poly,
      startP: { x: Math.min(...xx), y: Math.min(...yy) },
      endP: { x: Math.max(...xx), y: Math.max(...yy) }
    };

  }

  giveRandomRectPoints(width: number, height: number) : [PointI, PointI]{
    let p1 = {
      x: Math.floor(Math.random()*Math.round(width/2)),
      y: Math.floor(Math.random()*Math.round(height/2)),     
    }
    let p2 = {
      x: Math.round(width/2) + Math.ceil(Math.random()*Math.round(width/2)),
      y: Math.round(height/2) + Math.ceil(Math.random()*Math.round(height/2)),     
    }
    return [p1, p2]    
  }



  

}
