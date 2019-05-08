import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Ionic4DatepickerModule } from
    '@logisticinfotech/ionic4-datepicker';

import { HomePage } from './home.page';
import {DayCardComponent} from "../day-card/day-card.component";
import {SharedModule} from "../shared/shared.module";
import {WeekContainerComponent} from "../week-container/week-container.component";
import {EventsManagerPage} from "../events-manager/events-manager.page";
import {EventPageModule} from "../event/event.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    Ionic4DatepickerModule,
    RouterModule.forChild([
      {
        path: '',
        component: HomePage
      }
    ])
  ],
  declarations: [HomePage, DayCardComponent, WeekContainerComponent],
  exports: [
      SharedModule,
      HomePage,
      DayCardComponent,
      WeekContainerComponent
  ],
  entryComponents: []
})
export class HomePageModule {}
