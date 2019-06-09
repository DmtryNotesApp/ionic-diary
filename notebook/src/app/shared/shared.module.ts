import { NgModule }            from '@angular/core';
import { CommonModule }        from '@angular/common';

import {DateFormatPipe} from './date-format.pipe';
import {CasesFilterPipe} from "./cases-filter.pipe";
import {FormatDateString} from "./format-date-string";
import { TranslatePhrasePipe } from './translate-phrase.pipe';

@NgModule({
    imports:      [ CommonModule ],
    declarations: [ DateFormatPipe, CasesFilterPipe, FormatDateString, TranslatePhrasePipe ],
    exports:      [ DateFormatPipe, CasesFilterPipe, FormatDateString, TranslatePhrasePipe ]
})
export class SharedModule { }