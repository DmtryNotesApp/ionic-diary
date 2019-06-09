import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AlertController, NavController} from "@ionic/angular";
import {CommonService} from "../shared/common.service";
import {StandingTask} from "../models/standing-task";
import {TranslationService} from "../shared/translation-service.service";

@Component({
  selector: 'app-standing-tasks',
  templateUrl: './standing-tasks.page.html',
  styleUrls: ['./standing-tasks.page.scss'],
})
export class StandingTasksPage implements OnInit {

  constructor(
    private alertCtrl: AlertController,
    private navCtrl: NavController,
    private commonService: CommonService,
    private translationService: TranslationService
  ) { }

  standingTasks: StandingTask[] = [];
  reorderGroup;
  areChangesDisabled: boolean = true;

  ngOnInit() {
    let promise = this.commonService.getDataAcync('standingTasks');
    Promise.all([promise])
    .then(data => {
      let tasks = data[0];
      this.standingTasks = tasks ? JSON.parse(tasks) : [];

      this.reorderGroup = document.querySelector('ion-reorder-group');

      this.reorderGroup.addEventListener('ionItemReorder', (ev) => {
        let draggedItem = this.standingTasks.splice(ev.detail.from,1)[0];
        this.standingTasks.splice(ev.detail.to,0, draggedItem);
        ev.detail.complete();
        this.changePriorities();
        this.commonService.saveStandingTasks(this.standingTasks);
      });
    })
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
      header: this.translationService.phrases['Make a Note'],
      inputs: [
        {
          placeholder: this.translationService.phrases['My Note...']
        }
      ],
      buttons: [
        {
          text: this.translationService.phrases['Cancel'],
          role: 'cancel',
          handler: data => {
          }
        },
        {
          text: this.translationService.phrases['Ok'],
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
      header: this.translationService.phrases['Are you sure you want to delete this Note?'],
      buttons: [
        {
          text: this.translationService.phrases['Cancel'],
          role: 'cancel',
          handler: data => {
          }
        },
        {
          text: this.translationService.phrases['Ok'],
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
