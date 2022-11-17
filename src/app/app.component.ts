import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './service/api.service';
import { CoreService } from './service/core.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  

  constructor(public coreService: CoreService, public apiService: ApiService){
    console.log(this.apiService.token);
  }

  ngOnInit(): void {
    console.log('app init');
    this.apiService.checkAccessToken();
    
    // this.apiService.getAsset('U-1667596642/jpg').subscribe((asset)=>{
    //   this.toBase64(asset).subscribe(base64 => this.selectedFilePath = base64 )
    
    //   this.coreService.openDialog({
    //     headerText: `Preview Image`,
    //     template: this.previewDialog, 
    //     cls: 'no-display'
    //   },
    //   {
    //     id: 'previewCanvasDialog'
    //   }); 
        
    // })

  
    // //if(!this.coreService.getStorageObj('stldImagesTree')){
    //   this.selectedFilePath = false;
    //   let path = 'http://localhost/asset-bank/asset-bank-api/public/api/assets/1/U-1667596642/jpg';
    //   this.selectedFilePath = false;
    //   this.toBase64(path).subscribe(base64 => this.selectedFilePath = base64 )
      
    //   setTimeout(()=>{

    //     this.coreService.openDialog({
    //         headerText: `Preview Image`,
    //         template: this.previewDialog, 
    //       },
    //       {
    //         id: 'previewCanvasDialog'
    //       });  
    //     }, 2300);
      
    // //}
  }



}
