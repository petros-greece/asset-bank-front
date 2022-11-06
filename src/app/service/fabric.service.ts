import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { fabric } from 'fabric';

@Injectable({
  providedIn: 'root'
})
export class FabricService {

  constructor() { }


  giveFabricCanvas(name: string, width: number, height: number) : Observable<any>{
    return new Observable((observer)=>{

      let canvas = new fabric.Canvas(name, {
        //controlsAboveOverlay: true,
        backgroundColor: 'rgba(0,0,0,0)',
        selection: false,
        //selectionColor: 'yellow',
        //selectionBorderColor: 'black',
        //selectionLineWidth: 5,
        isDrawingMode: false,
        preserveObjectStacking: true,
        freeDrawingCursor: 'pointer',
        width: width,
        height: height,
      });
      observer.next(canvas);

    });
  }

  addFromUrl(canvas:any){
   
    return new Observable((observer)=>{
      fabric.Image.fromURL('https://i.stack.imgur.com/KlKne.png', 
      (img)=>{
        console.log(fabric)
        // img.set({
        //   cropX: 70,
        //   cropY: 140,
        //   width: 200,
        //   height: 150,
        // });
        canvas.add(img);     
      });   
    });

 
    
  }

  // this.ctx = this.fabricCanvas.getContext('2d');



}
