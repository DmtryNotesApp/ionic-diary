import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AlertController, NavController} from "@ionic/angular";
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
    public navCtrl: NavController,
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
          }
        },
        {
          text: 'Ok',
          handler: description => {
            let [task] = description;
            if (task) {
              this.addStandingTask(task);
            }
          }
        }
      ]
    });
    await alert.present();
  }
  async preventClosure(task) {
    let alert = await this.alertCtrl.create({
      header: 'Are you sure you want to delete the task?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
          }
        },
        {
          text: 'Ok',
          handler: data => {
            if (task) {
              this.deleteTask(task.priority);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  switchReorderState(needToSave) {
    this.areChangesDisabled = !this.areChangesDisabled;

    if (needToSave) {
      this.commonService.saveStandingTasks(this.standingTasks);
    }
  }

  resize(event) {
    let textArea = event.target;
    textArea.style.overflow = 'hidden';
    textArea.style.height = 'auto';
    textArea.style.height = (textArea.scrollHeight + 23) + "px";
  }

  goBack() {
    let url = 'home';
    this.navCtrl.navigateBack(url, {
      animated: true,
      animationDirection: 'back'
    });
  }

}