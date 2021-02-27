import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocalDatetimePipe } from './pipes/local-datetime.pipe';
import { AgoDatetimePipe } from './pipes/ago-datetime.pipe';
import { TextTruncatePipe } from './pipes/text-truncate.pipe';
import { AvatarComponent } from './components/avatar/avatar.component';
import {NbIconModule} from '@nebular/theme';



@NgModule({
    declarations: [LocalDatetimePipe, AgoDatetimePipe, TextTruncatePipe, AvatarComponent],
  exports: [
    LocalDatetimePipe,
    AgoDatetimePipe,
    TextTruncatePipe,
    AvatarComponent
  ],
  imports: [
    CommonModule,
    NbIconModule
  ]
})
export class SharedModule { }
