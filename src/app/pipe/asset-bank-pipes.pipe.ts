import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';


@Pipe({ name: 'apiPath' })
export class ApiPathPipe implements PipeTransform {
  transform(val:string) {
    let pathArr = val.split('.');
    return `${pathArr[0]}/${pathArr[1]}`;   
  };
};

@Pipe({ name: 'apiPathSm' })
export class ApiPathSmPipe implements PipeTransform {
  transform(val:string) {
    let pathArr = val.split('.');
    return `${pathArr[0]}-sm/${pathArr[1]}`;   
  };
};


@Pipe({ name: 'onlyNumber' })
export class OnlyNumberPipe implements PipeTransform {
  transform(val:string) {
    return val.replace(/[^0-9]/g, '');   
  };
};


@Pipe({ name: 'formatDate' })
export class FormatDatePipe implements PipeTransform {
  transform(date: any) {
    return new Date(date).toLocaleString('el-GR', {/* dateStyle: 'medium',  timeStyle: 'short',*/ hour12: false });  
  };
};

@Pipe({ name: 'matIcon' })
export class MatIconPipe implements PipeTransform {
  transform(iconName: string) {
    return `<mat-icon>${iconName}</mat-icon>`;  
  };
};



@Pipe({ name: 'objLength', pure: false })
export class ObjLengthPipe implements PipeTransform {
  transform(obj:any) {
    return Object.keys(obj).length;
  };
};

@Pipe({ name: 'unitType' })
export class UnitTypePipe implements PipeTransform {
  transform(obj:any) {
    if(typeof(obj) !== 'object'){
      return undefined;
    }
    else {
      const objKeys = Object.keys(obj);
      return obj[objKeys[0]] && obj[objKeys[1]] ? `${obj[objKeys[0]]} ${obj[objKeys[1]]}` : undefined;
    }
  };
};

