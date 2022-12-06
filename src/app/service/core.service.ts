import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { DialogService } from './../dialog/services/dialog.service';
import { DialogFactoryService } from './../dialog/services/dialog-factory.service';
import { DialogData } from './../dialog/models/dialog-data.model';
import { DialogOptions } from './../dialog/models/dialog-options.model'
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
 
export class CoreService {
		
  isProd: boolean;
  isMobile: boolean;
  windowWidth: number; 

  selectedAssets: any[] = [];

  UI = {
    toastComponent: <any>{},
  }

	constructor(
    public snackBar: MatSnackBar,
    public http: HttpClient,
    private dialogService: DialogFactoryService,
    private matDialog : MatDialog,
    ){
      this.isProd = (window.location.href.indexOf('localhost') > 0) ? false : true;
      if(this.isProd){ window.console.log = function () { }; }
      this.windowWidth = window.innerWidth;
      this.isMobile = (window.innerWidth < 880) ? true : false;
      console.log('Core constructor', `Width ${this.windowWidth}`, `Is mobile ${this.isMobile}`);
	  }
 
  /** DIALOGS ****************************************************************************/

  openDialog(dialogData: DialogData, options?: DialogOptions): any {
    return this.dialogService.open(dialogData, options);
  }

  closeAllDialogs(): any {
    this.matDialog.closeAll();
  }  

  closeDialogById(id:string): any {
    this?.matDialog?.getDialogById(id)?.close();
  }  

  giveSnackbar(msg: string, opts:any = {}){
    let options = Object.assign({
                    horizontalPosition: 'start',
                    verticalPosition: 'bottom',
                    duration: 1000
                  }, opts);
    this.snackBar.open(msg, '', options);   
  }

  getData(url:string, params:any = {}):Observable<any>{
    return this.http.get(url, params);
  }

  /** LOCAL STORAGE ****************************************************/
 
  /**
   * getDeep(apiObj, ['level1', 'level2', 'target1']);
   */
   getDeep(obj:any, path:any) {
    let current = obj;
  
    for(let i = 0; i < path.length; ++i) {
      if (current[path[i]] == undefined) {
        return undefined;
      } else {
        current = current[path[i]];
      }
    }
    return current;
  }

  /**
   * setDeep(apiObj, ['level1', 'level2', 'target1'], 3);
   */
  setDeep(obj:any, path:any, value:any, setrecursively = true){

    let level = 0;

    path.reduce((a:any, b:any)=>{
      level++;

      if (setrecursively && typeof a[b] === "undefined" && level !== path.length){
        a[b] = {};
        return a[b];
      }

      if (level === path.length){
        a[b] = value;
        return value;
      } else {
        return a[b];
      }
    }, obj);
  }

  /**
   *  Return a js object or false in object does
   */
   getStorageObj(objName: string) : any{
    let item = localStorage.getItem(objName);
    return item ? 
          JSON.parse(item) : false;
  }

  getStorageObjDeep(objName: string, path: string[]) : any{
    let item = localStorage.getItem(objName);
    let obj = item ? 
          JSON.parse(item) : false;
    return obj ? this.getDeep(obj, path) : false;
  }

  /**
   *  Appends properties to existing object or creates a new local 
   *  storage json object. Overrides old ones  
   */
  updateStorageObj(objName: string, obj: any) : void {
    let item = localStorage.getItem(objName);
    let storageObj = item ? JSON.parse(item) : {}; Object.assign(storageObj, obj);
    localStorage.setItem(objName, JSON.stringify(storageObj));
  }

  /**
   *  Appends properties to existing object or creates 
   *  a new local storage json object  
   */
  updateStorageObjDeep(objName: string, path: any, value: any) : void {
    let item = localStorage.getItem(objName);
    let storageObj = item ? item : {};  
    this.setDeep(storageObj, path, value, true);
    localStorage.setItem(objName, JSON.stringify(storageObj));
  } 

  /** */

  dataURLtoFile(dataurl:string, filename:string) {
 
    let arr:any = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), 
        n = bstr.length, 
        u8arr = new Uint8Array(n);
        
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new File([u8arr], filename, {type:mime});
  }

  toBase64(e:any){
    return new Observable((observer) => {
      setTimeout(()=>{
        const reader = new FileReader();
        reader.readAsDataURL(e);
        reader.onload = () => {
          observer.next(reader.result)
        };
      }, 0);
    });
  }

  /** GENERAL */

  shuffle(array:any[]) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle.
    while (currentIndex != 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
  }

  arrayUnique(array: any[]) : any[]{
    var a = array.concat();
    for(var i=0; i<a.length; ++i) {
      for(var j=i+1; j<a.length; ++j) {
        if(a[i] === a[j])
            a.splice(j--, 1);
      }
    }
    return a;
  }

}