import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppCanvasComponent } from './components/app-canvas/app-canvas.component';


import { NgxDropzoneModule } from 'ngx-dropzone';
import { AppDropzoneComponent } from './components/app-dropzone/app-dropzone.component';
import { MaterialModule } from './material/material.module';
import { FormsModule } from '@angular/forms';
import { DialogModule } from './dialog/dialog.module';
import { ColorPickerModule } from 'ngx-color-picker';
import { PickerMenuComponent } from './components/picker-menu/picker-menu.component';
import { HttpClientModule } from '@angular/common/http';
import { TreeComponent } from './components/tree/tree.component';
import { IconsComponent } from './components/icons/icons.component';

import { AppFabricComponent } from './components/app-fabric/app-fabric.component';
import { ImageEditorComponent } from './components/image-editor/image-editor.component';

import { SortablejsModule } from 'ngx-sortablejs';
import { UserFormsComponent } from './components/user-forms/user-forms.component';
import { BankPipesModule } from './pipe/pipe.module';

@NgModule({
  declarations: [
    AppComponent,
    AppCanvasComponent,
    AppDropzoneComponent,
    AppCanvasComponent,
    PickerMenuComponent,
    TreeComponent,
    IconsComponent,
    AppFabricComponent,
    ImageEditorComponent,
    UserFormsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    NgxDropzoneModule,
    MaterialModule,
    DialogModule,
    FormsModule,
    ColorPickerModule,
    HttpClientModule,
    SortablejsModule.forRoot({ animation: 150 }),
    BankPipesModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
