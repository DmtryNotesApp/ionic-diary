import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { StandingTasksPage } from './standing-tasks.page';

const routes: Routes = [
  {
    path: '',
    component: StandingTasksPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [StandingTasksPage]
})
export class StandingTasksPageModule {}
