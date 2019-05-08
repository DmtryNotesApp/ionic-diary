import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { EventsManagerPage } from './events-manager.page';
import {SharedModule} from "../shared/shared.module";
import {PopoverActionsComponent} from "../popover-actions/popover-actions.component";

const routes: Routes = [
  {
    path: '',
    component: EventsManagerPage
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
  declarations: [EventsManagerPage, PopoverActionsComponent],
  exports: [EventsManagerPage, PopoverActionsComponent],
  entryComponents: [PopoverActionsComponent]
})
export class EventsManagerPageModule {}
