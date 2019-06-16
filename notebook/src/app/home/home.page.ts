import {Component, Injectable, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CommonService} from "../shared/common.service";
import {Events, IonSlides, MenuController, NavController} from "@ionic/angular";
import {TranslationService} from "../shared/translation-service.service";

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

  slideOpts = {
    initialSlide: this.commonService.defaultSlide,
    allowTouchMove: false,
    speed: 400
  };

  mondayString: string;
  sundayString: string;

  // Calendar

  constructor(
    private commonService: CommonService,
    private eventEmitter: Events,
    private navCtrl: NavController,
    private menu: MenuController,
    private translationService: TranslationService
  ) {
    let self = this;
    eventEmitter.subscribe('updateHomePage', function(args) {
      let date: Date = args[0];
      commonService.actualDate = date;
      commonService.setUpData();
      self.prepareData(false);
      self.prepareTranslation();
    });
    eventEmitter.subscribe('updateDates', function(args) {
      self.setDatesToDisplay(self.commonService.currentSlide);
    });
  }

  menuString: string;
  homeString: string;
  calendarString: string;
  manageCasesString: string;
  myNotesString: string;
  settingsString: string;

  prepareTranslation() {
    this.menuString = this.translationService.phrases['Menu'];
    this.homeString = this.translationService.phrases['Home'];
    this.calendarString = this.translationService.phrases['Calendar'];
    this.manageCasesString = this.translationService.phrases['Manage Cases'];
    this.myNotesString = this.translationService.phrases['My Notes'];
    this.settingsString = this.translationService.phrases['Settings'];
  }
  ngOnInit() {
    this.prepareData(true);
    this.slideOpts.allowTouchMove = true;
    this.commonService.slides = this.slides;

    this.prepareTranslation();
    this.menu.toggle();
  }
  ngOnDestroy() {
    this.eventEmitter.unsubscribe('updateHomePage');
    this.eventEmitter.unsubscribe('updateDates');
  }
  clickMenu() {
    this.menu.open('first')
  }

  setDatesToDisplay(slideNumber) {
    let mondayDate = this.firstDaysOfWeeks[slideNumber];
    let tmpMondayArray = mondayDate.toDateString().split(' ').slice(1);
    this.mondayString = this.commonService.isEnglishLocale ?
      tmpMondayArray.join(' ') :
      (
        tmpMondayArray[1] + ' ' +
        this.translationService.phrases[tmpMondayArray[0]] + ' ' +
        tmpMondayArray[2]
      );
    let tempDateMls = mondayDate;
    let tempDate = new Date(
      mondayDate.getFullYear(),
      mondayDate.getMonth(),
      mondayDate.getDate()
    );
    tempDate.setDate(tempDate.getDate() + 6);
    let tmpSundayArray = tempDate.toDateString().split(' ').slice(1);
    this.sundayString = this.commonService.isEnglishLocale ?
      tmpSundayArray.join(' ') :
      (
        tmpSundayArray[1] + ' ' +
        this.translationService.phrases[tmpSundayArray[0]] + ' ' +
        tmpSundayArray[2]
      );
  }

  prepareData(isInitial) {
    this.firstDayOfWeek = this.commonService.getFirstDayOfWeek();
    this.firstDaysOfWeeks = this.commonService.getFirstDaysOfWeeks();

    if (isInitial) {
      let getDataPromise = this.commonService.getDataAcync('plannedCases');
      Promise.all([getDataPromise])
        .then(data => {
          let casesArrayString = data[0];
          this.cases = casesArrayString
            ? JSON.parse(casesArrayString)
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
            this.commonService.setCases(this.cases);
            this.commonService.setCasesMap(casesMap);
          }
          this.commonService.isInitialized = true;
          this.eventEmitter.publish('loadSlide', this.commonService.currentSlide, true);
        })
    } else {
      this.eventEmitter.publish('loadSlide', this.commonService.currentSlide, true);
    }
    this.setDatesToDisplay(this.commonService.currentSlide);
  }

  slideChanged(setDefault) {
    this.commonService.slideChanged(setDefault);
  }

  async changeDate(leaveMenu) {
    this.commonService.changeDate();
    if (!leaveMenu) {
      this.closeMenu();
    }
  }

  startChangeSlider() {
    if (!this.commonService.surroundSlidesLoaded) {
      this.commonService.surroundSlidesLoaded = true;
      this.eventEmitter.publish('loadSlide', this.commonService.currentSlide, false);
    }
  }
  closeMenu() {
    this.menu.toggle();
  }

  goHome() {
    this.commonService.slideChanged(true);
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
  async openSettingsPage() {
    this.navCtrl.navigateForward('settings-page', {
      animated: true,
      animationDirection: 'forward'
    });
    this.closeMenu();
  }
}
