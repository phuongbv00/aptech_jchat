import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocalDatetimePipe } from './pipes/local-datetime.pipe';
import { AgoDatetimePipe } from './pipes/ago-datetime.pipe';
import { TextTruncatePipe } from './pipes/text-truncate.pipe';



@NgModule({
    declarations: [LocalDatetimePipe, AgoDatetimePipe, TextTruncatePipe],
    exports: [
        LocalDatetimePipe,
        AgoDatetimePipe,
        TextTruncatePipe
    ],
    imports: [
        CommonModule
    ]
})
export class SharedModule { }
