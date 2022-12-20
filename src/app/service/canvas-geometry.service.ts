import { Injectable } from '@angular/core';
import { PointI, PolyT } from '../interface/canvas.interface';

@Injectable({
  providedIn: 'root'
})
export class CanvasGeometryService {

  constructor() { }

  /** GEOMETRY ************************************/

  givePixelIndexFromPoint(point: PointI, width: number) : number{
    return (((point.y)*width)+point.x)*4 | 0;
  }

  givePixelIndexPlusPoint(point: PointI, plusPoint: PointI, width:number){
    //should have > w && > h && h < 0 && w < 0
    return (((point.y + plusPoint.y)*width)+(point.x+plusPoint.x))*4 | 0;
  }

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
