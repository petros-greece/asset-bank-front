import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './service/api.service';
import { CoreService } from './service/core.service';
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from '@angular/platform-browser';

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
    private domSanitizer: DomSanitizer
    ){
    console.log(this.apiService.token);

    this.matIconRegistry.addSvgIcon(
      "lasso",
      this.domSanitizer.bypassSecurityTrustResourceUrl("./assets/icons/laso.svg")
    );

  }

  ngOnInit(): void {
    console.log('app init');
    this.apiService.checkAccessToken();
    
  }



}
