import {Component, Injectable, OnInit} from '@angular/core';

import {CommonService} from "../shared/common.service";
import {Events} from "@ionic/angular";


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

@Injectable()
export class HomePage implements OnInit{

    firstDayOfWeek: Date;
    events: any;

    constructor(
      public commonService: CommonService,
      public eventEmitter: Events
    ) {
      eventEmitter.subscribe('updateHomePage', () => {
        console.log('updateHomePage on HomePage');
        this.prepareData();
      });
    }

    ngOnInit() {
        this.prepareData();
    }

    prepareData() {
        this.firstDayOfWeek = this.commonService.getFirstDayOfWeek();

        this.events = localStorage.getItem('plannedEvents')
            ? JSON.parse(localStorage.getItem('plannedEvents'))
            : [];
        console.log('this.events', this.events);
        // this.commonService.saveEvents([]);
        this.commonService.setEvents(this.events);
    }

    ionViewDidEnter() {
        this.prepareData();
    }
}
