import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CoreService } from 'src/app/service/core.service';

@Component({
  selector: 'app-icons',
  templateUrl: './icons.component.html',
  styleUrls: ['./icons.component.scss']
})
export class IconsComponent implements OnInit {

  @Input()   selectedIcon: string = 'folder';
  @Output() onSelectIcon = new EventEmitter<any>();
  selectedCategory       : any = {icons: []};
  icons: any = {categories: []};

  constructor(public coreService: CoreService) { }

  ngOnInit(): void {
    this.coreService.getData('./assets/data/icons.json', { responseType: 'json' }).subscribe(
      (data)=>{
        this.icons = data;
      }
    );
  }

  selectIconCategory(iconCategory:any){
    this.selectedCategory = iconCategory;
  }

  selectIcon(icon:any){
    this.selectedIcon = icon.ligature;
    this.onSelectIcon.emit(icon.ligature);
  }


}
