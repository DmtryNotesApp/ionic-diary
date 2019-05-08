import {Component, Input, OnDestroy, OnInit, Output} from '@angular/core';

import {DiaryEvent} from "../models/diary-event";
import {CommonService} from "../shared/common.service";
import {ActionSheetController, AlertController, Events, NavController} from "@ionic/angular";

@Component({
  selector: 'app-day-card',
  templateUrl: './day-card.component.html',
  styleUrls: ['./day-card.component.scss'],
})
export class DayCardComponent implements OnInit, OnDestroy {

  constructor(
    public commonService: CommonService,
    public navCtrl: NavController,
    public actionSheetController: ActionSheetController,
    public alertController: AlertController,
    public eventEmitter: Events
  ) {
    eventEmitter.subscribe('updateDayCardComponent', (datesArray: string[]) => {
      if (datesArray.indexOf(this.date.toDateString()) != -1) {
        this.prepareData();
      }
    });
  }

  events: DiaryEvent[] = [];

  @Input()
  firstDayOfWeek: Date;

  @Input()
  dayNum: number;

  @Input()
  num: number;

  date: Date = new Date();
  progressStatus: string = 'success';
  progress: number = 1;
  message: string = 'No events planned';
  isDoneValue: boolean = false;
  eventDateS: Date;

  isLoaded: boolean = false;
  showEvents: boolean = false;

  ngOnInit() {
    this.prepareData();
    this.isLoaded = true;
  }

  ngOnDestroy() {
    this.eventEmitter.unsubscribe('updateDayCardComponent');
  }

  updateDayCardComponent(newDate) {
    this.eventEmitter.publish('updateDayCardComponent', this.commonService.cameFromFirstDayOfWeek, newDate);
  }

 async showMenu(event) {
    this.commonService.eventParams = event;
    const actionSheet = await this.actionSheetController.create({
      header: this.commonService.eventParams.description,
      backdropDismiss: true,
      buttons: [
        {
          text: 'Mark as ' + (this.commonService.eventParams.isDone ? 'Uncompleted' : 'Completed'),
          icon: 'checkmark',
          handler: () => {
            this.commonService.eventParams.isDone = !this.commonService.eventParams.isDone;
            this.updateEvent(null);
          }
        }, {
        text: 'View/Edit',
        icon: 'settings',
        handler: () => {
          this.redirectToEventPage(false, this.commonService.eventParams);
          this.prepareData();
        }
      }, {
        text: 'Change Date',
        icon: 'calendar',
        handler: () => {
          this.commonService.cameFromFirstDayOfWeek = this.date;
          let datePicker = document.getElementById('datePicker');
          datePicker.click();
        }
      }, {
          text: 'Delete',
          role: 'destructive',
          icon: 'trash',
          handler: () => {
            this.showAlert(this.commonService.eventParams);
          }
        }, {
        text: 'Cancel',
        icon: 'close',
        role: 'cancel',
        handler: () => {
        }
      }]
    });
    await actionSheet.present();
  }

  prepareData() {
    this.date = this.commonService.getDate(this.firstDayOfWeek, this.dayNum);
    this.events = this.commonService.eventsMap[this.date + ''] || [];

    let isdone: number = this.events.filter(event => event.isDone).length;
    this.progress = isdone / this.events.length;
    if (this.progress == 1) {
      this.message = 'No events left'
    } else if (this.events.length == 0) {
      this.progress = 1;
      this.message = 'No events planned';
    } else {
      this.message = this.events.length - isdone + ' of ' + this.events.length + ' in progress events left';
    }
    this.progressStatus =
      this.progress == 1
        ? 'success'
        : this.progress > 0.7
        ? 'primary'
        : this.progress > 0.3
          ? 'secondary'
          : 'warning'
    ;
  }

  switchShowEventsMode() {
    this.showEvents = !this.showEvents;
  }

  redirectToEventPage(isCreationMode, event) {
    let eventParams = {
      firstDayOfWeek: this.firstDayOfWeek,
      isCreationMode: isCreationMode,
      date: this.date,
      previousEventDate: event ? event.eventDate : this.date,
      description: event ? event.description : '',
      isDone: event ? event.isDone : false,
      id: event.id
    };

    this.commonService.redirectToEventPage(isCreationMode, eventParams);
  }

  changeDate() {
    let evDate = this.commonService.getPickedDate(this.eventDateS);
    this.commonService.eventParams.previousEventDate = this.commonService.eventParams.eventDate;
    this.commonService.eventParams.eventDate = evDate;
    this.updateEvent(null);
  }

  updateEvent(event) {
    this.commonService.processEvent(event || this.commonService.eventParams);
  }

  deleteEvent(event) {
    this.commonService.deleteEvent(event);
  }

  async showAlert(event) {
    const alert = await this.alertController.create({
      header: 'Confirm Action',
      message: 'Are you sure you want to delete this event?',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            this.deleteEvent(event);
          }
        }, {
          text: 'No',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
          }
        }
      ]
    });

    await alert.present();
  }

}
