import { TemplateRef } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { first } from 'rxjs/operators';

// Components
import { DialogComponent } from '../components/dialog/dialog.component';

type DialogRef<T> = MatDialogRef<DialogComponent<T>>;

export class DialogService<T = undefined> {
  opened$;

  constructor(private dialogRef: DialogRef<T>) {
    this.opened$ = this.dialogRef.afterOpened().pipe(first());
  }

  get context() {
    return this.dialogRef.componentInstance.data.context;
  }

  close() {
    this.dialogRef.close();
  }

  setHeaderText(headerText: string): void {
    this.dialogRef.componentInstance.data.headerText = headerText;
  }

  setTemplate(template: TemplateRef<any>): void {
    this.dialogRef.componentInstance.data.template = template;
  }
  
  setCls(cls?: string): void {
    this.dialogRef.componentInstance.data.cls = cls ? cls : '';
  }

  setShowClose(showClose?: boolean): void {
    this.dialogRef.componentInstance.data.showClose = showClose ? showClose : true;
  }

}
