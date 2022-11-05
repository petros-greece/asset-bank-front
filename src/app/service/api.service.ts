import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, ErrorObserver, pipe, catchError, throwError } from 'rxjs';
import { CoreService } from './core.service';


@Injectable({
	providedIn: 'root'
})
 
export class ApiService {
		
  apiUrl = 'http://localhost/asset-bank/asset-bank-api/public/api';
  imgPath = 'http://localhost/asset-bank/asset-bank-api/public/api/assets/';
  token:string = '';
  user:any;

	constructor(
    public http: HttpClient,
    public coreService: CoreService
    ){
      console.log('service contructor');
      this.getAccessToken(); 
    }
 
  getAccessToken(){
    this.user = this.coreService.getStorageObj('asset_bank_user');
    this.token = this.user ? this.user.token.access_token : '';
    this.imgPath += this.user.id + '/';
    
  }

  getData(uri:string, params:any = {}):Observable<any>{
    return this.http.get((this.apiUrl+uri), {
      responseType: 'json'
    }).pipe(catchError(
      err=>{
        throw err;
      }
    ));
  }
  
  postData(uri:string, data: any = {}):Observable<any>{
    return this.http.post((this.apiUrl+uri), data).pipe(catchError(
      err=>{
        throw err;
      }
    ));
  }

  postAuthData(uri:string, data: any = {}):Observable<any>{
    if(!this.token){ 
      return new Observable((observer) => {
        throw {message: 'Unauthorized. Please login or Register First'};
      });
    }
    data.accountId = this.user.id;
    return this.http.post((this.apiUrl+uri), data, {
      headers:{
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`        
      }
    }).pipe(catchError(
      err=>{
        throw err.message;
      }
    ));
  }



  uploadAsset(uri:string, file:File):Observable<any>{
    if(!this.token){ 
      return new Observable((observer) => {
        throw {message: 'Unauthorized. Please login or Register First'};
      });
    }

    const formData:any = new FormData();
    formData.append('image', file);
    formData.append('accountId', this.user.id );
     
    return this.http.post(this.apiUrl+uri, formData, {
      headers: {
        Authorization: `Bearer ${this.token}`
      },
      
    }).pipe(catchError(
      error=>{
        if(error.status === 401){
          this.logout();
        }
        throw error;
      }
    ));
  } 

  /** */

  logout(){
    this.postAuthData('/logout', {}).subscribe({
      next: (res: any) => {
        localStorage.removeItem('asset_bank_user');
        this.token = '';
        this.user = {};
      },
      error: (err: any) => {
        this.coreService.giveSnackbar(err?.error?.message, {
          duration: 5000,
          verticalPosition: 'top'
        });
        localStorage.removeItem('asset_bank_user');
        this.token = '';
        this.user = {};        
      },
      complete: () => {
        this.coreService.closeAllDialogs();
        location.reload();
      },
    });
  }

  /**ASSETS */

  getAsset(src: string){
    return this.http.get((this.imgPath+src), {
      headers:{
        'Content-Type': 'blob',
        //'Authorization': `Bearer ${this.token}`        
      },
      responseType: 'blob'
    }).pipe(catchError(
      err=>{
        throw err.message;
      }
    ));    
  }

  srcApiPath(src:string) {
    let pathArr = src.split('.');
    return this.imgPath+`${pathArr[0]}/${pathArr[1]}`;   
  };
 


}