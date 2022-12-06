import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './service/api.service';
import { CoreService } from './service/core.service';
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from '@angular/platform-browser';
import { Console } from 'console';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  

  constructor(
    public coreService: CoreService, 
    public apiService: ApiService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    ){
    
    console.log('App constructor', this.apiService.token);
    this.matIconRegistry.addSvgIcon( "lasso", this.domSanitizer.bypassSecurityTrustResourceUrl("./assets/icons/laso.svg") );

  }

  ngOnInit(): void {
    console.log('app init');
    this.apiService.checkAccessToken();
  }



}
