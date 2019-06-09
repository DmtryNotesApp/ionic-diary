import {Component, OnInit} from '@angular/core';
import {AlertController, NavController} from "@ionic/angular";
import {CommonService} from "../shared/common.service";

@Component({
  selector: 'app-case',
  templateUrl: './case.page.html',
  styleUrls: ['./case.page.scss'],
})
export class CasePage implements OnInit {

  firstDayOfWeek: Date;
  caseDescription: string;
  isFinished: boolean;
  caseOptions;
  case;
  id;
  caseDate: Date;
  previousCaseDate: Date;
  caseDateS: Date;
  caseTimeS: Date;
  caseTime: string;
  caseDateTimeS: Date;
  displayDate;
  comeFromCasesManager: boolean = false;
  showTime: boolean = false;

  constructor(
    private navCtrl: NavController,
    private commonService: CommonService,
    private alertController: AlertController
  ) {}

  changeDate() {
    let pickedDate = this.commonService.getPickedDate(this.caseDateS);

    this.caseOptions.caseDate = pickedDate;
    this.setDisplayDate(pickedDate);
  }

  changeTime() {
    let pickedTime = this.commonService.getPickedTime(this.caseOptions.caseDate, this.caseTimeS);

    this.setDisplayTime(pickedTime);
  }

  setDisplayTime(time) {
    this.caseTime = this.commonService.getTimeToDisplay(time);
  }

  ngOnInit() {
    this.caseOptions = this.commonService.getCaseParams();
    if (this.caseOptions) {
      this.firstDayOfWeek = this.caseOptions.firstDayOfWeek;
      this.case = this.caseOptions.case;
      this.comeFromCasesManager = this.caseOptions.comeFromCasesManager;

      this.setDisplayDate(this.caseOptions.caseDate);

      if (this.case) {
        if (this.caseOptions && this.caseOptions.case) {
          this.isFinished = this.caseOptions.case.isFinished;
          this.caseDescription = this.caseOptions.case.description;
          this.id = this.caseOptions.case.id;
          this.showTime = this.caseOptions.case.caseDateTime != null && this.caseOptions.case.caseDateTime != undefined;
          if (this.caseOptions.case.caseDateTime) {
            this.caseTimeS = this.caseOptions.case.caseDateTime;
            this.setDisplayTime(this.caseOptions.case.caseDateTime);
          }
        }
        this.previousCaseDate = this.caseOptions.previousCaseDate;
      }
    }
  }

  saveCase() {
    let date = this.commonService.getDate(this.firstDayOfWeek,6);
    this.commonService.processCase({
      description: this.caseDescription,
      caseDate: this.caseOptions.caseDate,
      previousCaseDate: this.previousCaseDate,
      caseDateTime: (this.showTime && this.caseTime != null) ?
        this.commonService.getPickedTime(this.caseOptions.caseDate, this.caseTimeS) :
        null,
      isFinished: this.isFinished,
      isCreationMode: this.caseOptions.isCreationMode,
      id: this.id,
      comeFromCasesManager: this.comeFromCasesManager
    });
    this.caseDescription = '';
    this.isFinished = false;
    this.goBack();
  }

  deleteCase() {
    this.commonService.deleteCase({
      id: this.id,
      caseDate: this.caseOptions.caseDate
    });
    this.goBack();
  }

  async showDeleteAlert() {
    const alert = await this.alertController.create({
      header: 'Confirm Action',
      message: 'Are you sure you want to delete this case?',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            this.deleteCase();
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

  setDisplayDate(date) {
    let options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      timezone: 'UTC'
    };
    let locale = this.commonService.isEnglishLocale ? 'en-US' : 'ru-RU';
    this.displayDate = this.commonService.capitalize(date.toLocaleDateString(locale, options));
  }

  goBack() {
    let url = this.comeFromCasesManager ? 'cases-manager' : 'home';
    this.navCtrl.navigateBack(url, {
        animated: true,
        animationDirection: 'back'
    });
  }

}
