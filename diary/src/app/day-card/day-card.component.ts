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
  ) { }

  @Input()
  events: DiaryEvent[] = [];

  @Input()
  dayNum: number;

  date: Date;
  progressStatus: string;
  progress: number;
  message: string;
  isDoneValue: boolean = false;
  eventDateS: Date;

  ngOnInit() {}

  updateHomePage() {
    console.log('updateHomePage');
    this.eventEmitter.publish('updateHomePage');
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
      this.date = this.commonService.getDate(this.dayNum);

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
  }

  ngAfterContentChecked() {
    this.prepareData();
  }

  redirectToEventPage(isCreationMode, event) {
      let eventParams = {
          isCreationMode: isCreationMode,
          eventDate: this.date,
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
    console.log('currentEvent', this.commonService.eventParams);
    this.commonService.eventParams.eventDate = this.commonService.getPickedDate(this.eventDateS);
    this.updateEvent(null);
    this.updateHomePage();
  }

  updateEvent(event) {
    console.log('------ markEventAsDone ------');
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
