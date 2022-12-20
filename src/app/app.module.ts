import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppCanvasComponent } from './app-canvas/app-canvas.component';

import { NgxDropzoneModule } from 'ngx-dropzone';
import { AppDropzoneComponent } from './components/app-dropzone/app-dropzone.component';
import { MaterialModule } from './material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { PasteUrlComponent } from './components/paste-url/paste-url.component';
import { GalleryComponent } from './components/gallery/gallery.component';
import { ComicComponent } from './components/comic/comic.component';
import { PalletPickerComponent } from './components/pallet-picker/pallet-picker.component';
import { MiniTreeComponent } from './components/mini-tree/mini-tree.component';
import { MiniFabricComponent } from './components/mini-fabric/mini-fabric.component';
import { SpeechRecognitionComponent } from './components/speech-recognition/speech-recognition.component';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { CarouselComponent } from './components/carousel/carousel.component';
import { ImageEffectsCanvasComponent } from './image-effects-canvas/image-effects-canvas.component';

@NgModule({
  declarations: [
    AppComponent,
    AppCanvasComponent,
    AppDropzoneComponent,
    PickerMenuComponent,
    TreeComponent,
    IconsComponent,
    AppFabricComponent,
    ImageEditorComponent,
    UserFormsComponent,
    PasteUrlComponent,
    GalleryComponent,
    ComicComponent,
    PalletPickerComponent,
    MiniTreeComponent,
    MiniFabricComponent,
    SpeechRecognitionComponent,
    CarouselComponent,
    ImageEffectsCanvasComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    NgxDropzoneModule,
    MaterialModule,
    DialogModule,
    FormsModule,
    ReactiveFormsModule,
    ColorPickerModule,
    HttpClientModule,
    SortablejsModule.forRoot({ animation: 150 }),
    BankPipesModule,
    SlickCarouselModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
