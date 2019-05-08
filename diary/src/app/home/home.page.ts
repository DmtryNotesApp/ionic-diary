import {Component, Injectable, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CommonService} from "../shared/common.service";
import {Events, IonSlides, MenuController, ModalController, NavController} from "@ionic/angular";

import {Ionic4DatepickerModalComponent} from "@logisticinfotech/ionic4-datepicker";
import {EventsManagerPage} from "../events-manager/events-manager.page";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

@Injectable()
export class HomePage implements OnInit, OnDestroy{

  @ViewChild('slides') slides: IonSlides;

  firstDayOfWeek: Date;
  firstDaysOfWeeks: Date[] = [];
  events: any;

  defaultSlide: number = 4;

  slideOpts = {
    initialSlide: this.defaultSlide,
    speed: 400
  };

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
    public commonService: CommonService,
    public eventEmitter: Events,
    public modalCtrl: ModalController,
    public navCtrl: NavController,
    public menu: MenuController
  ) {
    let self = this;
    eventEmitter.subscribe('updateHomePage', function(args) {
      console.log('------ updateHomePage ------');
      let date: Date = args[0];
      commonService.actualDate = date;
      commonService.setUpData();
      self.prepareData();
      self.slideChanged(true);
    });
  }

  ngOnInit() {
    console.log('------ ngOnInit ------');
    this.prepareData();
  }
  ngOnDestroy() {
    this.eventEmitter.unsubscribe('updateHomePage');
  }

  setDatesToDisplay(slideNumber) {
    let mondayDate = this.firstDaysOfWeeks[slideNumber];
    this.mondayString = mondayDate.toDateString();
    let tempDateMls = mondayDate;
    let tempDate = new Date(
      mondayDate.getFullYear(),
      mondayDate.getMonth(),
      mondayDate.getDate()
    );
    tempDate.setDate(tempDate.getDate() + 6);
    this.sundayString = tempDate.toDateString();
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

  slideChanged(setDefault) {
    if (this.slides) {
      if (setDefault) {
        this.slides.slideTo(this.defaultSlide);
      }

      this.slides.getActiveIndex().then(slideNumber => {
        this.setDatesToDisplay(slideNumber);
      });
    }
  }

  async changeDate() {
    this.closeMenu();
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
        if (this.myDate != 'Invalid date') {
          this.eventEmitter.publish('updateHomePage', [new Date(this.myDate)]);
        }
      });
  }

  closeMenu() {
    this.menu.toggle();

    this.eventEmitter.publish('updateHomePage', [new Date()]);
  }

  async openEventsManager() {
    this.closeMenu();

    this.navCtrl.navigateForward('events-manager', {
      animated: true,
      animationDirection: 'forward'
    });
  }
}
