import {Component, OnInit} from '@angular/core';
import {NavController} from "@ionic/angular";
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

  constructor(public navCtrl: NavController, public commonService: CommonService) {}

  ngOnInit() {
    console.log('------ ngOnInit ------');
    this.eventOptions = this.commonService.getEventParams();
    this.event = this.eventOptions.event;
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
      creationDate: this.eventOptions.creationDate,
      isDone: this.isDone,
      isCreationMode: this.eventOptions.isCreationMode,
      id: this.id
    });
    this.eventDescription = '';
    this.isDone = false;
    this.goBack();
  }

  goBack() {
      this.navCtrl.navigateBack('home', {
          animated: true,
          animationDirection: 'back'
      });
  }

}
