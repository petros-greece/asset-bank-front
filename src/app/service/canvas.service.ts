import { AfterContentChecked } from '@angular/core';
import { Injectable,  Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Observable } from 'rxjs';
import { inherits } from 'util';

@Injectable({
  providedIn: 'root'
})
export class CanvasService {

  canvas:any;
  ctx:any;
  width:number = 0;
  height:number = 0;

  constructor(@Inject(DOCUMENT) private document: Document) {

  }

  init(canvas:any, ctx:any){
    this.canvas = canvas;
    this.ctx = ctx;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
  }

  clearCanvas(){
    this.ctx.clearRect(0,0,this.width,this.height)
  }


}
