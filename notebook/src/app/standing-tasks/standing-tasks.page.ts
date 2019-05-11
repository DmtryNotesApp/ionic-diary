import { Component, OnInit } from '@angular/core';
import {AlertController} from "@ionic/angular";
import {CommonService} from "../shared/common.service";
import {StandingTask} from "../models/standing-task";

@Component({
  selector: 'app-standing-tasks',
  templateUrl: './standing-tasks.page.html',
  styleUrls: ['./standing-tasks.page.scss'],
})
export class StandingTasksPage implements OnInit {

  constructor(
    public alertCtrl: AlertController,
    public commonService: CommonService
  ) { }

  standingTasks: StandingTask[] = [];
  reorderGroup;
  areChangesDisabled: boolean = true;

  ngOnInit() {
    this.standingTasks = this.commonService.getStandingTasks();

    this.reorderGroup = document.querySelector('ion-reorder-group');

    this.reorderGroup.addEventListener('ionItemReorder', (ev) => {
      let draggedItem = this.standingTasks.splice(ev.detail.from,1)[0];
      this.standingTasks.splice(ev.detail.to,0, draggedItem);
      ev.detail.complete();
      this.changePriorities();
      this.commonService.saveStandingTasks(this.standingTasks);
    });
  }

  changePriorities() {
    for (let i = 0; i < this.standingTasks.length; i++) {
      this.standingTasks[i].priority = i;
    }
  }

  deleteTask(priority) {
    this.standingTasks = this.standingTasks.filter(task => task.priority != priority);
    this.commonService.saveStandingTasks(this.standingTasks);
  }

  addStandingTask(taskDescription: string) {
    this.standingTasks.push(new StandingTask(
      this.standingTasks.length, taskDescription
    ));
    this.commonService.saveStandingTasks(this.standingTasks);
  }

  async presentTaskPrompt() {
    let alert = await this.alertCtrl.create({
      header: 'Describe The Task',
      inputs: [
        {
          placeholder: 'need to do...'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Ok',
          handler: description => {
            let [task] = description;
            console.log(task);
            if (task) {
              this.addStandingTask(task);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  switchReorderState(needToSave) {
    console.log('switchReorderState');
    this.areChangesDisabled = !this.areChangesDisabled;

    if (needToSave) {
      console.log('save tasks');
      this.commonService.saveStandingTasks(this.standingTasks);
    }
  }

}
