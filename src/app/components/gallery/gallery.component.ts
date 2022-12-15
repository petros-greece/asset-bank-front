import { Component, OnInit, ViewChild, TemplateRef, EventEmitter, Output, Input } from '@angular/core';
import { ApiService } from 'src/app/service/api.service';
import { CoreService } from 'src/app/service/core.service';
import {map, startWith} from 'rxjs/operators';
import {FormControl} from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent implements OnInit {

  @Input() addAction = ''; 
  @Input() specificForCat = false; 
  @Output() onAddSelected = new EventEmitter<any>();

  @ViewChild('comicDialog', {static: true}) comicDialog: TemplateRef<any> | any;  
  @ViewChild('imageEditorDialog', {static: true}) imageEditorDialog: TemplateRef<any> | any; 
  @ViewChild('miniTreeDialog', {static: true}) miniTreeDialog: TemplateRef<any> | any;

  assets:any[]  = [];
  total: number = 0;
  page: number = 0;
  pageSize: number = 10;
  pages:number[] = [];

  filteredTags: any;
  tagCtrl = new FormControl('');
  selectedTags:string[] = [];

  selectedFile: any = {};

  sortablejsOptions:any;

  constructor(
    public coreService: CoreService,
    public apiService: ApiService) {
     
    }

  ngOnInit(): void {
    if(!this.apiService.tags){
      this.apiService.getData(`/tagsForAccount/${this.apiService.user.id}`).subscribe((tags)=>{
        if(this.coreService.isProd){
          this.apiService.tags = Object.values(tags)
        }
        else{
          this.apiService.tags = tags;
        }

        this.filteredTags = this.tagCtrl.valueChanges.pipe(
          startWith(''),
          map(state => ( state ? this.filterTags(state) : this.apiService.tags.slice() )),
        );
      });
    }
    else{
      this.filteredTags = this.tagCtrl.valueChanges.pipe(
        startWith(''),
        map(state => ( state ? this.filterTags(state) : this.apiService.tags.slice() )),
      );      
    }
 
    let selectedAssets = this.apiService.selectedCategory?.files;
    if(!selectedAssets || !selectedAssets.length){
      this.goToPage(0);
      //this.openComicDialog();
    }
    else{
      this.assets = selectedAssets.map((asset:any)=>{ return { src: asset } });
      this.total = selectedAssets.length;
      this.pages = [0];
      this.sortablejsOptions = {
        onUpdate: (event: any) => {
            if(this.apiService.selectedCategory?.files){
              this.apiService.selectedCategory.files = this.assets.map((asset:any)=>{ return asset.src });
            }
          }
        };    
    }
    //console.log(selectedAssets);
    if(!this.coreService.isProd){
      this.openimageEditorDialog({src: 'U-1669365209.jpg'})
    }

    
    // U-1670679020
    
  }

  private filterTags(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.apiService.tags.filter((t:string) => t.toLowerCase().includes(filterValue));
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

  openimageEditorDialog(asset:any){
    this.selectedFile = asset;
    this.selectedFile.path = this.apiService.srcApiPath(asset.src);
    //console.log(category);
    this.coreService.openDialog({
      headerText: ``,
      template: this.imageEditorDialog,
      cls: 'no-display',
      showClose: false
    },{
      id: 'imageEditorDialog'
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

  getAssetsForTags(removed:boolean = false){

    if(!removed){
      this.selectedTags.push(this.tagCtrl.value);
      this.selectedTags = this.coreService.arrayUnique(this.selectedTags);
    }
    let tags = this.selectedTags.join(',');
    if(!this.selectedTags.length){
      this.goToPage(0); 
      return;
    }
    this.apiService.getData(`/assetsForTags/${this.apiService.user.id}/${tags}`).subscribe({
      next: (resp:any) => {
        this.assets = resp;
        this.tagCtrl.setValue('')
        //console.log(this.assets)
      },
      error: (e)=>{
        console.log(e);
        this.coreService.giveSnackbar('Login First!', {});
      }
    });
  }

}
