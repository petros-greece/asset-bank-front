import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { SvgIconsT, SvgT } from 'src/app/interface/canvas.interface';

import { CoreService } from 'src/app/service/core.service';
import { FabricService } from 'src/app/service/fabric.service';

@Component({
  selector: 'app-svg-icons-menu',
  templateUrl: './svg-icons-menu.component.html',
  styleUrls: ['./svg-icons-menu.component.scss']
})
export class SvgIconsMenuComponent implements OnInit {

  @Input() stroke:string = '#000';
  @Input() fill  :string = 'red';
  @Input() type  :SvgIconsT = 'monochrome';   
  @Output() onEmitSvg = new EventEmitter<SvgT>();
 
  svgFiles:any = [];

  svg:any = {
    monochrome: [
      { name: 'textbox', },
      { name: 'christmas', },  
      { name: 'superheroes' },
      { name: 'animals' },
      { name: 'face-emotions' },
      { name: 'instruments' }
    ],
    polychrome: [
      { name: 'lips' }    
    ]
  }

  svgIcons: any;

  constructor(
    public coreService: CoreService,
    public fabricService: FabricService,
    public sanitizer: DomSanitizer
    ) {
      if(this.type !== 'all'){
        this.svgFiles = this.svg[this.type];
      }
      else if(this.type === 'all'){
        for(let prop in this.svg){
          this.svgFiles = this.svgFiles.concat(this.svg[prop]);
        }
      }     
    }

  ngOnInit(): void {
  }

  getSvgFile(fname: string){
    this.coreService.getData(`./assets/json/svg-${fname}.json`).subscribe((data)=>{
      this.svgIcons = data;
    });
  }

  emitSVGIcon(svg:SvgT){
    //this.fabricCanvas.clear();
    this.onEmitSvg.emit(svg);
  }

}
