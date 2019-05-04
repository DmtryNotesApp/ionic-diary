import {Component, Input, OnInit, Output} from '@angular/core';

import {DiaryEvent} from "../models/diary-event";
import {CommonService} from "../shared/common.service";
import {ActionSheetController, AlertController, Events, NavController} from "@ionic/angular";

@Component({
  selector: 'app-day-card',
  templateUrl: './day-card.component.html',
  styleUrls: ['./day-card.component.scss'],
})
export class DayCardComponent implements OnInit {

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

  ngOnInit() {}

  updateDayCardComponent(newDate) {
    console.log('------ updateDayCardComponent from updateDayCardComponent ------');
    console.log('this.date', this.date);
    console.log('newDate', newDate);
    this.eventEmitter.publish('updateDayCardComponent', this.commonService.cameFromFirstDayOfWeek, newDate);
  }

 async showMenu(event) {
    console.log('------ showMenu ------');

    console.log('event', event);
    this.commonService.eventParams = event;
    console.log('this.commonService.eventParams', this.commonService.eventParams);
    const actionSheet = await this.actionSheetController.create({
      header: this.commonService.eventParams.description,
      backdropDismiss: true,
      buttons: [
        {
          text: 'Mark as ' + (this.commonService.eventParams.isDone ? 'Uncompleted' : 'Completed'),
          icon: 'checkmark',
          handler: () => {
            console.log('Mark as Completed/Uncompleted clicked');
            this.commonService.eventParams.isDone = !this.commonService.eventParams.isDone;
            this.updateEvent(null);
          }
        }, {
        text: 'Edit',
        icon: 'settings',
        handler: () => {
          console.log('Edit clicked');
          this.redirectToEventPage(false, this.commonService.eventParams);
          this.prepareData();
        }
      }, {
        text: 'Change Date',
        icon: 'calendar',
        handler: () => {
          console.log('Change Date clicked');
          this.commonService.cameFromFirstDayOfWeek = this.date;
          let datePicker = document.getElementById('datePicker');
          datePicker.click();
        }
      }, {
          text: 'Delete',
          role: 'destructive',
          icon: 'trash',
          handler: () => {
            console.log('Delete clicked');
            this.showAlert(this.commonService.eventParams);
          }
        }, {
        text: 'Cancel',
        icon: 'close',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      }]
    });
    await actionSheet.present();
  }

  prepareData() {
    console.log('------ prepareDate() ------');
    this.commonService.addIteration();
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
      this.message = this.events.length - isdone + ' of ' + this.events.length + ' events left';
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
    console.log('this.events', this.events);
    this.isLoaded = true;
  }

  switchShowEventsMode() {
    this.showEvents = !this.showEvents;
  }

  ngAfterViewInit() {
    console.log('------ ngAfterViewInit ------');
    this.prepareData();
  }

  redirectToEventPage(isCreationMode, event) {
    let eventParams = {
      firstDayOfWeek: this.firstDayOfWeek,
      isCreationMode: isCreationMode,
      eventDate: this.date,
      previousEventDate: event ? event.eventDate : this.date,
      event: event
    };

    this.commonService.setEventParams(eventParams);

    this.navCtrl.navigateForward('event', {
      animated: true,
      animationDirection: 'forward'
    });
  }

  changeDate() {
    console.log('------ changeDate ------');
    console.log('currentDate: ' + this.date);
    let evDate = this.commonService.getPickedDate(this.eventDateS);
    console.log('evDate', evDate);
    this.commonService.eventParams.previousEventDate = this.commonService.eventParams.eventDate;
    this.commonService.eventParams.eventDate = evDate;
    this.updateEvent(null);
  }

  updateEvent(event) {
    console.log('------ markEventAsDone ------');
    console.log('event', event);
    console.log('this.events', this.events);
    this.commonService.processEvent(event || this.commonService.eventParams);
  }

  deleteEvent(event) {
    console.log('------ deleteEvent ------');
    this.commonService.deleteEvent(event);
    this.events = this.events.filter(ev => ev.id !== event.id);
    this.prepareData();
  }

  async showAlert(event) {
    const alert = await this.alertController.create({
      header: 'Confirm Action',
      message: 'Are you sure you want to delete this event?',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            console.log('Confirm Okay');
            this.deleteEvent(event);
          }
        }, {
          text: 'No',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }
      ]
    });

    await alert.present();
  }

}
