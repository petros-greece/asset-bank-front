import { Component, OnInit, Input, Output, EventEmitter, ViewChild, TemplateRef, AfterContentInit} from '@angular/core';
import { Observable } from 'rxjs';
import { CoreService } from 'src/app/service/core.service';
import { saveAs } from 'file-saver';
import { ApiService } from 'src/app/service/api.service';
import { FabricService } from 'src/app/service/fabric.service';
import { fabric } from 'fabric';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-comic',
  templateUrl: './comic.component.html',
  styleUrls: ['./comic.component.scss']
})
export class ComicComponent implements OnInit {

  @ViewChild('miniTreeDialog', {static: true}) miniTreeDialog: TemplateRef<any> | any;

  canvas:any;
  dummyCanvas:any;
  ctx:any;
  width:number = 0;
  height:number = 0;
  images: any;
  imageData:any;
  selectedPaths:any = [];

  canvasScale = 1;
  imgScale = .25;
  padding = 20;
  outerPadding = 10;
  background = 'rgba(255,255,255,1)';
  selectedObjId:string = '';

  sortablejsOptions:any;

  constructor(
    public apiService: ApiService, 
    public fabricService: FabricService,
    public coreService: CoreService 
  ) {

  }

  ngOnInit(): void {

    let paths = [...this.coreService.selectedAssets];
    //let paths = ["U-1667743873.png","U-1667743906.png","U-1667895239.png","U-1668294752.jpg","U-1668723362.png","U-1668767466.png","U-1668880588.png","U-1668771012.png","U-1668881693.png","U-1668939699.jpg","U-1668939714.jpg","U-1668939699.jpg","U-1668880588.png"]

    this.selectedPaths = paths.map((link)=>{
      return this.apiService.srcApiPath(link);
    });
    
    let box:any = document.getElementById('comic-canvas-container');
    this.width = box.offsetWidth - 45;
    this.height = Math.round(this.width * 1.5);

    this.renderComicCanvas();
    this.sortablejsOptions = {
      onUpdate: (e: any) => {
        //console.log(e.oldIndex, e.newIndex)
        this.renderImages();
      }
    };

  }

  renderComicCanvas(){
    if(this.canvas){
      this.canvas.clear();
    }
    this.fabricService.giveFabricCanvas('my-comic-canvas', 
    { width: this.width, height: this.height, selection: true }).subscribe((canvas)=>{
      this.canvas = canvas;
      this.canvas.clear();
      this.ctx = this.canvas.getContext('2d');

      this.canvas.on('selection:created', (obj:any) => {
        this.selectedObjId = obj.selected[0].id;
      });

      this.canvas.on('selection:updated', (obj:any) => {
        this.selectedObjId = obj.selected[0].id;
      });


      this.fabricService.showImagesFromService(this.selectedPaths).subscribe({
        next: (images)=>{
          this.images = images;
          this.renderImages();          
        },
        error: (err: any) => {
          console.log(err)      
        },
        complete: () => {

        },

      });
    });     
  }

  transform1(coords: any, img: any){
    let imgRight = coords.x + (img.width*this.imgScale) + this.outerPadding;

    //if is not the first in the row and will exceed the limits
    if( coords.x && (imgRight > this.width) ){
      coords.x = this.outerPadding;
      coords.y+= coords.maxH + this.padding;
      coords.maxH = 0;
    }
    
    if(img.height*this.imgScale >= coords.maxH){
      coords.maxH = img.height*this.imgScale;
    }

    img.set({
      scaleX: this.imgScale,
      scaleY: this.imgScale,
      left: coords.x,
      top: coords.y
    });
    // img.left = coords.x;
    // img.top  = coords.y;

    this.canvas.add(img);
  
    coords.x+= img.width*this.imgScale + this.padding;
 
  }

  renderImages(){
    this.canvas.clear();
    this.canvas.backgroundColor = this.background;
    this.canvas.setHeight(this.height);

    let coords = {x:this.outerPadding, y: this.outerPadding, maxH: 0};
    this.images.forEach((img:any) => {
      this.transform1(coords, img);
    });

    this.canvas.preserveObjectStacking = false;
    this.canvas.selectable = true;
    this.canvas.renderAll();
    this.coreService.selectedAssets = [];
    //console.log(this.images);   
  }

  shuffleImages(){
    this.selectedObjId = '';
    this.images = this.coreService.shuffle(this.images);
    this.renderImages();
  }

  setActiveObject(i:number){

    let obj = this.canvas._objects[i];
    this.canvas.setActiveObject(obj);
    this.canvas.renderAll();
  }


  downloadImage(type: string){
    this.canvas.getElement().toBlob((blob:any)=>{
      saveAs(blob, `siteland-asset-bank.${type}`);
    })
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
    
    const dataURL = this.canvas.toDataURL();
    let file = this.coreService.dataURLtoFile(dataURL, 'test.png');

    this.apiService.uploadAsset('/asset', file).subscribe({
      next: (res: any) => {  
        //console.log(res);return;    
        if(category.files){
          (category.files).unshift(res.data);
        }
        else{
          category.files = res.data;
        }
        console.log(category);
      },
      error: (err: any) => {
        console.log(err)
        this.coreService.giveSnackbar(err.message, {
          duration: 5000,
          verticalPosition: 'top'
        });        
      },
      complete: () => {
        this.coreService.giveSnackbar(`Asset added to ${category.title}`);
        this.coreService.closeDialogById('miniTreeDialog');
        this.saveTree();
      },
    });

  }


  saveTree(){
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
        //this.coreService.closeAllDialogs();
        //location.reload();
      },

    });
  }







  pixelate(){


    this.canvas.renderAll();
    return;
    this.canvas.clear();
    this.images.forEach((img:any) => {
      img.clone((cloned:any)=>{
        this.fabricService.pixelate(cloned);
        this.canvas.add(cloned);
      });
      
    });
    this.canvas.renderAll();
    //this.renderImages();
  }

}
