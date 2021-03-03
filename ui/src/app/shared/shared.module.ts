import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocalDatetimePipe } from './pipes/local-datetime.pipe';
import { AgoDatetimePipe } from './pipes/ago-datetime.pipe';
import { TextTruncatePipe } from './pipes/text-truncate.pipe';
import { AvatarComponent } from './components/avatar/avatar.component';
import {NbIconModule} from '@nebular/theme';
import { ImagePickerComponent } from './components/image-picker/image-picker.component';



@NgModule({
    declarations: [LocalDatetimePipe, AgoDatetimePipe, TextTruncatePipe, AvatarComponent, ImagePickerComponent],
    exports: [
        LocalDatetimePipe,
        AgoDatetimePipe,
        TextTruncatePipe,
        AvatarComponent,
        ImagePickerComponent
    ],
  imports: [
    CommonModule,
    NbIconModule
  ]
})
export class SharedModule { }
