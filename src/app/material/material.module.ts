import { NgModule } from '@angular/core';



// Material Form Controls
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
// Material Navigation
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
// Material Layout
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatListModule } from '@angular/material/list';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTabsModule } from '@angular/material/tabs';
// Material Buttons & Indicators
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRippleModule } from '@angular/material/core';
// Material Popups & Modals 
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
// Material Data tables
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {MatTreeModule} from '@angular/material/tree';    

import {DragDropModule} from '@angular/cdk/drag-drop';

const MaterialComponents = [
          MatFormFieldModule,
          MatIconModule,
          MatCardModule,
          MatInputModule,
          MatTableModule,
          MatButtonModule,
          MatCheckboxModule,
          MatGridListModule,
          MatDividerModule,
          MatSelectModule,
          MatPaginatorModule,
          MatSortModule,
          MatTabsModule,
          MatRadioModule,
          MatDatepickerModule,
          MatSliderModule,
          MatProgressBarModule,
          MatDialogModule,
          MatAutocompleteModule,
          MatListModule,
          MatChipsModule,
          MatRippleModule,
          MatExpansionModule,
          MatToolbarModule, 
          MatTooltipModule,
          MatProgressSpinnerModule,
          MatButtonToggleModule,
          MatMenuModule,
          MatBadgeModule,
          MatStepperModule,
          MatSidenavModule,
          MatSnackBarModule,
          MatTreeModule,
          DragDropModule
      ];
          
          
@NgModule({
  imports: [MaterialComponents],
  exports: [MaterialComponents]
})
export class MaterialModule { }