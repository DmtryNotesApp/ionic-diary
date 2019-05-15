import {Component, Input, OnDestroy, OnInit, Output} from '@angular/core';

import {Case} from "../models/case";
import {CommonService} from "../shared/common.service";
import {ActionSheetController, AlertController, Events, NavController} from "@ionic/angular";

@Component({
  selector: 'app-day-card',
  templateUrl: './day-card.component.html',
  styleUrls: ['./day-card.component.scss'],
})
export class DayCardComponent implements OnInit, OnDestroy {

  constructor(
    public commonService: CommonService,
    public navCtrl: NavController,
    public actionSheetController: ActionSheetController,
    public alertController: AlertController,
    public eventEmitter: Events
  ) {
    eventEmitter.subscribe('updateDayCardComponent', (datesArray: string[]) => {
      if (datesArray.indexOf(this.date.toDateString()) != -1) {
        console.log('updateDayCardComponent');
        this.prepareData();
      }
    });
    eventEmitter.subscribe('loadSlide', (slideNumber: number, isInitial: boolean) => {
      if (!this.isLoaded) {
        if (
          isInitial &&
          this.slideNumber == 4
        ) {
          console.log('loadSlide initial');
          this.prepareData();
        } else if (
          !isInitial &&
          (
            this.slideNumber == slideNumber + 1 ||
            this.slideNumber == slideNumber - 1
          )
        ) {
          console.log('loadSlide not initial');
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

  date: Date = new Date();
  progressStatus: string = 'success';
  progress: number = 1;
  message: string = 'No cases planned';
  isDoneValue: boolean = false;
  caseDateS: Date;

  isLoaded: boolean = false;
  showCases: boolean = false;

  ngOnInit() {
    if (this.slideNumber == 4) {
      console.log('day-card ngOnInit');
      this.prepareData();
    }
  }

  ngOnDestroy() {
    this.eventEmitter.unsubscribe('updateDayCardComponent');
  }

  updateDayCardComponent(newDate) {
    this.eventEmitter.publish('updateDayCardComponent', this.commonService.cameFromFirstDayOfWeek, newDate);
  }

 async showMenu(caseEvent) {
    this.commonService.caseParams = caseEvent;
    const actionSheet = await this.actionSheetController.create({
      header: this.commonService.caseParams.description,
      backdropDismiss: true,
      buttons: [
        {
          text: 'Mark as ' + (this.commonService.caseParams.isFinished ? 'Uncompleted' : 'Completed'),
          icon: 'checkmark',
          handler: () => {
            this.commonService.caseParams.isFinished = !this.commonService.caseParams.isFinished;
            this.updateCase(null);
          }
        }, {
        text: 'View/Edit',
        icon: 'settings',
        handler: () => {
          this.redirectToCasePage(false, this.commonService.caseParams);
        }
      }, {
        text: 'Change Date',
        icon: 'calendar',
        handler: () => {
          this.commonService.cameFromFirstDayOfWeek = this.date;
          let datePicker = document.getElementById('datePicker');
          datePicker.click();
        }
      }, {
          text: 'Delete',
          role: 'destructive',
          icon: 'trash',
          handler: () => {
            this.showAlert(this.commonService.caseParams);
          }
        }, {
        text: 'Cancel',
        icon: 'close',
        role: 'cancel',
        handler: () => {
        }
      }]
    });
    await actionSheet.present();
  }

  prepareData() {
    console.log('prepareData');
    this.date = this.commonService.getDate(this.firstDayOfWeek, this.dayNum);
    this.cases = this.commonService.casesMap[this.date + ''] || [];

    let isFinished: number = this.cases.filter(caseEvent => caseEvent.isFinished).length;
    this.progress = isFinished / this.cases.length;
    if (this.progress == 1) {
      this.message = 'None active of ' + this.cases.length + ' cases left'
    } else if (this.cases.length == 0) {
      this.progress = 1;
      this.message = 'No cases planned';
    } else {
      this.message = this.cases.length - isFinished + ' active of ' + this.cases.length + ' cases left';
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
    console.log(this.slideNumber);
    console.log(new Date().getTime());
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
      header: 'Confirm Action',
      message: 'Are you sure you want to delete this case?',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            this.deleteCase(caseEvent);
          }
        }, {
          text: 'No',
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
