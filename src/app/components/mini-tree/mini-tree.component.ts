import { Component, OnInit, Output, EventEmitter} from '@angular/core';
import { ApiService } from 'src/app/service/api.service';

@Component({
  selector: 'app-mini-tree',
  templateUrl: './mini-tree.component.html',
  styleUrls: ['./mini-tree.component.scss']
})
export class MiniTreeComponent implements OnInit {

  @Output() onSelectCategory = new EventEmitter<any>();

  categories:any = [];
  constructor(public apiService: ApiService) { }

  ngOnInit(): void {
  }

  selectCategory(event:any, category:any){
    event.stopPropagation();
    this.onSelectCategory.emit(category);
  }

}
