import { NgModule }            from '@angular/core';
import { CommonModule }        from '@angular/common';

import {DateFormatPipe} from './date-format.pipe';
import {CasesFilterPipe} from "./cases-filter.pipe";
import {FormatDateString} from "./format-date-string";

@NgModule({
    imports:      [ CommonModule ],
    declarations: [ DateFormatPipe, CasesFilterPipe, FormatDateString ],
    exports:      [ DateFormatPipe, CasesFilterPipe, FormatDateString ]
})
export class SharedModule { }