import { Component, OnInit, Input, Output, EventEmitter, ViewChild, TemplateRef} from '@angular/core';
import { CoreService } from 'src/app/service/core.service';
import { saveAs } from 'file-saver';
import { ApiService } from 'src/app/service/api.service';
import {MatAccordion} from '@angular/material/expansion';
import { ApiPathPipe } from 'src/app/pipe/asset-bank-pipes.pipe';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';

export interface CategoryI{
  childsNum: number;
  title: string;
  icon: string;
  files?:string[];
  childs: any[];
}

@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss']
})
export class TreeComponent implements OnInit {
  
  @ViewChild(MatAccordion) accordion: MatAccordion | any;
  @ViewChild('previewDialog', {static: true}) previewDialog: TemplateRef<any> | any; 
  @ViewChild('previewAssetsDialog', {static: true}) previewAssetsDialog: TemplateRef<any> | any;
  @ViewChild('editAssetDialog', {static: true}) editAssetDialog: TemplateRef<any> | any; 
  @ViewChild('galleryDialog', {static: true}) galleryDialog: TemplateRef<any> | any;
  @ViewChild('dropZoneDialog', {static: true}) dropZoneDialog: TemplateRef<any> | any;

  treeVersions: any;
  openAll: boolean = false;
  edit = false;

  newCategory:CategoryI = {
    childsNum: 0,
    title: 'images',
    icon: 'folder',
    childs: [],
    files: []
  };

  categories:CategoryI[] = [
    {
      childsNum: 0,
      title: 'images',
      icon: 'folder',
      childs: [],
      files: []
    }
  ];

  selectedCategory: any;
  selectedFileIndex: number = -1;
  selectedFilePath: any;
  
  constructor(
    public apiService: ApiService,
    public coreService: CoreService
    ) {
  }

  ngOnInit(): void {  
    this.apiService.getData(`/tree/${this.apiService.user.id}`).subscribe((res)=>{
      this.categories = JSON.parse(res.categories);
      //console.log(this.categories);
    }); 
  }

  drop(e:any, categories: any){
    console.log(e, categories);
    moveItemInArray(categories.cats, e.previousIndex, e.currentIndex);
  }


  toggleTree(){
    if(this.openAll){ this.accordion.closeAll(); }
    else{ this.accordion.openAll(); }
    this.openAll = !this.openAll;
  }

  initNewCategory(){
    this.newCategory = {
      childsNum: 0,
      title: 'images',
      icon: 'folder',
      childs: []
    };
  }

  addChildToCategory(category:CategoryI){
    console.log(category)
    category.childsNum+=1;
    setTimeout(()=>{
      category.childs.push( JSON.parse(JSON.stringify(this.newCategory)) );
    }, 10);
  }

  addNewCategory(){
    this.categories.push(JSON.parse(JSON.stringify(this.newCategory)));
  }

  downloadConfig(){
    let tree = this.coreService.getStorageObj('stldImagesTree');
    let json = JSON.stringify(tree);
    let blob = new Blob([json], {type: "text/plain;charset=utf-8"});
    saveAs(blob, `import-errors.json`);
  }
  
  removeCategory(catParent:any, i: number){
    //cats.files = [];
    if(!catParent.childs){
      this.categories.splice(i, 1);
      return;
    }
    catParent.childs.splice(i, 1);
    catParent.childsNum-=1;
  }

  /** */

  saveTree(){
    this.apiService.postAuthData('/tree', {
      categories: this.categories,
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
        //this.coreService.closeAllDialogs();
        //location.reload();
      },

    });
    //this.coreService.updateStorageObj('stldImagesTree', {categories: this.categories});
  } 

  getTreeVersions(){
    this.apiService.getAuthData(`/tree-versions/${this.apiService.user.id}`).subscribe(
      {
        next: (res: any) => {
          res.length = 50;
          this.treeVersions = res.filter( (e:any) => {return e});
        },
        error: (err: any) => {
          this.coreService.giveSnackbar(err?.message, {
            duration: 5000,
            verticalPosition: 'top'
          });        
        },
        complete: () => {
          //this.coreService.closeAllDialogs();
        },
      }
    )
  }

  renderTreeVersion(id:string){
    this.apiService.getAuthData(`/tree-by-id/${this.apiService.user.id}/${id}`).subscribe(
      {
        next: (res: any) => {
          this.categories = JSON.parse(res.categories);
        },
        error: (err: any) => {
          this.coreService.giveSnackbar(err?.message, {
            duration: 5000,
            verticalPosition: 'top'
          });        
        },
        complete: () => {
          //this.coreService.closeAllDialogs();
        },
      }
    )
  }

  /** */

  openDropZone(category:CategoryI){
    this.selectedCategory = category;
    this.coreService.openDialog({
      headerText: `Add Images to ${category.title}`,
      template: this.dropZoneDialog
    });
  }

  previewAssets(category:CategoryI, e: Event){
    if(!category?.files?.length){
      this.openDropZone(category);
      return;
    }
    e.stopPropagation();
    this.selectedCategory = category;
    //console.log(category);
    this.coreService.openDialog({
      headerText: `Assets For ${category.title}`,
      template: this.previewAssetsDialog
    }); 
  }

  openEditAssetDialog(file: any, i:number){
    this.selectedFileIndex = i;
    this.selectedFilePath = this.apiService.srcApiPath(file);
    //console.log(category);
    this.coreService.openDialog({
      headerText: `Category ${this.selectedCategory.title}`,
      template: this.editAssetDialog,
      cls: 'no-display'
    },{
      id: 'previewCanvasDialog'
    }); 
  }

  /** */

  openGalleryDialog(){
    this.coreService.openDialog({
      headerText: `Gallery`,
      template: this.galleryDialog,
    },{
      id: 'galleryDialog'
    }); 
  }

  onSelectFile(e:any){
    this.selectedFilePath = false;
    this.coreService.toBase64(e).subscribe(base64 => this.selectedFilePath = base64 ) 
    this.coreService.openDialog({
      headerText: `Preview Image`,
      template: this.previewDialog, 
    },
    {
      id: 'previewCanvasDialog'
    });
  }

  onAddFile(e:any){
      let src = (e.data).split('/').pop();
      if(this.selectedCategory.files && this.selectedCategory.files.length){

        this.selectedCategory.files.push(src);
      }
      else{
        this.selectedCategory.files = [src];
      }
  }


}





