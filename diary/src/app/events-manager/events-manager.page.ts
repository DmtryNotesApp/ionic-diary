import { Component, OnInit } from '@angular/core';
import {CommonService} from "../shared/common.service";
import {AlertController, Events, PopoverController} from "@ionic/angular";
import {PopoverActionsComponent} from "../popover-actions/popover-actions.component";

@Component({
  selector: 'app-events-manager',
  templateUrl: './events-manager.page.html',
  styleUrls: ['./events-manager.page.scss'],
})
export class EventsManagerPage implements OnInit {

  eventsMap: Object = {};
  eventsMapKeys: string[] = [];
  switchedDays: Object = {};
  markedEvents: Object = {};
  allEventsMarked: boolean = false;
  numberOfEvents: number = 0;
  showAllDays: boolean = true;

  constructor(
    public commonService: CommonService,
    public alertController: AlertController,
    public eventEmitter: Events,
    public popoverController: PopoverController
  ) {
    let self = this;
    this.eventEmitter.subscribe('updateEventsManagerPage', function eventHandler() {
      self.setupData();
    })
  }

  ngOnInit() {
    this.setupData();

    for (let i = 0; i < this.eventsMapKeys.length; i++) {
      this.switchedDays[i] = true;
    }
  }

  ngOnDestroy() {
    this.eventEmitter.unsubscribe('updateEventsManagerPage');
  }

  setupData() {
    this.numberOfEvents = 0;

    this.eventsMap = this.commonService.getEventsMap();
    this.eventsMapKeys = Object.keys(this.eventsMap)
      .filter(dateString => dateString != 'Invalid Date')
      .sort(function(date1, date2) {
        let date1Mls = new Date(date1).getTime();
        let date2Mls = new Date(date2).getTime();
        if (date1Mls > date2Mls) {
          return -1;
        } else if (date1Mls < date2Mls) {
          return 1
        } else {
          return 0;
        }
      });

    let eventsArray = Object.values(this.eventsMap);
    for(let array of eventsArray) {
      for (let event of array) {
        this.markedEvents[event.id] = false;
        this.numberOfEvents += 1;
      }
    }

  }

  switchDay(index) {
    if (this.switchedDays[index] == undefined) {
      this.switchedDays[index] = true;
    } else {
      this.switchedDays[index] = !this.switchedDays[index];
    }
  }

  markAllEvents() {
    let eventsIds = Object.keys(this.markedEvents);
    for(let i of eventsIds) {
      this.markedEvents[i] = this.allEventsMarked;
    }
  }

  deleteSelectedEvents() {
    let keys = Object.keys(this.markedEvents);
    let arrayToDelete = [];
    for (let key of keys) {
      if(this.markedEvents[key]) {
        arrayToDelete.push(Number(key));
      }
    }
    if (arrayToDelete.length > 0) {
      this.showAlert(arrayToDelete);
    }
  }

  async showAlert(arrayToDelete) {
    const alert = await this.alertController.create({
      header: 'Confirm Action',
      message: 'Are you sure you want to delete ' + arrayToDelete.length + ' events?',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            this.deleteForward(arrayToDelete);
          }
        }, {
          text: 'No',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            this.popoverController.dismiss();
          }
        }
      ]
    });

    await alert.present();
  }

  deleteForward(arrayToDelete) {
    this.commonService.deleteArrayOfEvents(arrayToDelete);
    this.numberOfEvents = this.numberOfEvents - arrayToDelete.length;
    for (let i = 0; i < arrayToDelete.length; i++) {
      this.markedEvents[arrayToDelete[i]] = false;
    }
  }

  createNewEvent() {
    this.commonService.redirectToEventPage(true, {
      eventDate: new Date().toDateString(),
      comeFromEventManager: true
    });
  }

  async showMenu(event, calendarEvent) {
    const popover = await this.popoverController.create({
      component: PopoverActionsComponent,
      animated: true,
      backdropDismiss: true,
      componentProps: {calendarEvent: calendarEvent},
      event: event,
      translucent: true
    });
    return await popover.present();
  }
}
