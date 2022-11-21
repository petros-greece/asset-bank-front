import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ApiService } from 'src/app/service/api.service';
import { CoreService } from 'src/app/service/core.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dropzone',
  templateUrl: './app-dropzone.component.html',
  styleUrls: ['./app-dropzone.component.scss']
})
export class AppDropzoneComponent implements OnInit {

  @Input()   multipleDrop: boolean = true;
  @Input()   maxFiles: number = 10;
  @Input()   verb: string = 'Click or drop your image(s)'; 
  @Input()   previeHeader: string = 'Select';
  @Output() onSelectFile = new EventEmitter<any>();

  constructor(
    private coreService: CoreService,
    public apiService: ApiService
  ) { }

  ngOnInit(): void {}

  files: File[] = [];

  onDrop(event:any){
    if(this.maxFiles <= this.files.length){ return; }
    this.files.push(...event.addedFiles); 
  }
  
  onRemove(event:any) {
    this.files.splice(this.files.indexOf(event), 1);
  }

  onSelect(event:any){
    console.log('onSelect:', event)
    this.onSelectFile.emit(event);
  }

  onAdd(event:any, i: number){
    console.log('onAdd:', event);

    this.apiService.uploadAsset('/asset', this.files[i]).subscribe({
      next: (res: any) => {
        let src = (res.data).split('/').pop();
        if(this.apiService.selectedCategory.files && this.apiService.selectedCategory.files.length){
          this.apiService.selectedCategory.files.push(src);
        }
        else{
          this.apiService.selectedCategory.files = [src];
        }
      },
      error: (err: any) => {
        console.log(err)
        this.coreService.giveSnackbar(err.message, {
          duration: 5000,
          verticalPosition: 'top'
        });        
      },
      complete: () => {
        this.files.splice(i, 1);
        this.coreService.giveSnackbar(`Asset Uploaded!`);
      },
    });
  

   // return;
       

  }

}
