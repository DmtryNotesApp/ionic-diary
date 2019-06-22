import {Injectable} from '@angular/core';
import {Events, IonSlides, NavController, Platform} from "@ionic/angular";
import {Storage} from '@ionic/storage';
import {LocalNotifications} from "@ionic-native/local-notifications/ngx";
import {AppSettings} from "../models/app-settings";
import {Badge} from '@ionic-native/badge/ngx';

import {Case} from "../models/case";
import {TranslationService} from "./translation-service.service";


@Injectable({
  providedIn: 'root'
})
export class CommonService {

  firstDayOfWeek: Date;
  firstDaysOfWeeks: Date[] = [];
  caseParams;
  cases = [];
  casesMap = {};
  cameFromFirstDayOfWeek: Date;
  actualDate: Date = new Date();

  isInitialized: boolean = false;

  lastCaseId: number = 0;
  language = localStorage.getItem('language') || 'English';
  isEnglishLocale = this.language == 'English';

  datePickerObj: any = {};

  appSettings: AppSettings = new AppSettings(
    true,
    false,
    'English',
    true
  );

  slides: IonSlides;

  defaultSlide: number = 4;

  slideOpts = {
    initialSlide: this.defaultSlide,
    allowTouchMove: false,
    speed: 400
  };

  surroundSlidesLoaded: boolean = false;
  currentSlide: number = 4;

  needToReload: boolean = false;

  blockChangeDate: boolean;

  constructor(
    private eventEmitter: Events,
    private navCtrl: NavController,
    private storage: Storage,
    private localNotifications: LocalNotifications,
    private badge: Badge,
    private platform: Platform,
    private translationService: TranslationService
  ) {
    this.setUpData();
    this.getLastCaseId();
    this.getAppSettings();

    eventEmitter.subscribe('change language', () => {
      this.setCalendarOptions();
    });
  }

  ngOnDestroy() {
    this.eventEmitter.unsubscribe('change language');
  }

  setCalendarOptions() {
    this.datePickerObj = {
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
      dateFormat: this.isEnglishLocale ? 'YYYY-MM-DD' : 'DD-MM-YYYY', // default DD MMM YYYY
      clearButton : true , // default true
      momentLocale: this.isEnglishLocale ?  'en-US' : 'ru-RU', // Default 'en-US'
      yearInAscending: true, // Default false
      btnCloseSetInReverse: false, // Default false
      btnProperties: {
        expand: 'block', // Default 'block'
        fill: 'solid', // Default 'solid'
        size: '', // Default 'default'
        disabled: false, // Default false
        strong: true, // Default false
        color: '' // Default ''
      },
      arrowNextPrev: {
        nextArrowSrc: '',
        prevArrowSrc: ''
      } // This object supports only SVG files.
    };
  }

  slideChanged(setDefault) {
    if (this.slides) {
      if (setDefault) {
        this.currentSlide = this.defaultSlide;
        this.slides.slideTo(this.defaultSlide);
      }

      this.slides.getActiveIndex().then(slideNumber => {
        this.currentSlide = slideNumber;

        if ((
          slideNumber + 1 == this.firstDaysOfWeeks.length) ||
          slideNumber == 0
        ) {
          this.slideOpts.allowTouchMove = false;
          this.needToReload = true;
          this.changeDate();
        }
        this.eventEmitter.publish('updateDates');
      });
      this.surroundSlidesLoaded = false;
    }
  }

  async changeDate() {
    await this.navCtrl.navigateForward('calendar-date-picker', {
      animated: true,
      animationDirection: 'forward'
    });
  }

  getAppSettings() {
    this.storage.get('appSettings')
    .then(data => {
      let applicationSettings = data ? data : this.appSettings;
      this.appSettings.notificationsEnabled =
        (
          applicationSettings.notificationsEnabled != null &&
          applicationSettings.notificationsEnabled != undefined
        ) ?
          applicationSettings.notificationsEnabled :
          true;

      this.appSettings.badgesOn =
        (
          applicationSettings.badgesOn != null &&
          applicationSettings.badgesOn != undefined
        ) ?
          applicationSettings.badgesOn :
          true;

      this.appSettings.soundsEnabled =
      (
        applicationSettings.soundsEnabled != null &&
        applicationSettings.soundsEnabled != undefined
      ) ?
        applicationSettings.soundsEnabled :
        false;

      this.appSettings.chosenLanguage =
      (
        applicationSettings.chosenLanguage != null &&
        applicationSettings.chosenLanguage != undefined
      ) ?
        applicationSettings.chosenLanguage :
        'English';
    });
    this.setCalendarOptions();
  }

  saveSettings(settings: AppSettings) {
    this.storage.set('appSettings', settings);
    this.appSettings = settings;
    localStorage.setItem('language', settings.chosenLanguage);
    this.language = settings.chosenLanguage;
    this.isEnglishLocale = this.language == 'English';
  }

  scheduleNotification(caseToProcess) {
    if (caseToProcess.caseDateTime) {
      this.localNotifications.schedule({
        id: caseToProcess.id,
        title: this.translationService.phrases['New Notification'],
        text: caseToProcess.description,
        data: { mydata: caseToProcess.id },
        foreground: true,
        trigger: { at: new Date(new Date(caseToProcess.caseDateTime).getTime()) },
        vibrate: true,
        sound: 'notification-sound',
        icon: 'drawable-icon',
        smallIcon: 'drawable-icon'
      });
    }
  }

  scheduleAllNotifications() {
    for (let i = 0; i < this.cases.length; i++) {
      if (
        !this.cases[i].isFinished &&
        this.cases[i].caseDateTime
      ) {
        this.scheduleNotification(this.cases[i]);
      }
    }
  }

  deleteNotification(caseId) {
    this.localNotifications.clear(caseId);
  }

  deleteAllNotifications() {
    // this.localNotifications.clearAll();
    for (let i = 0; i < this.cases.length; i++) {
      if (
        !this.cases[i].isFinished &&
        this.cases[i].caseDateTime
      ) {
        this.localNotifications.clear(this.cases[i].id);
      }
    }
  }

  /*setSound() {
    if (this.platform.is('android')) {
      return 'file://assets/sounds/shame.mp3'
    } else {
      return 'file://assets/sounds/bell.mp3'
    }
  }*/

  getLastCaseId() {
    this.getDataAcync('lastCaseId')
    .then(data => {
      this.lastCaseId = data ? +data : 0;
    })
  }

  getTimeToDisplay(time) {
    let dateTimeFormatter = {
      hour12: this.isEnglishLocale,
      hour: '2-digit',
      minute:'2-digit'
    };

    let pickedTime = new Date(time).toLocaleTimeString('en-US', dateTimeFormatter);

    return pickedTime;
  }

  saveData(key: string, value) {
    this.storage.set(key, value);
  }

  async getDataAcync(key) {
    return await this.storage.get(key);
  }

  setUpData() {
    this.firstDayOfWeek = this.getMonday(this.actualDate);
    if (this.firstDayOfWeek) {
      this.setFirstDaysArray();
    }
  }

  setFirstDaysArray() {
    this.firstDaysOfWeeks = [];
    for (let i = -4; i < 5; i++) {
      this.firstDaysOfWeeks.push(this.addDays(7 * i));
    }
  }

  addDays(num) {
    let date = new Date(
      this.firstDayOfWeek.getFullYear(),
      this.firstDayOfWeek.getMonth(),
      this.firstDayOfWeek.getDate(),
      this.firstDayOfWeek.getDay()
    );
    return new Date(date.setDate(date.getDate() + num));
  }

  getMonday( date ) {
      var day = date.getDay() || 7;
      if( day !== 1 )
          date.setHours(-24 * (day - 1));
      return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getDay());
  }

  getFirstDayOfWeek(): Date {
    return this.firstDayOfWeek;
  }

  getFirstDaysOfWeeks(): Date[] {
    return this.firstDaysOfWeeks;
  }

  getDate(weekFirstDay, n): Date {
    // let todayMillis = Date.now() + n * 1000 * 3600 * 24;
    let currentWeekFirstDay = weekFirstDay || this.firstDayOfWeek;
    this.setNoneHour(currentWeekFirstDay);
    let curDate = currentWeekFirstDay.setDate(currentWeekFirstDay.getDate());
    let date: Date = new Date(curDate + n * 24 * 3600 * 1000);
    return date;
  }

  setNoneHour(date) {
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
  }

  getPickedDate(caseDateS) {
    let pickedDate = new Date(Date.parse(caseDateS.toString()));

    pickedDate.setHours(0);
    pickedDate.setMinutes(0);
    pickedDate.setSeconds(0);
    pickedDate.setMilliseconds(0);

    return pickedDate;
  }

  getPickedTime(caseDateS, caseTimeS) {
    let pickedDate = new Date(Date.parse(caseDateS));
    let pickedTime = new Date(Date.parse(caseTimeS.toString()));

    pickedDate.setHours(pickedTime.getHours());
    pickedDate.setMinutes(pickedTime.getMinutes());

    return pickedDate;
  }

  getOutputDate(date: Date): string {
    let options = {
        month: 'short',
        day: 'numeric',
        weekday: 'short',
    };
    let locale = this.isEnglishLocale ? 'en' : 'ru';

    return this.capitalize(new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getDay()).toLocaleDateString(locale, options));
  }

  capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  setCaseParams(caseParams) {
    this.caseParams = caseParams;
  }

  getCaseParams() {
    return this.caseParams;
  }

  setCases(cases) {
    this.cases = cases;
  }

  setCasesMap(casesMap) {
    this.casesMap = casesMap;
    this.setNumberOfTodayCases();
  }

  setNumberOfTodayCases() {
    let date:Date = new Date();
    this.setNoneHour(date);
    let todayCasesNumber:number = this.casesMap[date + ''] ?
      this.casesMap[date + ''].filter(caseToProcess => {
        return !caseToProcess.isFinished;
      }).length :
      0;
    if (this.appSettings.badgesOn) {
      if (todayCasesNumber > 0) {
        this.badge.set(todayCasesNumber);
      } else {
        this.badge.clear();
      }
    }
  }

  switchBadgesMode() {
    if (this.appSettings.badgesOn) {
      this.setNumberOfTodayCases();
    } else {
      this.badge.clear();
    }
  }

  getCasesMap() {
    return this.casesMap;
  }

  redirectToCasePage(isCreationMode, caseEvent) {
    let caseParams = {
      firstDayOfWeek: caseEvent.firstDayOfWeek || this.getMonday(new Date(caseEvent.caseDate)),
      isCreationMode: isCreationMode,
      caseDate: caseEvent.date || new Date(caseEvent.caseDate),
      caseDateTime: caseEvent.caseDateTime || new Date(caseEvent.caseDateTime),
      caseDateTimeInPicker: caseEvent.caseDateTimeInPicker,
      previousCaseDate: caseEvent.previousCaseDate || new Date(caseEvent.caseDate),
      case: caseEvent,
      description: caseEvent.description || '',
      isFinished: caseEvent.isFinished || false,
      comeFromCasesManager: caseEvent.comeFromCasesManager
    };

    this.setCaseParams(caseParams);

    this.navCtrl.navigateForward('case', {
      animated: true,
      animationDirection: 'forward'
    });
  }

  processCase(caseEvent) {
    let caseId;
    let finalCase;

    let date = new Date(caseEvent.caseDate);
    this.setNoneHour(date);
    let prevDate;
    let datesArray = [date.toDateString()];

    let casesArray = this.casesMap[date + ''] || [];

    if (caseEvent.previousCaseDate && !caseEvent.isCreationMode) {
      prevDate = new Date(caseEvent.previousCaseDate);
      this.setNoneHour(prevDate);
      datesArray.push(prevDate.toDateString());

      casesArray = this.casesMap[prevDate + ''] || [];
    }

    if (caseEvent.isCreationMode) {
      caseId = this.lastCaseId + 1;
      this.lastCaseId += 1;
      this.saveData('lastCaseId', caseId);
      finalCase = new Case(
        caseId,
        caseEvent.caseDate,
        caseEvent.isFinished,
        caseEvent.description,
        caseEvent.caseDateTime,
        caseEvent.caseDateTimeInPicker
      );
      this.cases.push(finalCase);

      casesArray.push(finalCase);
      this.casesMap[date + ''] = casesArray;
    } else {
      caseId = caseEvent.id;
      let oldCase = this.cases.find(cs => cs.id == caseId);
      let index = this.cases.indexOf(oldCase);
      finalCase = new Case(
        caseId,
        caseEvent.caseDate,
        caseEvent.isFinished,
        caseEvent.description,
        caseEvent.caseDateTime,
        caseEvent.caseDateTimeInPicker
      );
      this.cases[index] = finalCase;

      if (caseEvent.previousCaseDate) {
        casesArray = casesArray.filter(cs => cs.id !== caseEvent.id);
        let targetArray = this.casesMap[date + ''] || [];
        if (targetArray.length > 0) {
          targetArray = targetArray.filter(cs => cs.id !== caseEvent.id);
        }

        targetArray.push(finalCase);

        this.casesMap[prevDate + ''] = casesArray;
        this.casesMap[date + ''] = targetArray;
      } else {
        let caseToUpdateInMap = casesArray.find(ev => ev.id == caseId);
        let indexInMap = casesArray.indexOf(caseToUpdateInMap);
        casesArray[indexInMap] = finalCase;

        this.casesMap[date + ''] = casesArray;
      }

    }
    this.updateDayCardComponent(datesArray);
    if (caseEvent.comeFromCasesManager) {
      this.updateCasesManagerPage();
    }
    this.saveCases(this.cases);

    if (this.appSettings.notificationsEnabled) {
      if (!caseEvent.isCreationMode) {
        this.deleteNotification(caseId);
      }
      if (
        !finalCase.isFinished &&
        finalCase.caseDateTime
      ) {
        this.scheduleNotification(finalCase);
      }
    }
    this.setNumberOfTodayCases();
  }

  updateCasesManagerPage() {
    this.eventEmitter.publish('updateCasesManagerPage');
  }

  updateDayCardComponent(dateArray) {
    this.eventEmitter.publish('updateDayCardComponent', dateArray);
  }

  deleteCase(caseEvent) {
    let date = new Date(caseEvent.caseDate);
    this.setNoneHour(date);
    this.casesMap[date + ''] = this.casesMap[date + ''].filter(cs => cs.id !== caseEvent.id);
    this.cases = this.cases.filter(cs => cs.id !== caseEvent.id);
    this.saveCases(this.cases);
    this.updateDayCardComponent([date.toDateString()]);

    if (
      this.appSettings.notificationsEnabled &&
      caseEvent.caseDateTime
    ) {
      this.deleteNotification(caseEvent.id);
    }
    this.setNumberOfTodayCases();
  }

  deleteArrayOfCases(casesIds) {
    let arrayOfCases = this.cases.filter(cs => casesIds.indexOf(cs.id) != -1);
    if (arrayOfCases && arrayOfCases.length > 0) {
      for(let i = 0; i < arrayOfCases.length; i++) {
        this.deleteCase(arrayOfCases[i]);
      }
    }
  }

  saveCases(cases) {
    this.saveData('plannedCases', JSON.stringify(cases));
  }

  saveStandingTasks(tasks) {
    this.saveData('standingTasks', JSON.stringify(tasks));
  }

}
