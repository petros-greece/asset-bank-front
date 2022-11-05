import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-picker-menu',
  templateUrl: './picker-menu.component.html',
  styleUrls: ['./picker-menu.component.scss']
})
export class PickerMenuComponent implements OnInit {
  
  @Input()   label: string = ''; 
  @Input()   icon: string = ''; 
  @Input()   color: string = 'red';
  @Output() onPickColor = new EventEmitter<any>();

  constructor() { }

  ngOnInit(): void {
  }

  onColorChange(e: string){
    this.color = e;
    this.onPickColor.emit({ event: Event, color:e });
  }

}
