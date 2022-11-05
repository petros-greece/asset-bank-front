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
  
  @ViewChild('previewDialog', {static: true}) previewDialog: TemplateRef<any> | any; 
  @ViewChild('dropZoneDialog', {static: true}) dropZoneDialog: TemplateRef<any> | any; 
  selectedFilePath: any = '';
  selectedCat: any;

  constructor(public coreService: CoreService, public apiService: ApiService){
    console.log('app contructor');
    console.log(this.apiService.token);
  }

  ngOnInit(): void {
    console.log('app init');
    this.apiService.getAsset('U-1667596642/jpg').subscribe((asset)=>{
      this.toBase64(asset).subscribe(base64 => this.selectedFilePath = base64 )
    
      this.coreService.openDialog({
        headerText: `Preview Image`,
        template: this.previewDialog, 
      },
      {
        id: 'previewCanvasDialog'
      });     
    })
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


  toBase64(e:any){
    return new Observable((observer) => {
      setTimeout(()=>{
        const reader = new FileReader();
        reader.readAsDataURL(e);
        reader.onload = () => {
          this.selectedFilePath = reader.result;
          observer.next(reader.result)
        };
      }, 0);
    });
  }

  onSelectFile(e:any){
    this.selectedFilePath = false;
    this.toBase64(e).subscribe(base64 => this.selectedFilePath = base64 )
    
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
      if(this.selectedCat.files && this.selectedCat.files.length){
        console.log(1);
 
        this.selectedCat.files.push(src);
      }
      else{
        console.log(2);
        this.selectedCat.files = [src];
      }
      console.log(this.selectedCat)

  }

  onOpenDropZone(cat:any){
    this.selectedCat = cat;
    console.log(this.selectedCat)
    this.coreService.openDialog({
      headerText: `Add Images to ${cat.title}`,
      template: this.dropZoneDialog
    });
  }



}
