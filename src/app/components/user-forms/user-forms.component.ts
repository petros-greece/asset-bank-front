import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { ApiService } from 'src/app/service/api.service';
import { CoreService } from 'src/app/service/core.service';

@Component({
  selector: 'app-user-forms',
  templateUrl: './user-forms.component.html',
  styleUrls: ['./user-forms.component.scss']
})
export class UserFormsComponent implements OnInit {

  @ViewChild('userLoginDialog', {static: true}) userLoginDialog: TemplateRef<any> | any;
  @ViewChild('userRegisterDialog', {static: true}) userRegisterDialog: TemplateRef<any> | any;

  user:any = {
    email: '',
    password: ''
  }

  constructor(
    public coreService: CoreService,
    public apiService: ApiService
    ) {
      console.log('user contructor');
    }

  ngOnInit(): void {
    if(!this.coreService.isProd){
      this.user = {
        email: 'petros@hotmail.com',
        password: '123456'
      }      
    }
    console.log('uner init');
  }

  openUserLoginDialog(){
    this.coreService.openDialog({
      headerText: `Enter Asset Bank`,
      template: this.userLoginDialog, 
    },
    {
      id: 'userLoginDialog'
    });
  }

  openUserRegisterDialog(){
    this.coreService.openDialog({
      headerText: `Enter Asset Bank`,
      template: this.userRegisterDialog, 
    },
    {
      id: 'userRegisterDialog'
    });
  }

  userLogin(){
    this.apiService.postData('/login', this.user).subscribe({
      next: (res: any) => {
        console.log(res);
        let user = {...res}.user;
            user.token = {...res}.token;
        this.coreService.updateStorageObj('asset_bank_user', user);
        location.reload();
        //this.apiService.user = user;
        //this.apiService.token = user.token.access_token;
      },
      error: (err: any) => {
        this.coreService.giveSnackbar(err?.error?.message, {
          duration: 5000,
          verticalPosition: 'top'
        });        
      },
      complete: () => {
        this.coreService.closeAllDialogs();
      },
    });
  
  }

  userRegister(){
    this.apiService.postData('/register', this.user).subscribe({
      next: (res: any) => {
        console.log(res);
        if(res.status === 'error'){
          this.coreService.giveSnackbar(res.message, {
            duration: 5000,
            verticalPosition: 'top'
          });
          return;   
        }
        this.coreService.closeAllDialogs();
        this.openUserLoginDialog();
     
        //this.apiService.user = user;
        //this.apiService.token = user.token.access_token;
      },
    });
  }

  userLogout(){
    this.apiService.logout();
  }

}
