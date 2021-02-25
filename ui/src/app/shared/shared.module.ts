import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocalDatetimePipe } from './pipes/local-datetime.pipe';
import { AgoDatetimePipe } from './pipes/ago-datetime.pipe';



@NgModule({
    declarations: [LocalDatetimePipe, AgoDatetimePipe],
  exports: [
    LocalDatetimePipe,
    AgoDatetimePipe
  ],
    imports: [
        CommonModule
    ]
})
export class SharedModule { }
