import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { CasePage } from './case.page';
import {DatePicker} from "@ionic-native/date-picker/ngx";
import {SharedModule} from "../shared/shared.module";

const routes: Routes = [
  {
    path: '',
    component: CasePage
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
  providers: [DatePicker],
  declarations: [CasePage]
})
export class CasePageModule {}
