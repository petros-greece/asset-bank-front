import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-pallet-picker',
  templateUrl: './pallet-picker.component.html',
  styleUrls: ['./pallet-picker.component.scss']
})
export class PalletPickerComponent implements OnInit {

  @Input()   addColors:string[] = [];
  @Output() onColorSelect = new EventEmitter<any>();


  colors:any = [
    {c: 'rgb(244,67,54)', s: 0},
    {c: 'rgb(233,30,99)', s: 0},
    {c: 'rgb(156,39,176)', s: 0},
    {c: 'rgb(103,58,183)', s: 0},
    {c: 'rgb(63,81,181)', s: 0},
    {c: 'rgb(33,150,243)', s: 0},
    {c: 'rgb(3,169,244)', s: 0},
    {c: 'rgb(0,188,212)', s: 0},
    {c: 'rgb(0,150,136)', s: 0},
    {c: 'rgb(76,175,80)', s: 0},
    {c: 'rgb(139,195,74)', s: 0},
    {c: 'rgb(205,220,57)', s: 0},
    {c: 'rgb(255,235,59)', s: 0},
    {c: 'rgb(255,193,7)', s: 0},
    {c: 'rgb(255,152,0)', s: 0},
    {c: 'rgb(255,87,34)', s: 0},
    {c: 'rgb(121,85,72)', s: 0},
    {c: 'rgb(158,158,158)', s: 0},
    {c: 'rgb(96,125,139)', s: 0},
  ];


  constructor() { }

  ngOnInit(): void {
  }

  colorSelect(color:any){
    color.s = !color.s;
    let cols = this.colors.map((col:any)=>{
      if( col.s ){ return col.c; }
    }).filter((c:any)=>{return c;});
    this.onColorSelect.emit(cols);
  }

}

