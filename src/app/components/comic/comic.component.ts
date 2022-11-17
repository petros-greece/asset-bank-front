import { Component, OnInit, Input, Output, EventEmitter, AfterViewInit} from '@angular/core';
import { Observable } from 'rxjs';
import { CoreService } from 'src/app/service/core.service';
import { saveAs } from 'file-saver';
import { ApiService } from 'src/app/service/api.service';
import { FabricService } from 'src/app/service/fabric.service';
import { fabric } from 'fabric';

@Component({
  selector: 'app-comic',
  templateUrl: './comic.component.html',
  styleUrls: ['./comic.component.scss']
})
export class ComicComponent implements OnInit {

  canvas:any;
  dummyCanvas:any;
  ctx:any;
  width:number = 0;
  height:number = 0;
  images: any;
  imageData:any;
  selectedPaths:any = [];
 // [ "U-1667742810.png", "U-1667742742.png", "U-1667742696.png" ]
 //'http://localhost/asset-bank-api/public/api/asset/1/U-1667596642/jpg'
  constructor(
    public apiService: ApiService, 
    public fabricService: FabricService,
    public coreService: CoreService 
  ) {

  }



  ngOnInit(): void {

    this.selectedPaths = ([...this.coreService.selectedAssets]).map((link)=>{
      return this.apiService.srcApiPath(link);
    });

    let box:any = document.getElementById('comic-canvas-container');
    this.width = box.offsetWidth - 15;
    this.height = Math.round(this.width * 1.5);

    this.fabricService.giveFabricCanvas('my-comic-canvas', 
    { width: this.width, height: this.height, selection: true }).subscribe((canvas)=>{
      this.canvas = canvas;
      this.ctx = this.canvas.getContext('2d');

      this.fabricService.showImagesFromService(this.selectedPaths).subscribe((images)=>{
        this.images = images;
        console.log(images);
        images.forEach((img:any) => {
          this.canvas.add(img);
        });
        this.canvas.renderAll();
        this.canvas.preserveObjectStacking = false;
        this.coreService.selectedAssets = [];
      });
 
    }); 
    
   



  }

  renderComic(){
    
  }


}
