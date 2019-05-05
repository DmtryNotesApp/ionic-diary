import {Component, Injectable, OnDestroy, OnInit} from '@angular/core';

import {CommonService} from "../shared/common.service";
import {Events} from "@ionic/angular";


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

@Injectable()
export class HomePage implements OnInit, OnDestroy{

  firstDayOfWeek: Date;
  firstDaysOfWeeks: Date[] = [];
  events: any;

  slideOpts = {
    initialSlide: 4,
    speed: 400
  };

  constructor(
    public commonService: CommonService,
    public eventEmitter: Events
  ) {
    let self = this;
    eventEmitter.subscribe('updateHomePage', function(args) {
      console.log('------ updateHomePage ------');
      let date: Date = args[0];
      console.log('date', date);
      commonService.actualDate = date;
      commonService.setUpData();
      self.prepareData();
    })
  }

  ngOnInit() {
    console.log('------ ngOnInit ------');
    this.prepareData();
  }
  ngOnDestroy() {
    this.eventEmitter.unsubscribe('updateHomePage');
  }

  prepareData() {
    console.log('------ prepareData ------');
    this.firstDayOfWeek = this.commonService.getFirstDayOfWeek();
    this.firstDaysOfWeeks = this.commonService.getFirstDaysOfWeeks();

    console.log('this.firstDayOfWeek', this.firstDayOfWeek);
    console.log('this.firstDaysOfWeeks', this.firstDaysOfWeeks);

    this.events = localStorage.getItem('plannedEvents')
        ? JSON.parse(localStorage.getItem('plannedEvents'))
        : [];
    let eventsMap = {};

    if (this.events.length > 0) {

      for (let i = 0; i < this.events.length; i++) {
        let date = new Date(this.events[i].eventDate);
        this.commonService.setNoneHour(date);

        let eventsArray = eventsMap[date + ''] || [];
        eventsArray.push(this.events[i]);
        eventsMap[date + ''] = eventsArray;
      }
    }
    this.commonService.setEvents(this.events);
    this.commonService.setEventsMap(eventsMap);
  }

  ionViewDidEnter() {
    console.log('------ ionViewDidEnter ------');
  }
}
