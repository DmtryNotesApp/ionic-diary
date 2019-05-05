import {Component, Input, OnInit} from '@angular/core';
import {DiaryEvent} from "../models/diary-event";

import { Ionic4DatepickerModalComponent } from '@logisticinfotech/ionic4-datepicker';
import {Events, ModalController} from '@ionic/angular';

@Component({
  selector: 'app-week-container',
  templateUrl: './week-container.component.html',
  styleUrls: ['./week-container.component.scss'],
})
export class WeekContainerComponent implements OnInit {

  @Input()
  events: DiaryEvent[] = [];

  @Input()
  firstDayOfWeek: Date = new Date();

  mondayString: string;
  sundayString: string;

  // Calendar

  myDate;

  disabledDates: Date[] = [];
  datePickerObj: any = {
    inputDate: new Date(), // default new Date()
    showTodayButton: true, // default true
    closeOnSelect: false, // default false
    disableWeekDays: [], // default []
    mondayFirst: true, // default false
    setLabel: 'Set',  // default 'Set'
    todayLabel: 'Today', // default 'Today'
    closeLabel: 'Cancel', // default 'Close'
    disabledDates: [], // default []
    titleLabel: 'Select a Date', // default null
    monthsList: [
      "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
    ],
    weeksList: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    dateFormat: 'YYYY-MM-DD', // default DD MMM YYYY
    clearButton : true , // default true
    momentLocale: 'ru-RU', // Default 'en-US'
    yearInAscending: true, // Default false
    btnCloseSetInReverse: false, // Default false
    btnProperties: {
      expand: 'block', // Default 'block'
      fill: '', // Default 'solid'
      size: '', // Default 'default'
      disabled: '', // Default false
      strong: '', // Default false
      color: '' // Default ''
    },
    arrowNextPrev: {
      nextArrowSrc: '',
      prevArrowSrc: ''
    } // This object supports only SVG files.
  };

  constructor(
    public modalCtrl: ModalController,
    public eventEmitter: Events
  ) {}

  ngOnInit() {
    this.mondayString = this.firstDayOfWeek.toDateString();
    let tempDateMls = this.firstDayOfWeek;
    let tempDate = new Date(
      this.firstDayOfWeek.getFullYear(),
      this.firstDayOfWeek.getMonth(),
      this.firstDayOfWeek.getDate()
    );
    tempDate.setDate(tempDate.getDate() + 6);
    this.sundayString = tempDate.toDateString();
  }

  async changeDate() {
    console.log('this.myDate', this.myDate);

    const datePickerModal = await this.modalCtrl.create({
      component: Ionic4DatepickerModalComponent,
      cssClass: 'li-ionic4-datePicker',
      componentProps: {'objConfig': this.datePickerObj}
    });
    await datePickerModal.present();
    datePickerModal.onDidDismiss()
      .then((data) => {
        // this.isModalOpen = false;
        this.myDate = data.data.date;
        console.log('this.myDate', this.myDate);
        if (this.myDate != 'Invalid date') {
          this.eventEmitter.publish('updateHomePage', [new Date(this.myDate)]);
        }
      });
  }
}
