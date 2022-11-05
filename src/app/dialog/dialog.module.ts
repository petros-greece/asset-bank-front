import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';


// Components
import { ButtonComponent } from './components/button/button.component';
import { DialogComponent } from './components/dialog/dialog.component';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  exports: [DialogComponent, ButtonComponent],
  declarations: [DialogComponent, ButtonComponent],
  entryComponents: [DialogComponent]
})
export class DialogModule {}
