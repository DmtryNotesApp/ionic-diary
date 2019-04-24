import {Component, Injectable, OnInit} from '@angular/core';

import {DiaryEvent} from "../models/diary-event";
import {CommonService} from "../shared/common.service";


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

@Injectable()
export class HomePage implements OnInit{

    firstDayOfWeek: Date;

    constructor(public commonService: CommonService) {
    }
    events: any;

    ngOnInit() {
        this.prepareData();
    }

    prepareData() {
        this.firstDayOfWeek = this.commonService.getFirstDayOfWeek();

        // this.events = [
        //     new DiaryEvent(1, '1 Event', this.commonService.getDate(6), true),
        //     new DiaryEvent(2, '2 Event', this.commonService.getDate(6), true),
        //     new DiaryEvent(3, '3 Event', this.commonService.getDate(6), true),
        //     new DiaryEvent(4, '4 Event', this.commonService.getDate(6), true),
        //     new DiaryEvent(5, '5 Event', this.commonService.getDate(5), true),
        //     new DiaryEvent(6, '6 Event', this.commonService.getDate(5), true),
        //     new DiaryEvent(7, '7 Event', this.commonService.getDate(5), false),
        //     new DiaryEvent(10, '10 Event', this.commonService.getDate(3), true),
        //     new DiaryEvent(11, '11 Event', this.commonService.getDate(3), false),
        //     new DiaryEvent(12, '12 Event', this.commonService.getDate(3), false),
        //     new DiaryEvent(13, '13 Event', this.commonService.getDate(2), false),
        //     new DiaryEvent(14, '14 Event', this.commonService.getDate(2), false),
        //     new DiaryEvent(15, '15 Event', this.commonService.getDate(2), false),
        //     new DiaryEvent(16, '16 Event', this.commonService.getDate(2), false),
        //     new DiaryEvent(17, '17 Event', this.commonService.getDate(1), true),
        //     new DiaryEvent(18, '18 Event', this.commonService.getDate(1), false),
        //     new DiaryEvent(19, '19 Event', this.commonService.getDate(1), true),
        //     new DiaryEvent(20, '20 Event', this.commonService.getDate(1), true),
        //     new DiaryEvent(21, '21 Event', this.commonService.getDate(1), false),
        //     new DiaryEvent(22, '22 Event', this.commonService.getDate(0), true),
        //     new DiaryEvent(23, '23 Event', this.commonService.getDate(0), true),
        //     new DiaryEvent(24, '24 Event', this.commonService.getDate(0), true),
        //     new DiaryEvent(25, '25 Event', this.commonService.getDate(0), true),
        //     new DiaryEvent(26, '26 Event', this.commonService.getDate(0), true),
        //     new DiaryEvent(27, '27 Event', this.commonService.getDate(0), false)
        // ];
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
