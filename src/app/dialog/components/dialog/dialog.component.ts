import { Component, Inject, TemplateRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

/**
 * A common component rendered as a Material dialog
 */
@Component({
  selector: 'app-dialog',
  styleUrls: ['dialog.component.scss'],
  template: `
    <div style="position: relative;">        
      <mat-icon mat-dialog-close
        *ngIf="data.showClose !== false" 
        class="my-close-dialog" 
        style="color: white">cancel
      </mat-icon>
      <mat-toolbar 
        *ngIf="data.headerText !== 'false'"
        color="primary"
        [ngClass]="data.cls" 
        style="position: relative;min-width: 350px;"
        innerHtml="{{ data.headerText }}">
      </mat-toolbar>
   
      <ng-container
        style="padding: 5px;"
        [ngTemplateOutlet]="data.template"
        [ngTemplateOutletContext]="data.context"
      ></ng-container>
    </div>
  `
})
export class DialogComponent<T> {
  /**
   * Initializes the component.
   *
   * @param dialogRef - A reference to the dialog opened.
   */
  constructor(
    public dialogRef: MatDialogRef<DialogComponent<T>>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      headerText: string;
      template: TemplateRef<any>;
      context: T;
      cls: string;
      showClose: boolean;
    },
  ) {
  }
}
