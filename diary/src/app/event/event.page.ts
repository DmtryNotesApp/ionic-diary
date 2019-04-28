import {Component, OnInit} from '@angular/core';
import {IonDatetime, NavController} from "@ionic/angular";
import {CommonService} from "../shared/common.service";

@Component({
  selector: 'app-event',
  templateUrl: './event.page.html',
  styleUrls: ['./event.page.scss'],
})
export class EventPage implements OnInit {

  eventDescription: string;
  isDone: boolean;
  eventOptions;
  event;
  id;
  eventDate: Date;
  eventDateS: Date;
  displayDate;

  constructor(public navCtrl: NavController, public commonService: CommonService) {}

  displayDateTime() {
    console.log('------ displayDateTime ------');
    console.log('eventDateS', this.eventDateS);
    console.log('this.eventDateFromDatePicker', this.eventDate.toString());
  }

  changeDate () {
    console.log('------ changeDate ------');
    console.log('eventDate', this.eventDateS);
    console.log('eventDate', new Date(Date.parse(this.eventDateS.toString())));
    let pickedDate = this.commonService.getPickedDate(this.eventDateS);
    console.log('pickedDate', pickedDate);

    // console.log('this.eventDateS', this.eventDateS.);
    // console.log('this.eventDateS', this.eventDateS.);
    this.eventOptions.eventDate = pickedDate;
    this.setDisplayDate(pickedDate);
  }

  ngOnInit() {
    console.log('------ ngOnInit ------');
    this.eventOptions = this.commonService.getEventParams();
    this.event = this.eventOptions.event;

    this.setDisplayDate(this.eventOptions.eventDate);
    console.log('this.eventOptions.eventDate', this.eventOptions.eventDate);
    console.log('2019-04-28T14:43:22.805+03:00');

    if (this.event) {
      this.isDone = this.eventOptions.event.isDone;
      this.eventDescription = this.eventOptions.event.description;
      this.id = this.eventOptions.event.id;
    }
  }

  saveEvent() {
    let date = this.commonService.getDate(6);
    this.commonService.processEvent({
      description: this.eventDescription,
      eventDate: this.eventOptions.eventDate,
      isDone: this.isDone,
      isCreationMode: this.eventOptions.isCreationMode,
      id: this.id
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
    console.log('this.displayDate', this.displayDate);
  }

  goBack() {
      this.navCtrl.navigateBack('home', {
          animated: true,
          animationDirection: 'back'
      });
  }

}
