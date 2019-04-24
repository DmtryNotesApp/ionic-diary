import { NgModule }            from '@angular/core';
import { CommonModule }        from '@angular/common';

import {DateFormatPipe} from './date-format.pipe';
import {EventsFilterPipe} from "./events-filter.pipe";

@NgModule({
    imports:      [ CommonModule ],
    declarations: [ DateFormatPipe, EventsFilterPipe ],
    exports:      [ DateFormatPipe, EventsFilterPipe ]
})
export class SharedModule { }