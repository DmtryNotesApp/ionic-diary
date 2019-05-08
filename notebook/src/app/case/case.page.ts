import {Component, OnInit} from '@angular/core';
import {NavController} from "@ionic/angular";
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
  displayDate;
  comeFromCasesManager: boolean = false;

  constructor(public navCtrl: NavController, public commonService: CommonService) {}

  changeDate () {
    let pickedDate = this.commonService.getPickedDate(this.caseDateS);

    this.caseOptions.caseDate = pickedDate;
    this.setDisplayDate(pickedDate);
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
      isFinished: this.isFinished,
      isCreationMode: this.caseOptions.isCreationMode,
      id: this.id,
      comeFromCasesManager: this.comeFromCasesManager
    });
    this.caseDescription = '';
    this.isFinished = false;
    this.goBack();
  }

  setDisplayDate(date) {
    let options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      timezone: 'UTC'
    };
    this.displayDate = date.toLocaleDateString('en-US', options);
  }

  goBack() {
    let url = this.comeFromCasesManager ? 'cases-manager' : 'home';
    this.navCtrl.navigateBack(url, {
        animated: true,
        animationDirection: 'back'
    });
  }

}
