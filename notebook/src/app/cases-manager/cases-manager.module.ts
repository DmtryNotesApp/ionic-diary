import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { CasesManagerPage } from './cases-manager.page';
import {SharedModule} from "../shared/shared.module";
import {PopoverActionsComponent} from "../popover-actions/popover-actions.component";

const routes: Routes = [
  {
    path: '',
    component: CasesManagerPage
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
  declarations: [CasesManagerPage, PopoverActionsComponent],
  exports: [CasesManagerPage, PopoverActionsComponent],
  entryComponents: [PopoverActionsComponent]
})
export class CasesManagerPageModule {}
