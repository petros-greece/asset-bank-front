import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { first } from 'rxjs/operators';
// Components
import { DialogComponent } from '../components/dialog/dialog.component';
// Models
import { DialogData } from '../models/dialog-data.model';
import { DialogOptions } from '../models/dialog-options.model';
// Services
import { DialogService } from './dialog.service';

@Injectable({
  providedIn: 'root'
})
export class DialogFactoryService<T = undefined> {
  
  constructor(private dialog: MatDialog) {
    
  }

  open(
    dialogData: DialogData<T>,
    options?: DialogOptions
  ): DialogService<T> {
    if(!options){ options = { } }  if(options.hasBackdrop === undefined) {options.hasBackdrop = true};
    let opts: DialogOptions = Object.assign({ disableClose: true, panelClass: 'no-pad-dialog' }, options);
    const dialogRef = this.dialog.open<DialogComponent<T>, DialogData<T>>(
      DialogComponent,
      {
        ...this.fetchOptions(opts),
        data: dialogData
      }
    );

    dialogRef.afterClosed().pipe(first());

    return new DialogService(dialogRef);
  }

  private fetchOptions({
    disableClose,
    panelClass,
    id,
    hasBackdrop,
  }: DialogOptions): Pick<
    MatDialogConfig<DialogData<T>>,
    'disableClose' | 'panelClass' | 'id' | 'hasBackdrop'
  > {
    return {
      disableClose,
      panelClass,
      id,
      hasBackdrop
    };
  }
}
