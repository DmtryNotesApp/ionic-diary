import {Component, OnInit} from '@angular/core';
import {NavController} from "@ionic/angular";
import {CommonService} from "../shared/common.service";

@Component({
  selector: 'app-event',
  templateUrl: './event.page.html',
  styleUrls: ['./event.page.scss'],
})
export class EventPage implements OnInit {

  firstDayOfWeek: Date;
  eventDescription: string;
  isDone: boolean;
  eventOptions;
  event;
  id;
  eventDate: Date;
  previousEventDate: Date;
  eventDateS: Date;
  displayDate;
  comeFromEventManager: boolean = false;

  constructor(public navCtrl: NavController, public commonService: CommonService) {}

  changeDate () {
    console.log('------ changeDate ------');
    let pickedDate = this.commonService.getPickedDate(this.eventDateS);

    this.eventOptions.eventDate = pickedDate;
    this.setDisplayDate(pickedDate);
  }

  ngOnInit() {
    console.log('------ ngOnInit ------');
    this.eventOptions = this.commonService.getEventParams();
    console.log('this.eventOptions', this.eventOptions);
    if (this.eventOptions) {
      this.firstDayOfWeek = this.eventOptions.firstDayOfWeek;
      this.event = this.eventOptions.event;
      this.comeFromEventManager = this.eventOptions.comeFromEventManager;

      this.setDisplayDate(this.eventOptions.eventDate);

      if (this.event) {
        if (this.eventOptions && this.eventOptions.event) {
          this.isDone = this.eventOptions.event.isDone;
          this.eventDescription = this.eventOptions.event.description;
          this.id = this.eventOptions.event.id;
        }
        this.previousEventDate = this.eventOptions.previousEventDate;
      }
    }
  }

  saveEvent() {
    let date = this.commonService.getDate(this.firstDayOfWeek,6);
    this.commonService.processEvent({
      description: this.eventDescription,
      eventDate: this.eventOptions.eventDate,
      previousEventDate: this.previousEventDate,
      isDone: this.isDone,
      isCreationMode: this.eventOptions.isCreationMode,
      id: this.id,
      comeFromEventManager: this.comeFromEventManager
    });
    this.eventDescription = '';
    this.isDone = false;
    this.goBack();
  }

  setDisplayDate(date) {
    let options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      timezone: 'UTC'
    };
    this.displayDate = date.toLocaleDateString('en-US', options);
  }

  goBack() {
    let url = this.comeFromEventManager ? 'events-manager' : 'home';
    this.navCtrl.navigateBack(url, {
        animated: true,
        animationDirection: 'back'
    });
  }

}
