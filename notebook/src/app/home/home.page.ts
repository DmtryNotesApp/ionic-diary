import {Component, Injectable, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CommonService} from "../shared/common.service";
import {Events, IonSlides, MenuController, ModalController, NavController} from "@ionic/angular";

import {Ionic4DatepickerModalComponent} from "@logisticinfotech/ionic4-datepicker";
import {CasesManagerPage} from "../cases-manager/cases-manager.page";

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
  cases: any;

  defaultSlide: number = 4;

  slideOpts = {
    initialSlide: this.defaultSlide,
    allowTouchMove: false,
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
      let date: Date = args[0];
      commonService.actualDate = date;
      commonService.setUpData();
      self.prepareData();
      self.slideChanged(true);
    });
  }

  ngOnInit() {
    this.prepareData();
    this.slideOpts.allowTouchMove = true;
  }
  ngOnDestroy() {
    this.eventEmitter.unsubscribe('updateHomePage');
  }
  clickMenu() {
    this.menu.open('first')
  }

  setDatesToDisplay(slideNumber) {
    let mondayDate = this.firstDaysOfWeeks[slideNumber];
    let tmpMondayArray = mondayDate.toDateString().split(' ').slice(1);
    this.mondayString = tmpMondayArray.join(' ');
    let tempDateMls = mondayDate;
    let tempDate = new Date(
      mondayDate.getFullYear(),
      mondayDate.getMonth(),
      mondayDate.getDate()
    );
    tempDate.setDate(tempDate.getDate() + 6);
    let tmpSundayArray = tempDate.toDateString().split(' ').slice(1);
    this.sundayString = tmpSundayArray.join(' ');
  }

  prepareData() {
    this.firstDayOfWeek = this.commonService.getFirstDayOfWeek();
    this.firstDaysOfWeeks = this.commonService.getFirstDaysOfWeeks();

    this.cases = localStorage.getItem('plannedCases')
        ? JSON.parse(localStorage.getItem('plannedCases'))
        : [];
    let casesMap = {};

    if (this.cases.length > 0) {

      for (let i = 0; i < this.cases.length; i++) {
        let date = new Date(this.cases[i].caseDate);
        this.commonService.setNoneHour(date);

        let casesArray = casesMap[date + ''] || [];
        casesArray.push(this.cases[i]);
        casesMap[date + ''] = casesArray;
      }
    }

    this.commonService.setCases(this.cases);
    this.commonService.setCasesMap(casesMap);
  }

  slideChanged(setDefault) {
    if (this.slides) {
      if (setDefault) {
        this.slides.slideTo(this.defaultSlide);
      }

      this.slides.getActiveIndex().then(slideNumber => {
        this.setDatesToDisplay(slideNumber);

        if ((
          slideNumber + 1 == this.firstDaysOfWeeks.length) ||
          slideNumber == 0
        ) {
          this.slideOpts.allowTouchMove = false;
          this.changeDate(true, slideNumber);
        }
      });
    }
  }

  async changeDate(leaveMenu, slideNumber) {
    if (!leaveMenu) {
      this.closeMenu();
    }
    const datePickerModal = await this.modalCtrl.create({
      component: Ionic4DatepickerModalComponent,
      cssClass: 'li-ionic4-datePicker',
      componentProps: {'objConfig': this.datePickerObj}
    });
    await datePickerModal.present();
    if (slideNumber != null) {
      await this.eventEmitter.publish('updateHomePage', [this.firstDaysOfWeeks[slideNumber]]);
    }
    datePickerModal.onDidDismiss()
      .then((data) => {
        this.myDate = data.data.date;
        if (this.myDate != 'Invalid date') {
          this.eventEmitter.publish('updateHomePage', [new Date(this.myDate)]);
        }
      });
  }

  closeMenu() {
    this.menu.toggle();
  }

  goHome() {
    this.eventEmitter.publish('updateHomePage', [new Date()]);
    this.closeMenu();
  }

  async openCasesManager() {
    this.navCtrl.navigateForward('cases-manager', {
      animated: true,
      animationDirection: 'forward'
    });
    this.closeMenu();
  }
  async openStandingTasksPage() {
    this.navCtrl.navigateForward('standing-tasks', {
      animated: true,
      animationDirection: 'forward'
    });
    this.closeMenu();
  }
}
