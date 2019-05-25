import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { CalendarDatePickerPage } from './calendar-date-picker.page';
import {SharedModule} from "../shared/shared.module";

const routes: Routes = [
  {
    path: '',
    component: CalendarDatePickerPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  declarations: [CalendarDatePickerPage]
})
export class CalendarDatePickerPageModule {}
