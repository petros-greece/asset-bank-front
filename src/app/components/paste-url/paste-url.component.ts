import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { fabric } from 'fabric';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/service/api.service';
import { CoreService } from 'src/app/service/core.service';
import { FabricService } from 'src/app/service/fabric.service';

@Component({
  selector: 'app-paste-url',
  templateUrl: './paste-url.component.html',
  styleUrls: ['./paste-url.component.scss']
})
export class PasteUrlComponent implements OnInit {

  @Output() onAddFile = new EventEmitter<any>(); 
  link:any;
  fabricCanvas:any
  ctx:any;


  constructor(
    public apiService: ApiService,
    public coreService: CoreService,
    public fabricService: FabricService
    ) { }

  ngOnInit(): void {

    this.fabricService.giveFabricCanvas('fabricLinkCanvas', {width:0, height:0}).subscribe((canvas)=>{
      this.fabricCanvas = canvas;
      this.ctx = this.fabricCanvas.getContext('2d');
      //this.fabricCanvas.setDimensions({width:0, height:0});
    });

  }

  showImage(link: string){
    this.fabricService.showImage(link).subscribe((img:any)=>{
      this.fabricCanvas.setDimensions({width:img.width, height:img.height});
      this.fabricCanvas.add(img);   
    });
    
  }

  saveImage(){

    let dataurl = this.fabricCanvas.toDataURL();
    let file = this.coreService.dataURLtoFile(dataurl, 'test.png');
    this.apiService.uploadAsset('/asset', file).subscribe({
      next: (res: any) => {
        this.coreService.giveSnackbar(`Asset Uploaded!`);
        this.onAddFile.emit(res);
      },
      error: (err: any) => {
        console.log(err)
        this.coreService.giveSnackbar(err.message, {
          duration: 5000,
          verticalPosition: 'top'
        });        
      },
      complete: () => {
        //this.files.splice(i, 1);
      },
    });

  }






}
