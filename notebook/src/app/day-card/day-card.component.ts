import {Component, Input, OnDestroy, OnInit, Output} from '@angular/core';

import {Case} from "../models/case";
import {CommonService} from "../shared/common.service";
import {ActionSheetController, AlertController, Events, NavController} from "@ionic/angular";
import {TranslationService} from "../shared/translation-service.service";

@Component({
  selector: 'app-day-card',
  templateUrl: './day-card.component.html',
  styleUrls: ['./day-card.component.scss'],
})
export class DayCardComponent implements OnInit, OnDestroy {

  constructor(
    private commonService: CommonService,
    private navCtrl: NavController,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private eventEmitter: Events,
    private translationService: TranslationService
  ) {
    eventEmitter.subscribe('updateDayCardComponent', (datesArray: string[]) => {
      if (this.isLoaded && datesArray.indexOf(this.date.toDateString()) != -1) {
        this.prepareData();
      }
    });
    eventEmitter.subscribe('loadSlide', (slideNumber: number, isInitial: boolean) => {
      if (!this.isLoaded) {
        if (
          isInitial &&
          this.slideNumber == 4
        ) {
          this.prepareData();
        } else if (
          !isInitial &&
          (
            this.slideNumber == slideNumber + 1 ||
            this.slideNumber == slideNumber - 1
          )
        ) {
          this.prepareData();
        }
      }
    });
  }

  cases: Case[] = [];

  @Input()
  firstDayOfWeek: Date;
  @Input()
  slideNumber: number;

  @Input()
  dayNum: number;

  @Input()
  num: number;

  date: Date;
  progressStatus: string = 'success';
  progress: number = 1;
  message: string = this.translationService.phrases['No cases planned'];
  isDoneValue: boolean = false;
  caseDateS: Date;

  isLoaded: boolean = false;
  showCases: boolean = false;

  ngOnInit() {
    if (this.slideNumber == 4 && this.commonService.isInitialized) {
      this.prepareData();
    }
  }

  ngOnDestroy() {
    this.eventEmitter.unsubscribe('updateDayCardComponent');
    this.eventEmitter.unsubscribe('loadSlide');
  }

  updateDayCardComponent(newDate) {
    this.eventEmitter.publish('updateDayCardComponent', this.commonService.cameFromFirstDayOfWeek, newDate);
  }

 async showMenu(caseEvent) {
    this.commonService.caseParams = caseEvent;

    let actionSheetParams = {
      header: this.commonService.caseParams.description,
      backdropDismiss: true,
      buttons: [
        {
          text: this.translationService.phrases['Mark as ' + (this.commonService.caseParams.isFinished ? 'Uncompleted' : 'Completed')],
          icon: 'checkmark',
          handler: () => {
            this.commonService.caseParams.isFinished = !this.commonService.caseParams.isFinished;
            this.updateCase(null);
          }
        }, {
          text: this.translationService.phrases['View/Edit'],
          icon: 'settings',
          handler: () => {
            this.redirectToCasePage(false, this.commonService.caseParams);
          }
        }, {
          text: this.translationService.phrases['Change Date'],
          icon: 'calendar',
          handler: () => {
            this.commonService.cameFromFirstDayOfWeek = this.date;
            let datePicker = document.getElementById('datePicker');
            datePicker.click();
          }
        }, {
          text: this.translationService.phrases['Delete'],
          role: 'destructive',
          icon: 'trash',
          handler: () => {
            this.showAlert(this.commonService.caseParams);
          }
        }, {
          text: this.translationService.phrases['Cancel'],
          icon: 'close',
          role: 'cancel',
          handler: () => {
          }
        }]
    };
    if (caseEvent.caseDateTime && caseEvent.timeToDisplay) {
      actionSheetParams.header = caseEvent.timeToDisplay;
      actionSheetParams['subHeader'] = this.commonService.caseParams.description;
    } else {
      actionSheetParams.header = this.commonService.caseParams.description;
    }
    const actionSheet = await this.actionSheetController.create(actionSheetParams);
    await actionSheet.present();
  }

  prepareData() {
    this.date = this.commonService.getDate(this.firstDayOfWeek, this.dayNum);
    this.cases = this.commonService.casesMap[this.date + ''] || [];

    let isFinished: number = this.cases.filter(caseEvent => {
      if (caseEvent.caseDateTime) {
        caseEvent['timeToDisplay'] = this.commonService.getTimeToDisplay(new Date(caseEvent.caseDateTime));
      }
      return caseEvent.isFinished;
    }).length;
    this.progress = isFinished / this.cases.length;
    if (this.progress == 1) {
      this.message = this.translationService.phrases['Active cases left'] + ': ' + (this.cases.length - this.cases.length) + '/' + this.cases.length;
    } else if (this.cases.length == 0) {
      this.progress = 1;
      this.message = this.translationService.phrases['No cases planned'];
    } else {
      this.message = this.translationService.phrases['Active cases left'] + ': ' + (this.cases.length - isFinished) + '/' + this.cases.length;
    }
    this.progressStatus =
      this.progress == 1
        ? 'success'
        : this.progress > 0.7
        ? 'primary'
        : this.progress > 0.3
          ? 'secondary'
          : 'warning'
    ;
    this.isLoaded = true;

  }

  switchShowCasesMode() {
    this.showCases = !this.showCases;
  }

  redirectToCasePage(isCreationMode, caseEvent) {
    let caseParams = {
      firstDayOfWeek: this.firstDayOfWeek,
      isCreationMode: isCreationMode,
      date: this.date,
      previousCaseDate: caseEvent ? caseEvent.caseDate : this.date,
      caseDateTime: caseEvent ? caseEvent.caseDateTime : null,
      description: caseEvent ? caseEvent.description : '',
      isFinished: caseEvent ? caseEvent.isFinished : false,
      id: caseEvent ? caseEvent.id : ''
    };

    if (isCreationMode) {
      this.switchShowCasesMode();
    }

    this.commonService.redirectToCasePage(isCreationMode, caseParams);
  }

  changeDate() {
    let caseDate = this.commonService.getPickedDate(this.caseDateS);
    this.commonService.caseParams.previousCaseDate = this.commonService.caseParams.caseDate;
    this.commonService.caseParams.caseDateTime = null;
    this.commonService.caseParams.caseDate = caseDate;
    this.updateCase(null);
  }

  updateCase(caseEvent) {
    this.commonService.processCase(caseEvent || this.commonService.caseParams);
  }

  deleteCase(caseEvent) {
    this.commonService.deleteCase(caseEvent);
  }

  async showAlert(caseEvent) {
    const alert = await this.alertController.create({
      message: this.translationService.phrases['Are you sure you want to delete this case?'],
      buttons: [
        {
          text: this.translationService.phrases['Yes'],
          handler: () => {
            this.deleteCase(caseEvent);
          }
        }, {
          text: this.translationService.phrases['No'],
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
          }
        }
      ]
    });

    await alert.present();
  }

}
