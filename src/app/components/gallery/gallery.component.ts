import { Component, OnInit, ViewChild, TemplateRef, EventEmitter, Output, Input } from '@angular/core';
import { ApiService } from 'src/app/service/api.service';
import { CoreService } from 'src/app/service/core.service';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent implements OnInit {

  @Input() addAction = ''; 
  @Output() onAddSelected = new EventEmitter<any>();

  @ViewChild('comicDialog', {static: true}) comicDialog: TemplateRef<any> | any;  
  @ViewChild('editAssetDialog', {static: true}) editAssetDialog: TemplateRef<any> | any; 
  @ViewChild('miniTreeDialog', {static: true}) miniTreeDialog: TemplateRef<any> | any;

  assets:any[]  = [];
  total: number = 0;
  page: number = 0;
  pageSize: number = 10;
  pages:number[] = [];

  selectedFilePath: any;

  constructor(
    public coreService: CoreService,
    public apiService: ApiService) { }

  ngOnInit(): void {
    let selectedAssets = this.apiService.selectedCategory?.files;
    if(!selectedAssets || !selectedAssets.length){
      this.goToPage(0);
      //this.openComicDialog();
    }
    else{
      this.assets = selectedAssets.map((asset:any)=>{ return { src: asset } });
      this.total = selectedAssets.length;
      this.pages = [0];    
    }
    //console.log(selectedAssets);

    
  }

  goToPage(i:number){
    this.page = i;
    this.apiService.getAssets(this.pageSize, this.page*this.pageSize).subscribe({
      next: (resp:any) => {
        this.assets = resp.assets;
        this.total = resp.total;
        this.pages = Array.from(Array(Math.floor((this.total-1)/this.pageSize)).keys());
        //console.log(this.assets)
      },
      error: (e)=>{
        console.log(e);
        this.coreService.giveSnackbar('Login First!', {});
      }
    });
  }

  getTags(){}

  openComicDialog(){
    this.coreService.openDialog({
      headerText: `Comic`,
      template: this.comicDialog,
      cls: 'no-display'
    },{
      id: 'comicDialog'
    }); 
  }

  openEditAssetDialog(src: string){
    this.selectedFilePath = this.apiService.srcApiPath(src);
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
      category.files = (category.files).concat(assets);
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
        this.coreService.selectedAssets = [];
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

  addToSelectedCategory(){
    
    let assets = [...this.coreService.selectedAssets];
    if(this.apiService.selectedCategory.files){
      this.apiService.selectedCategory.files = (this.apiService.selectedCategory.files).concat(assets);
    }
    else{
      this.apiService.selectedCategory.files = assets;
    } 
    this.coreService.selectedAssets = [];
    this.coreService.closeAllDialogs();      
  }

  addToImage(){
    this.onAddSelected.emit();
  }

  selectAll(){
    let srcs = this.assets.map((a:any)=>{
      return a.src;
    });
    this.coreService.selectedAssets = (this.coreService.selectedAssets).concat(srcs);
    //coreService.selectedAssets.push(asset.src)
  }

}
