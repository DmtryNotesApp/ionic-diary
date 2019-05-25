import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadChildren: './home/home.module#HomePageModule' },
  { path: 'case', loadChildren: './case/case.module#CasePageModule' },
  { path: 'cases-manager', loadChildren: './cases-manager/cases-manager.module#CasesManagerPageModule' },
  { path: 'standing-tasks', loadChildren: './standing-tasks/standing-tasks.module#StandingTasksPageModule' },
  { path: 'settings-page', loadChildren: './settings-page/settings-page.module#SettingsPagePageModule' },
  { path: 'calendar-date-picker', loadChildren: './calendar-date-picker/calendar-date-picker.module#CalendarDatePickerPageModule' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
