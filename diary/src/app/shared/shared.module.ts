import { NgModule }            from '@angular/core';
import { CommonModule }        from '@angular/common';

import {DateFormatPipe} from './date-format.pipe';
import {EventsFilterPipe} from "./events-filter.pipe";
import {FormatDateString} from "./format-date-string";

@NgModule({
    imports:      [ CommonModule ],
    declarations: [ DateFormatPipe, EventsFilterPipe, FormatDateString ],
    exports:      [ DateFormatPipe, EventsFilterPipe, FormatDateString ]
})
export class SharedModule { }