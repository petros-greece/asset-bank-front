import { Component, OnInit, ViewChild, TemplateRef, EventEmitter, Output, Input } from '@angular/core';
import { ApiService } from 'src/app/service/api.service';
import { CoreService } from 'src/app/service/core.service';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent implements OnInit {

  @Input() hasClbk = false; 
  @Output() onAddSelected = new EventEmitter<any>();
  @ViewChild('comicDialog', {static: true}) comicDialog: TemplateRef<any> | any;  
  @ViewChild('editAssetDialog', {static: true}) editAssetDialog: TemplateRef<any> | any; 
  @ViewChild('miniTreeDialog', {static: true}) miniTreeDialog: TemplateRef<any> | any;

  assets:any[]  = [];
  total: number = 0;
  page: number = 1;
  pageSize: number = 10;
  pages:number[] = [];

  selectedFilePath: any;

  constructor(
    public coreService: CoreService,
    public apiService: ApiService) { }

  ngOnInit(): void {
    //setTimeout(()=>{
    this.goToPage(1);
    console.log('gallery inited');
    //}, 1000)
  }

  goToPage(i:number){
    this.page = i;
    this.apiService.getAssets(this.pageSize, this.page*this.pageSize).subscribe({
      next: (resp:any) => {
        this.assets = resp.assets;
        this.total = resp.total;
        this.pages = Array.from(Array(Math.floor((this.total-1)/this.pageSize)).keys());
      },
      error: (e)=>{
        console.log(e);
        this.coreService.giveSnackbar('Login First!', {});
      }
    });
  }

  getTags(){}

  openComicDialog(){
    if(this.hasClbk){
      this.onAddSelected.emit();
      return;
    }
    this.coreService.openDialog({
      headerText: `Comic`,
      template: this.comicDialog,
    },{
      id: 'comicDialog'
    }); 
  }

  openEditAssetDialog(file: any){
    this.selectedFilePath = this.apiService.srcApiPath(file);
    //console.log(category);
    this.coreService.openDialog({
      headerText: ``,
      template: this.editAssetDialog,
      cls: 'no-display'
    },{
      id: 'previewCanvasDialog'
    }); 
  }

  openMiniTreeDialog(){

    if(this.hasClbk){
      this.onAddSelected.emit();
      return;
    }


    this.coreService.openDialog({
      headerText: `Select Category`,
      template: this.miniTreeDialog,
    },{
      id: 'miniTreeDialog'
    }); 
  }

  onSelectCategory(category: any){
    let assets = [...this.coreService.selectedAssets];
    if(category.files){
      (category.files).concat(assets);
    }
    else{
      category.files = assets;
    }

    this.apiService.postAuthData('/tree', {
      categories: this.apiService.categories,
    }).subscribe({
      next: (res: any) => {
        this.coreService.giveSnackbar(`New tree version created`);
      },
      error: (err: any) => {
        console.log(err)
        this.coreService.giveSnackbar(err?.message, {
          duration: 5000,
          verticalPosition: 'top'
        });        
      },
      complete: () => {
        this.coreService.selectedAssets = [];
        this.coreService.closeAllDialogs();
        //location.reload();
      },

    });

  }

}
